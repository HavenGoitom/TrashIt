import { ok, skip, request, registerUser } from "../lib.mjs";

export async function testMatches() {
  const g = "Matches";

  const buyer = await registerUser("matBuyer");
  const seller = await registerUser("matSeller");
  const outsider = await registerUser("matOther");

  if (!buyer.rec.token || !seller.rec.token || !outsider.rec.token) { skip(g, "matches", "missing tokens"); return; }

  // Create a BUY and a SELL that should match (plastic chairs)
  const buyRes = await request("POST", "/api/posts", {
    title: "Looking for 10 plastic chairs",
    description: "Need used plastic chairs",
    type: "buy",
    price: { min: 100, max: 200 },
    quantity: { fixed: 10 },
    images: [],
  }, buyer.rec.token);

  const sellRes = await request("POST", "/api/posts", {
    title: "15 plastic chairs",
    description: "New-ish plastic chairs for sale",
    type: "sell",
    price: { fixed: 150 },
    quantity: { fixed: 15 },
    images: [],
  }, seller.rec.token);

  ok(g, "BUY post created", 201, buyRes.status);
  ok(g, "SELL post created", 201, sellRes.status);

  // Give matching service a moment (async, non-blocking in backend)
  await new Promise((r) => setTimeout(r, 4000));

  // Buyer sees matches involving their own posts
  const buyerMatches = await request("GET", "/api/matches", undefined, buyer.rec.token);
  const bm = buyerMatches.data?.matches || [];
  ok(g, "matches endpoint 200", 200, buyerMatches.status);
  const foundForBuyer = bm.some((m) =>
    (m.buyPost?._id === buyRes.data?.post?._id && m.sellPost?._id === sellRes.data?.post?._id) ||
    (m.buyer?.user?._id === buyer.rec.user?._id && m.seller?.user?._id === seller.rec.user?._id)
  );
  ok(g, "buyer sees the chair match", true, foundForBuyer);

  // Outsider must not see a match that doesn't involve them
  const outsiderMatches = await request("GET", "/api/matches", undefined, outsider.rec.token);
  const om = outsiderMatches.data?.matches || [];
  const outsiderLeak = om.some((m) => (m.buyer?.user?._id === buyer.rec.user?._id) && !(m.buyer?.user?._id === outsider.rec.user?._id));
  ok(g, "outsider does not see others' matches", false, !!outsiderLeak);

  // Match detail access
  const aMatch = bm.find((m) => ((m.buyer?.user?._id || m.buyPost?.user?._id) === buyer.rec.user?._id));
  if (aMatch?._id) {
    const partner = aMatch.buyer?.user?._id === buyer.rec.user?._id ? seller.rec.token : buyer.rec.token;
    const detail = await request("GET", `/api/matches/${aMatch._id}`, undefined, partner);
    ok(g, "participant views match detail 200", 200, detail.status);
    const outsiderDetail = await request("GET", `/api/matches/${aMatch._id}`, undefined, outsider.rec.token);
    ok(g, "unrelated user blocked from match detail (403)", 403, outsiderDetail.status);
  } else {
    ok(g, "match detail tests", "skipped: no match observed", "matching may be async/disabled");
  }
}