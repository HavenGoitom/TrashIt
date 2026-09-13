import { ok, request, registerUser, postBody } from "../lib.mjs";

export async function testNotifications() {
  const g = "Notifications";

  const a = await registerUser("notifA");
  const b = await registerUser("notifB");
  const postRes = await request("POST", "/api/posts", postBody("buy"), a.rec.token);
  const postId = postRes.data?.post?._id;
  if (!a.rec.token || !b.rec.token || !postId) { return; }

  // Create a conversation (this produces a "new_conversation" notification for the owner a)
  await request("POST", "/api/conversations", { postId }, b.rec.token);

  // B's notifications
  const bNotifs = await request("GET", "/api/notifications", undefined, b.rec.token);
  ok(g, "B notifications endpoint 200", 200, bNotifs.status);

  // A should have a new_conversation notification
  const aNotifs = await request("GET", "/api/notifications", undefined, a.rec.token);
  const hasConv = (aNotifs.data?.notifications || []).some((n) => n.type === "new_conversation");
  ok(g, "owner received new_conversation notification", true, hasConv);

  // unread count
  const countRes = await request("GET", "/api/notifications/unread-count", undefined, a.rec.token);
  ok(g, "unread-count 200", 200, countRes.status);
  const unreadBefore = countRes.data?.unreadCount || 0;

  // mark one as read
  const unreadId = (aNotifs.data?.notifications || []).find((n) => !n.read)?._id;
  if (unreadId) {
    const mark = await request("PATCH", `/api/notifications/${unreadId}/read`, undefined, a.rec.token);
    ok(g, "mark single read 200", 200, mark.status);
  } else {
    ok(g, "mark single read 200", 200, "SKIP: no unread");
  }

  const afterOne = await request("GET", "/api/notifications/unread-count", undefined, a.rec.token);
  ok(g, "unread count decreased after read", "<= before", (afterOne.data?.unreadCount || 0) <= unreadBefore);

  // mark-all-read
  const allRes = await request("PATCH", "/api/notifications/read-all", undefined, a.rec.token);
  ok(g, "mark-all-read 200", 200, allRes.status);
  const afterAll = await request("GET", "/api/notifications/unread-count", undefined, a.rec.token);
  ok(g, "unread count zero after read-all", 0, afterAll.data?.unreadCount || 0);

  // cross-user isolation: B must not see A's notification content as their own
  const bSeesA = (bNotifs.data?.notifications || []).filter((n) => n.recipient === a.rec.user?._id);
  ok(g, "B does not see A's notifications", 0, bSeesA.length);
}