import { ok, skip, request, registerUser, postBody } from "../lib.mjs";

export async function testPosts() {
  const g = "Posts";
  const { rec } = await registerUser("post");
  const tk = rec.token;
  if (!tk) { skip(g, "post tests", "no token"); return; }

  const sell = await request("POST", "/api/posts", postBody("sell"), tk);
  const p = sell.data?.post;
  ok(g, "create SELL post 201", 201, sell.status);
  ok(g, "SELL post owned by creator", rec.user?._id, p?.user?._id);
  ok(g, "SELL post type", "sell", p?.type);
  ok(g, "SELL post status active", "active", p?.status);
  ok(g, "SELL post price.fixed", 150, p?.price?.fixed);
  ok(g, "SELL post quantity.fixed", 10, p?.quantity?.fixed);

  const buy = await request("POST", "/api/posts", postBody("buy", {
    price: { min: 50, max: 200 },
    quantity: { min: 5, max: 20 },
  }), tk);
  ok(g, "create BUY post 201", 201, buy.status);
  ok(g, "BUY price range min", 50, buy.data?.post?.price?.min);
  ok(g, "BUY price range max", 200, buy.data?.post?.price?.max);
  ok(g, "BUY quantity range min", 5, buy.data?.post?.quantity?.min);
  ok(g, "BUY quantity range max", 20, buy.data?.post?.quantity?.max);

  const noTitle = await request("POST", "/api/posts", postBody("sell", { title: "" }), tk);
  ok(g, "missing title fails", 400, noTitle.status);
  const noType = await request("POST", "/api/posts", postBody("sell", { type: "" }), tk);
  ok(g, "missing type fails", 400, noType.status);
  const badType = await request("POST", "/api/posts", postBody("sell", { type: "weird" }), tk);
  ok(g, "invalid type fails", 400, badType.status);
  const minMaxFlip = await request("POST", "/api/posts", postBody("sell", { price: { min: 500, max: 100 }, quantity: { fixed: 5 } }), tk);
  ok(g, "price min > max fails", 400, minMaxFlip.status);
  const emptyQty = await request("POST", "/api/posts", postBody("sell", { price: { fixed: 10 }, quantity: {} }), tk);
  ok(g, "empty quantity fails", 400, emptyQty.status);
}

export async function testPublicPosts() {
  const g = "Public Posts";
  const list = await request("GET", "/api/posts?limit=10");
  ok(g, "GET list is public (200)", 200, list.status);
  ok(g, "list returns posts array", "array", Array.isArray(list.data?.posts));
  ok(g, "list returns total number", "number", typeof list.data?.total === "number");
  ok(g, "list currentPage=1", 1, list.data?.currentPage);
  ok(g, "list totalPages", "number>=1", typeof list.data?.totalPages === "number");

  const typeSell = await request("GET", "/api/posts?type=sell&limit=100");
  ok(g, "filter type=sell => all sell", "all sell", (typeSell.data?.posts || []).every((x) => x.type === "sell"));
  const typeBuy = await request("GET", "/api/posts?type=buy&limit=100");
  ok(g, "filter type=buy => all buy", "all buy", (typeBuy.data?.posts || []).every((x) => x.type === "buy"));
  const badType = await request("GET", "/api/posts?type=oops");
  ok(g, "filter invalid type 400", 400, badType.status);

  const statusActive = await request("GET", "/api/posts?status=active&limit=100");
  ok(g, "filter status=active => all active", "all active", (statusActive.data?.posts || []).every((x) => x.status === "active"));

  const search = await request("GET", "/api/posts?search=Plastic&limit=100");
  ok(g, "search 200", 200, search.status);
  const price = await request("GET", "/api/posts?maxPrice=200&limit=100");
  ok(g, "price filter 200", 200, price.status);
  const qty = await request("GET", "/api/posts?minQuantity=5&limit=100");
  ok(g, "quantity filter 200", 200, qty.status);
  ok(g, "sort newest 200", 200, (await request("GET", "/api/posts?sort=newest&limit=100")).status);
  ok(g, "sort oldest 200", 200, (await request("GET", "/api/posts?sort=oldest&limit=100")).status);

  const page1 = await request("GET", "/api/posts?page=1&limit=2");
  const page2 = await request("GET", "/api/posts?page=2&limit=2");
  const ids1 = new Set((page1.data?.posts || []).map((p) => p._id));
  const ids2 = new Set((page2.data?.posts || []).map((p) => p._id));
  const overlap = [...ids1].filter((x) => ids2.has(x)).length;
  ok(g, "pagination pages are disjoint", 0, overlap);
}

export async function testSinglePost() {
  const g = "Single Post";
  const { rec } = await registerUser("single");
  const created = await request("POST", "/api/posts", postBody("sell"), rec.token);
  const id = created.data?.post?._id;
  if (!id) { skip(g, "single post tests", "no post created"); return; }

  const got = await request("GET", `/api/posts/${id}`);
  ok(g, "GET post by valid id 200", 200, got.status);
  ok(g, "GET post public", id, got.data?.post?._id);
  const badId = await request("GET", "/api/posts/not-an-objectid");
  ok(g, "GET invalid id 400", 400, badId.status);
  const unknown = await request("GET", "/api/posts/000000000000000000000000");
  ok(g, "GET unknown id 404", 404, unknown.status);
}