import { ok, request, registerUser, API_BASE } from "../lib.mjs";

// Emphasis: backend must return proper status codes and never crash on bad input.
export async function testErrors() {
  const g = "Error Handling";
  const { rec } = await registerUser("errUser");
  const tk = rec.token;

  const cases = [
    ["400 malformed status body", request("PATCH", "/api/posts/000000000000000000000000/status", { status: "x" }, tk)],
    ["401 bad auth header", request("GET", "/api/auth/me", undefined, "Bearer")],
    ["401 garbage token", request("GET", "/api/auth/me", undefined, "hello.world")],
    ["403 cross-user (no post, expect 403/404)", request("DELETE", "/api/posts/000000000000000000000000", undefined, tk)],
    ["404 unknown post detail", request("GET", "/api/posts/000000000000000000000000")],
    ["400 invalid objectId", request("GET", "/api/posts/zzzz")],
  ];

  for (const [name, p] of cases) {
    try {
      const r = await p;
      ok(g, name + " returned " + r.status + " (no crash)", "not 500", r.status !== 500);
    } catch (e) {
      ok(g, name + " request completed", "no throw", false);
    }
  }

  // Non-JSON body shouldn't crash (send raw text)
  try {
    const res = await fetch(API_BASE + "/api/posts", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "not json at all",
    });
    ok(g, "malformed JSON body handled (no 500)", "not 500", res.status !== 500);
  } catch (e) {
    ok(g, "malformed JSON body request completed", "no crash", false);
  }

  // Bad query parameter values
  const badPage = await request("GET", "/api/posts?page=abc&limit=-5");
  ok(g, "garbage pagination handled (no 500)", "not 500", badPage.status !== 500);
}