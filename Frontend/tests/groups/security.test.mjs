import { ok, skip, request, registerUser, postBody } from "../lib.mjs";

// Cross-user security checks (some overlap with earlier groups, kept explicit here).
export async function testSecurity() {
  const g = "Security";

  const a = await registerUser("secA");
  const b = await registerUser("secB");
  const postRes = await request("POST", "/api/posts", postBody("sell"), a.rec.token);
  const postId = postRes.data?.post?._id;

  if (!a.rec.token || !b.rec.token) { skip(g, "security", "no tokens"); return; }

  if (postId) {
    const edit = await request("PUT", `/api/posts/${postId}`, postBody("sell", { title: "intruder" }), b.rec.token);
    ok(g, "A cannot be edited by B (403)", 403, edit.status);

    const del = await request("DELETE", `/api/posts/${postId}`, undefined, b.rec.token);
    ok(g, "A's post cannot be deleted by B (403)", 403, del.status);

    const status = await request("PATCH", `/api/posts/${postId}/status`, { status: "sold" }, b.rec.token);
    ok(g, "A's post status cannot change by B (403)", 403, status.status);
  }

  // B favorites A's post, A should never see B's favorite
  if (postId) {
    await request("POST", `/api/favorites/${postId}`, undefined, b.rec.token);
    const aFavs = await request("GET", "/api/favorites", undefined, a.rec.token);
    const leak = (aFavs.data?.favorites || []).some((f) => (f.post?._id || f.post) === postId);
    ok(g, "A does not see B's favorite", false, !!leak);
  }

  // Notifications isolation
  const aNotifs = await request("GET", "/api/notifications", undefined, a.rec.token);
  const bNotifs = await request("GET", "/api/notifications", undefined, b.rec.token);
  const crossNotif = (aNotifs.data?.notifications || []).some((n) => n.recipient === b.rec.user?._id);
  ok(g, "A does not see B's notifications", false, !!crossNotif);

  // Admin endpoints off-limits for normal user
  const adminPage = await request("GET", "/api/admin/stats", undefined, b.rec.token);
  ok(g, "normal user blocked from admin (403)", 403, adminPage.status);
}