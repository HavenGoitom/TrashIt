import { ok, skip, request, registerUser } from "../lib.mjs";

export async function testAI() {
  const g = "AI";
  const { rec } = await registerUser("aiUser");
  if (!rec.token) { skip(g, "AI", "no token"); return; }

  // Valid request
  const ai = await request("POST", "/api/ai/what-could-i-make", { material: "wine bottles" }, rec.token);
  ok(g, "AI request 200", 200, ai.status);
  ok(g, "AI returns material echo", "wine bottles", ai.data?.material);
  const ideas = ai.data?.ideas || [];
  ok(g, "AI returns ideas array", "array", Array.isArray(ideas));

  if (Array.isArray(ideas) && ideas.length > 0) {
    const first = ideas[0];
    ok(g, "idea has title", "truthy", !!first.title);
    ok(g, "idea has description", "truthy", !!first.description);
    ok(g, "idea has steps array", "array", Array.isArray(first.steps));
    ok(g, "idea has difficulty", "truthy", !!first.difficulty);
  } else {
    ok(g, "AI ideas (none returned)", "skipped", "no ideas returned by backend");
  }

  // Missing material
  const noMat = await request("POST", "/api/ai/what-could-i-make", {}, rec.token);
  ok(g, "AI missing material handled (400)", 400, noMat.status);

  // empty material
  const emptyMat = await request("POST", "/api/ai/what-could-i-make", { material: "   " }, rec.token);
  ok(g, "AI empty material handled (not 500)", "not 500", emptyMat.status !== 500);

  // long material
  const longMat = await request("POST", "/api/ai/what-could-i-make", { material: "x".repeat(2000) }, rec.token);
  ok(g, "AI long material does not crash (not 500)", "not 500", longMat.status !== 500);

  // unauthenticated
  const unauth = await request("POST", "/api/ai/what-could-i-make", { material: "wine bottles" });
  ok(g, "AI unauthenticated rejected (401)", 401, unauth.status);
}