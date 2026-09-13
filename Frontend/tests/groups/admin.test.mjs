import { ok, skip, request, registerUser, postBody } from "../lib.mjs";

// Admin tests need real admin credentials (there is no public endpoint to mint
// an admin role). Provide them via TRISHIT_ADMIN_EMAIL / TRISHIT_ADMIN_PASSWORD.
export async function testAdmin() {
  const g = "Admin";
  const adminEmail = process.env.TRISHIT_ADMIN_EMAIL;
  const adminPass = process.env.TRISHIT_ADMIN_PASSWORD;

  const normal = await registerUser("adjNormal");

  // Normal user is blocked from all admin endpoints (403)
  const endpoints = [
    ["users", "/api/admin/users", "GET"],
    ["posts", "/api/admin/posts", "GET"],
    ["reports", "/api/admin/reports", "GET"],
    ["stats", "/api/admin/stats", "GET"],
  ];
  for (const [label, path, method] of endpoints) {
    const r = await request(method, path, undefined, normal.rec.token);
    ok(g, `normal user blocked from admin ${label} (403)`, 403, r.status);
  }

  if (!adminEmail || !adminPass) {
    skip(g, "admin functional tests", "no TRISHIT_ADMIN_EMAIL/PASSWORD provided");
    return;
  }

  // Admin login
  const login = await request("POST", "/api/auth/login", { email: adminEmail, password: adminPass });
  if (login.status !== 200 || !login.data?.token) {
    skip(g, "admin functional tests", "admin login failed");
    return;
  }
  const tk = login.data.token;
  ok(g, "admin login works", 200, login.status);
  ok(g, "admin role is admin", "admin", login.data?.user?.role);

  // Admin users list
  const users = await request("GET", "/api/admin/users", undefined, tk);
  ok(g, "admin list users 200", 200, users.status);
  ok(g, "admin users include our normal user", "present", (users.data?.users || []).some((u) => u.username === normal.rec.username));

  // Suspend normal user
  const suspend = await request("PATCH", `/api/admin/users/${normal.rec.user?._id}/suspend`, undefined, tk);
  ok(g, "admin suspend user 200", 200, suspend.status);
  const usersAfter = await request("GET", "/api/admin/users", undefined, tk);
  const suspended = (usersAfter.data?.users || []).find((u) => u._id === normal.rec.user?._id);
  ok(g, "user marked suspended", true, suspended?.suspended === true);

  // Admin posts
  const posts = await request("GET", "/api/admin/posts", undefined, tk);
  ok(g, "admin list posts 200", 200, posts.status);

  // Create a post then admin-deletes it
  const victim = await registerUser("adjVictim");
  const victimPost = await request("POST", "/api/posts", postBody("sell"), victim.rec.token);
  const vId = victimPost.data?.post?._id;
  if (vId) {
    const del = await request("DELETE", `/api/admin/posts/${vId}`, undefined, tk);
    ok(g, "admin deletes post 200", 200, del.status);
    const gone = await request("GET", `/api/posts/${vId}`);
    ok(g, "admin-deleted post unavailable", 404, gone.status);
  }

  // Admin stats
  const stats = await request("GET", "/api/admin/stats", undefined, tk);
  ok(g, "admin stats 200", 200, stats.status);
  ok(g, "stats users.total number", "number", typeof stats.data?.stats?.users?.total === "number");
  ok(g, "stats posts.total number", "number", typeof stats.data?.stats?.posts?.total === "number");
  ok(g, "stats posts.active number", "number", typeof stats.data?.stats?.posts?.active === "number");
  ok(g, "stats reports.pending number", "number", typeof stats.data?.stats?.reports?.pending === "number");

  // Admin reports list + resolve
  const reports = await request("GET", "/api/admin/reports?status=pending", undefined, tk);
  ok(g, "admin list reports 200", 200, reports.status);
  const pendingReport = (reports.data?.reports || [])[0];
  if (pendingReport?._id) {
    const resolve = await request("PATCH", `/api/admin/reports/${pendingReport._id}/resolve`, { adminNote: "E2E resolved" }, tk);
    ok(g, "admin resolve report 200", 200, resolve.status);
  } else {
    ok(g, "admin resolve report (none pending)", "skipped", "no pending reports");
  }
}