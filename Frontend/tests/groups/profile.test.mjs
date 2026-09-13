import { ok, skip, request, registerUser } from "../lib.mjs";

export async function testProfile() {
  const g = "Profile";
  const { rec } = await registerUser("profile");
  if (!rec.token) { skip(g, "profile", "no token"); return; }

  // Update profile info
  const upd = await request("PUT", "/api/profile", { name: "Updated Name", bio: "Hello from E2E" }, rec.token);
  ok(g, "update profile 200", 200, upd.status);
  ok(g, "profile name updated", "Updated Name", upd.data?.user?.name);

  // Verify me reflects update
  const me = await request("GET", "/api/auth/me", undefined, rec.token);
  ok(g, "me reflects updated name", "Updated Name", me.data?.user?.name);

  // Wrong current password
  const badPw = await request("PUT", "/api/profile/password", { currentPassword: "WrongPass123!", newPassword: "NewPass123!" }, rec.token);
  ok(g, "change password wrong current fails", 400, badPw.status);

  // Correct current password
  const goodPw = await request("PUT", "/api/profile/password", { currentPassword: rec.password, newPassword: "NewPass123!" }, rec.token);
  ok(g, "change password correct current succeeds", 200, goodPw.status);

  // New password works for login
  const relogin = await request("POST", "/api/auth/login", { email: rec.user?.email, password: "NewPass123!" });
  ok(g, "new password logs in", 200, relogin.status);

  // Old password no longer works
  const oldLogin = await request("POST", "/api/auth/login", { email: rec.user?.email, password: rec.password });
  ok(g, "old password rejected", 400, oldLogin.status);

  // Delete profile: wrong password fails
  const delWrong = await request("DELETE", "/api/profile", { password: "WrongPass123!" }, rec.token);
  ok(g, "delete with wrong password fails", 400, delWrong.status);

  // Delete profile: correct password (use the new password that now works)
  const newToken = relogin.data?.token || rec.token;
  const del = await request("DELETE", "/api/profile", { password: "NewPass123!" }, newToken);
  ok(g, "delete account with correct password succeeds", 200, del.status);
}