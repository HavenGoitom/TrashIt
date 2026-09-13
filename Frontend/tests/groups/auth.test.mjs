import { ok, skip, request, registerUser, RUN, PREFIX } from "../lib.mjs";

export async function testAuthentication() {
  const g = "Authentication";

  const reg = await registerUser("auth");
  ok(g, "register returns 201", 201, reg.res.status);
  ok(g, "register returns JWT token", "truthy token", reg.rec.token && reg.rec.token.length > 20);
  ok(g, "register returns user id", "truthy _id", !!reg.rec.user?._id);
  ok(g, "register does not leak password/hash", "no password field", !("password" in (reg.res.data?.user || {})));

  await testRegisterValidation(g);

  const login = await request("POST", "/api/auth/login", { email: reg.rec.user?.email, password: reg.rec.password });
  ok(g, "login valid credentials succeeds", 200, login.status);
  ok(g, "login returns token", "truthy token", !!login.data?.token);
  ok(g, "login returns user", "truthy user", !!login.data?.user);

  const badEmail = await request("POST", "/api/auth/login", { email: "nobody_" + RUN + "@example.com", password: "Passw0rd!123" });
  ok(g, "login invalid email fails", 400, badEmail.status);

  const badPass = await request("POST", "/api/auth/login", { email: reg.rec.user?.email, password: "WrongPass123!" });
  ok(g, "login invalid password fails", 400, badPass.status);

  const missing = await request("POST", "/api/auth/login", { email: reg.rec.user?.email });
  ok(g, "login missing password fails", 400, missing.status);

  const me = await request("GET", "/api/auth/me", undefined, reg.rec.token);
  ok(g, "me with valid token succeeds", 200, me.status);
  ok(g, "me returns logged-in user", reg.rec.user?._id, me.data?.user?._id);

  const meNoToken = await request("GET", "/api/auth/me");
  ok(g, "me without token 401", 401, meNoToken.status);

  const meBadToken = await request("GET", "/api/auth/me", undefined, "invalid.token.here");
  ok(g, "me with invalid token 401", 401, meBadToken.status);
}

async function testRegisterValidation(g) {
  const base = { username: PREFIX + "negvalid", name: "Neg Test", email: PREFIX + "negvalid@example.com", password: "Passw0rd!123" };

  const noUser = await request("POST", "/api/auth/register", { ...base, username: "" });
  ok(g, "register missing username fails", 400, noUser.status);

  const noName = await request("POST", "/api/auth/register", { ...base, name: "" });
  ok(g, "register missing name fails", 400, noName.status);

  const noEmail = await request("POST", "/api/auth/register", { ...base, email: "" });
  ok(g, "register missing email fails", 400, noEmail.status);

  const noPass = await request("POST", "/api/auth/register", { ...base, password: "" });
  ok(g, "register missing password fails", 400, noPass.status);

  const badEmail = await request("POST", "/api/auth/register", { ...base, email: "not-an-email" });
  ok(g, "register invalid email fails", 400, badEmail.status);

  const dupEmail = await request("POST", "/api/auth/register", { ...base, username: PREFIX + "negvalid2" });
  ok(g, "register duplicate email fails", 400, dupEmail.status);
}

export async function testUserRole() {
  const g = "User Role";
  const { rec } = await registerUser("role");
  ok(g, "normal user role is 'user'", "user", rec.user?.role);
  ok(g, "no separate buyer/seller account - single registration works", "truthy user", !!rec.user);

  // Clean up the role user: they have no posts yet.
  if (rec.token) {
    const sell = await request("POST", "/api/posts", { title: "Role SELL " + RUN, type: "sell", price: { fixed: 50 }, quantity: { fixed: 2 } }, rec.token);
    ok(g, "role user can create SELL post", 201, sell.status);
    ok(g, "SELL post type", "sell", sell.data?.post?.type);

    const buy = await request("POST", "/api/posts", { title: "Role BUY " + RUN, type: "buy", price: { fixed: 60 }, quantity: { fixed: 3 } }, rec.token);
    ok(g, "role user can create BUY post", 201, buy.status);
    ok(g, "BUY post type", "buy", buy.data?.post?.type);
  } else {
    skip(g, "role tests", "no token");
  }
}