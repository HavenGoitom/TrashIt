import { ok, skip, request, registerUser, postBody } from "../lib.mjs";

export async function testFavorites() {
  const g = "Favorites";

  const userA = await registerUser("favA");
  const userB = await registerUser("favB");
  const postOwner = await registerUser("favOwner");
  const postRes = await request("POST", "/api/posts", postBody("sell"), postOwner.rec.token);
  const postId = postRes.data?.post?._id;
  if (!postId || !userA.rec.token) { skip(g, "favorites", "missing post or token"); return; }

  // Add favorite as A
  const add = await request("POST", `/api/favorites/${postId}`, undefined, userA.rec.token);
  ok(g, "add favorite 201/200", 200, add.status);

  // Check A's favorites
  const favsA = await request("GET", "/api/favorites", undefined, userA.rec.token);
  ok(g, "A sees favorite in list", "favorited", (favsA.data?.favorites || []).some((f) => (f.post?._id || f.post) === postId));

  // Check (check endpoint)
  const checkTrue = await request("GET", `/api/favorites/check/${postId}`, undefined, userA.rec.token);
  ok(g, "check favorite true", true, checkTrue.data?.isFavorited);

  // B's favorites should not include this post
  const favsB = await request("GET", "/api/favorites", undefined, userB.rec.token);
  ok(g, "B does not see A's favorite", "not favorited", !((favsB.data?.favorites || []).some((f) => (f.post?._id || f.post) === postId)));
  const checkB = await request("GET", `/api/favorites/check/${postId}`, undefined, userB.rec.token);
  ok(g, "check favorite for B false", false, checkB.data?.isFavorited);

  // Duplicate favorite handling (should not create double — accept the backend's 200 or 409)
  const dup = await request("POST", `/api/favorites/${postId}`, undefined, userA.rec.token);
  const dupOk = dup.status === 200 || dup.status === 201 || dup.status === 409;
  ok(g, "duplicate favorite handled (200/201/409)", "no crash", dupOk);

  // Remove favorite
  const rem = await request("DELETE", `/api/favorites/${postId}`, undefined, userA.rec.token);
  ok(g, "remove favorite 200", 200, rem.status);
  const checkAfter = await request("GET", `/api/favorites/check/${postId}`, undefined, userA.rec.token);
  ok(g, "favorite removed (check false)", false, checkAfter.data?.isFavorited);
}