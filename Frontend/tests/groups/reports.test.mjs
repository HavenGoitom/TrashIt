import { ok, skip, request, registerUser, postBody, RUN } from "../lib.mjs";

export async function testReports() {
  const g = "Reports";

  const reporter = await registerUser("repReporter");
  const target = await registerUser("repTarget");
  const owner = await registerUser("repOwner");
  const postRes = await request("POST", "/api/posts", postBody("sell"), owner.rec.token);
  const postId = postRes.data?.post?._id;

  if (!reporter.rec.token || !target.rec.token || !postId) { skip(g, "reports", "missing setup"); return; }

  // Report a post
  const reportPost = await request("POST", `/api/reports/post/${postId}`, { reason: "Spam " + RUN }, reporter.rec.token);
  ok(g, "report post 201/200", 201, reportPost.status);

  // Missing reason
  const noReason = await request("POST", `/api/reports/post/${postId}`, {}, reporter.rec.token);
  ok(g, "report missing reason fails", 400, noReason.status);

  // Invalid post id
  const badPost = await request("POST", "/api/reports/post/not-an-id", { reason: "x" }, reporter.rec.token);
  ok(g, "report invalid post id fails", 400, badPost.status);

  // Report a user
  const reportUser = await request("POST", `/api/reports/user/${target.rec.user?._id}`, { reason: "Inappropriate " + RUN }, reporter.rec.token);
  ok(g, "report user 201/200", 201, reportUser.status);

  // Invalid user id
  const badUser = await request("POST", "/api/reports/user/000000000000000000000000", { reason: "x" }, reporter.rec.token);
  ok(g, "report nonexistent user handled (no 500)", "not 500", badUser.status !== 500);

  // Unauthenticated
  const unauth = await request("POST", `/api/reports/post/${postId}`, { reason: "x" });
  ok(g, "report unauthenticated rejected", 401, unauth.status);

  // my reports
  const my = await request("GET", "/api/reports/my", undefined, reporter.rec.token);
  ok(g, "my reports 200", 200, my.status);
  ok(g, "my reports include post report", "present", (my.data?.reports || []).some((r) => r.targetType === "post"));

  // other user does not see reporter's reports
  const targetMy = await request("GET", "/api/reports/my", undefined, target.rec.token);
  const leaked = (targetMy.data?.reports || []).filter((r) => r.reporter?._id === reporter.rec.user?._id);
  ok(g, "another user does not see reporter's reports", 0, leaked.length);
}