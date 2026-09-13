import { ok, skip, request, registerUser, postBody } from "../lib.mjs";

export async function testMessaging() {
  const g = "Messaging";

  const owner = await registerUser("msgOwner");
  const buyer = await registerUser("msgBuyer");
  const stranger = await registerUser("msgStranger");
  const postRes = await request("POST", "/api/posts", postBody("sell"), owner.rec.token);
  const postId = postRes.data?.post?._id;

  if (!owner.rec.token || !buyer.rec.token || !postId) { skip(g, "messaging", "missing setup"); return; }

  // Buyer creates conversation
  const conv = await request("POST", "/api/conversations", { postId }, buyer.rec.token);
  const convId = conv.data?.conversation?._id;
  ok(g, "create conversation 201/200", 201, conv.status);
  ok(g, "conversation participants include buyer", "present", (conv.data?.conversation?.participants || []).some((p) => p._id === buyer.rec.user?._id));
  ok(g, "conversation participants include owner", "present", (conv.data?.conversation?.participants || []).some((p) => p._id === owner.rec.user?._id));
  ok(g, "conversation references post", postId, conv.data?.conversation?.post?._id || conv.data?.conversation?.post);

  // Owner cannot create conversation with self
  const selfConv = await request("POST", "/api/conversations", { postId }, owner.rec.token);
  ok(g, "owner cannot message self (400)", 400, selfConv.status);

  // Each user sees only their own conversations
  const ownerConvs = await request("GET", "/api/conversations", undefined, owner.rec.token);
  ok(g, "owner sees conversation", "present", (ownerConvs.data?.conversations || []).some((c) => c._id === convId));
  const strangerConvs = await request("GET", "/api/conversations", undefined, stranger.rec.token);
  ok(g, "stranger does not see conversation", "absent", !((strangerConvs.data?.conversations || []).some((c) => c._id === convId)));

  // Non-participant reading messages -> 403
  const strangerMsgs = await request("GET", `/api/conversations/${convId}/messages`, undefined, stranger.rec.token);
  ok(g, "non-participant reading messages 403", 403, strangerMsgs.status);

  // Participant reads messages (empty initially)
  const ownerMsgs = await request("GET", `/api/conversations/${convId}/messages`, undefined, owner.rec.token);
  ok(g, "participant reads messages 200", 200, ownerMsgs.status);

  return { convId, owner, buyer };
}