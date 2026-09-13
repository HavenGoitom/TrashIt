import { ok, skip, request, registerUser, postBody, connectSocket, waitFor, RUN } from "../lib.mjs";

export async function testSockets() {
  const g = "Sockets";

  const owner = await registerUser("skOwner");
  const buyer = await registerUser("skBuyer");
  const stranger = await registerUser("skStranger");
  const postRes = await request("POST", "/api/posts", postBody("buy"), owner.rec.token);
  const postId = postRes.data?.post?._id;
  const convRes = await request("POST", "/api/conversations", { postId }, buyer.rec.token);
  const convId = convRes.data?.conversation?._id;

  if (!owner.rec.token || !buyer.rec.token || !stranger.rec.token || !convId) { skip(g, "sockets", "missing setup"); return; }

  // 1) Unauthenticated socket rejected
  const anon = connectSocket("");
  let anonErr = null;
  anon.on("connect_error", (e) => { anonErr = e.message || "connect_error"; });
  const anonRejected = await new Promise((resolve) => {
    const t = setTimeout(() => resolve(false), 2500);
    anon.on("connect", () => { clearTimeout(t); resolve(false); });
    anon.on("connect_error", () => { clearTimeout(t); resolve(true); });
  });
  ok(g, "unauthenticated socket rejected", true, anonRejected);

  // 2) Auth sockets join conversation room
  const sockBuyer = connectSocket(buyer.rec.token);
  const sockOwner = connectSocket(owner.rec.token);
  const buyerReady = await waitFor(() => sockBuyer.connected, 8000);
  const ownerReady = await waitFor(() => sockOwner.connected, 8000);
  ok(g, "buyer socket connects", true, buyerReady);
  ok(g, "owner socket connects", true, ownerReady);

  // 3) join_conversation + receive joined_conversation
  let joined = false;
  sockBuyer.on("joined_conversation", () => { joined = true; });
  sockBuyer.emit("join_conversation", { conversationId: convId });
  const joinedOk = await waitFor(() => joined, 4000);
  ok(g, "join_conversation acknowledged", true, joinedOk);

  // 4) send_message -> recipient gets new_message
  const received = new Promise((resolve) => {
    sockOwner.on("new_message", (msg) => resolve(msg));
    setTimeout(() => resolve(null), 8000);
  });
  sockBuyer.emit("send_message", { conversationId: convId, content: "Hello over socket " + RUN });
  const rmsg = await received;
  ok(g, "recipient receives new_message", "truthy message", !!rmsg);
  ok(g, "message content matches", "Hello over socket " + RUN, rmsg?.content);

  // 5) message persisted via API
  const msgs = await request("GET", `/api/conversations/${convId}/messages`, undefined, buyer.rec.token);
  ok(g, "sent message persisted", "persisted", (msgs.data?.messages || []).some((m) => m.content === "Hello over socket " + RUN));

  // 6) newcomer to conversation room: join, then join_conversation
  sockOwner.emit("join_conversation", { conversationId: convId });
  await waitFor(() => true, 200);

  // 7) User who is not a participant cannot join (gets error)
  let errMsg = null;
  const sockStranger = connectSocket(stranger.rec.token);
  await waitFor(() => sockStranger.connected, 8000);
  sockStranger.on("error", (e) => { errMsg = e?.message; });
  sockStranger.emit("join_conversation", { conversationId: convId });
  const errSeen = await waitFor(() => errMsg !== null, 4000);
  ok(g, "non-participant join rejected with error", true, errSeen);

  // 8) real-time new_notification for recipient (owner)
  const notif = new Promise((resolve) => {
    sockOwner.on("new_notification", (n) => resolve(n));
    setTimeout(() => resolve(null), 8000);
  });
  sockBuyer.emit("send_message", { conversationId: convId, content: "Notify check " + RUN });
  const rnotif = await notif;
  ok(g, "recipient receives new_notification", "truthy notification", !!rnotif);

  // Cleanup sockets
  try { sockBuyer.disconnect(); sockOwner.disconnect(); sockStranger.disconnect(); anon.disconnect(); } catch (e) {}
}