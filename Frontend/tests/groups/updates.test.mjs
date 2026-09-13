import { ok, skip, request, registerUser, postBody, RUN } from "../lib.mjs";

export async function testUpdateDelete() {
  const g = "Posts";

  const owner = await registerUser("updOwner");
  const other = await registerUser("updOther");
  const created = await request("POST", "/api/posts", postBody("sell"), owner.rec.token);
  const id = created.data?.post?._id;
  if (!id) { skip(g, "update/delete tests", "no post"); return; }

  const upd = await request("PUT", `/api/posts/${id}`, postBody("sell", { title: "Updated " + RUN, price: { fixed: 999 }, quantity: { fixed: 7 } }), owner.rec.token);
  ok(g, "owner update 200", 200, upd.status);
  ok(g, "updated title persisted", "Updated " + RUN, upd.data?.post?.title);
  ok(g, "updated price persisted", 999, upd.data?.post?.price?.fixed);

  const cross = await request("PUT", `/api/posts/${id}`, postBody("sell", { title: "Hacked" }), other.rec.token);
  ok(g, "other user cannot update (403)", 403, cross.status);

  for (const s of ["sold", "active", "closed"]) {
    const st = await request("PATCH", `/api/posts/${id}/status`, { status: s }, owner.rec.token);
    ok(g, `owner set status ${s}`, 200, st.status);
    ok(g, `status persisted as ${s}`, s, st.data?.post?.status);
  }
  const badStatus = await request("PATCH", `/api/posts/${id}/status`, { status: "bogus" }, owner.rec.token);
  ok(g, "invalid status fails", 400, badStatus.status);
  const crossStatus = await request("PATCH", `/api/posts/${id}/status`, { status: "sold" }, other.rec.token);
  ok(g, "other user cannot change status (403)", 403, crossStatus.status);

  const crossDel = await request("DELETE", `/api/posts/${id}`, undefined, other.rec.token);
  ok(g, "other user cannot delete (403)", 403, crossDel.status);

  const del = await request("DELETE", `/api/posts/${id}`, undefined, owner.rec.token);
  ok(g, "owner delete 200", 200, del.status);
  const after = await request("GET", `/api/posts/${id}`);
  ok(g, "deleted post not available (404)", 404, after.status);
}