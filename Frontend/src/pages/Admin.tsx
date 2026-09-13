import { useState, useEffect } from "react";
import { useAuth } from "../context";
import { useRouter } from "../context";
import { Button, Avatar, Badge, Tabs } from "../components/ui";
import { api } from "../api";
import type { User, Post, Report, AdminStats } from "../types";

// â”€â”€â”€ Stat Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function StatCard({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div className="bg-warm-white rounded-2xl border border-cream-200 p-5">
      <p className="text-xs text-brown-400 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={`font-display text-3xl font-semibold ${color || "text-brown-900"}`}>{value}</p>
      {sub && <p className="text-xs text-brown-400 mt-1">{sub}</p>}
    </div>
  );
}

// â”€â”€â”€ Users tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function UsersTab({ token }: { token: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.getUsers(token).then(res => setUsers(res.users)).finally(() => setLoading(false));
  }, [token]);

  async function suspend(userId: string) {
    await api.admin.suspendUser(userId, token);
    setUsers(us => us.map(u => u._id === userId ? { ...u, suspended: true } : u));
  }

  if (loading) return <div className="skeleton rounded-2xl h-64" />;

  return (
    <div className="bg-warm-white rounded-2xl border border-cream-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-cream-50 border-b border-cream-200">
          <tr>
            <th className="text-left px-5 py-3 text-xs font-semibold text-brown-500 uppercase tracking-wide">User</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-brown-500 uppercase tracking-wide hidden sm:table-cell">Email</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-brown-500 uppercase tracking-wide">Role</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-brown-500 uppercase tracking-wide">Status</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-cream-100">
          {users.map(u => (
            <tr key={u._id} className="hover:bg-cream-50 transition-colors">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={u.name} size="sm" />
                  <div>
                    <p className="font-semibold text-brown-800">{u.name}</p>
                    <p className="text-xs text-brown-400">@{u.username}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3 text-brown-500 hidden sm:table-cell">{u.email}</td>
              <td className="px-5 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === "admin" ? "bg-yellow-400/20 text-yellow-700" : "bg-cream-100 text-brown-600"}`}>
                  {u.role}
                </span>
              </td>
              <td className="px-5 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.suspended ? "bg-red-400/15 text-red-500" : "badge-active"}`}>
                  {u.suspended ? "Suspended" : "Active"}
                </span>
              </td>
              <td className="px-5 py-3">
                {!u.suspended && u.role !== "admin" && (
                  <Button variant="outline" size="sm" onClick={() => suspend(u._id)}>Suspend</Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// â”€â”€â”€ Posts tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PostsTab({ token }: { token: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.getPosts(token).then(res => setPosts(res.posts)).finally(() => setLoading(false));
  }, [token]);

  async function removePost(id: string) {
    await api.admin.deletePost(id, token);
    setPosts(ps => ps.filter(p => p._id !== id));
  }

  if (loading) return <div className="skeleton rounded-2xl h-64" />;

  return (
    <div className="bg-warm-white rounded-2xl border border-cream-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-cream-50 border-b border-cream-200">
          <tr>
            <th className="text-left px-5 py-3 text-xs font-semibold text-brown-500 uppercase tracking-wide">Post</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-brown-500 uppercase tracking-wide hidden md:table-cell">Type</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-brown-500 uppercase tracking-wide">Status</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-cream-100">
          {posts.map(p => (
            <tr key={p._id} className="hover:bg-cream-50 transition-colors">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  {p.images[0] ? (
                    <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 bg-cream-100 rounded-lg flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium text-brown-800 line-clamp-1">{p.title}</p>
                    <p className="text-xs text-brown-400">by @{p.user.username}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3 hidden md:table-cell">
                <Badge variant={p.type}>{p.type}</Badge>
              </td>
              <td className="px-5 py-3">
                <Badge variant={p.status}>{p.status}</Badge>
              </td>
              <td className="px-5 py-3">
                <Button variant="danger" size="sm" onClick={() => removePost(p._id)}>Remove</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// â”€â”€â”€ Reports tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ReportsTab({ token }: { token: string }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [note, setNote] = useState<Record<string, string>>({});

  useEffect(() => {
    setLoading(true);
    api.admin.getReports(token, filter).then(res => setReports(res.reports)).finally(() => setLoading(false));
  }, [token, filter]);

  async function resolve(id: string) {
    await api.admin.resolveReport(id, note[id] || "Reviewed by admin", token);
    setReports(rs => rs.map(r => r._id === id ? { ...r, status: "resolved" as const } : r));
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {["pending", "resolved", "rejected"].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${filter === s ? "bg-brown-800 text-warm-white" : "bg-cream-100 text-brown-600 hover:bg-cream-200"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="skeleton rounded-2xl h-48" />
      ) : reports.length === 0 ? (
        <div className="bg-warm-white rounded-2xl border border-cream-200 p-8 text-center text-brown-400 text-sm">
          No {filter} reports.
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(r => (
            <div key={r._id} className="bg-warm-white rounded-2xl border border-cream-200 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${r.status === "pending" ? "bg-yellow-400/20 text-yellow-700" : r.status === "resolved" ? "badge-active" : "bg-cream-100 text-brown-500"}`}>{r.status}</span>
                    <span className="text-xs text-brown-400">{r.targetType === "post" ? "Post report" : "User report"}</span>
                  </div>
                  <p className="text-sm font-semibold text-brown-800">
                    {r.reportedPost?.title || `@${r.reportedUser?.username}`}
                  </p>
                  <p className="text-xs text-brown-400 mt-0.5">Reported by @{r.reporter.username}</p>
                </div>
                <span className="text-xs text-brown-300 flex-shrink-0">{new Date(r.createdAt).toLocaleDateString("en-ET")}</span>
              </div>
              <p className="text-sm text-brown-600 italic bg-cream-50 rounded-xl px-4 py-2.5 mb-3">
                &ldquo;{r.reason}&rdquo;
              </p>
              {r.status === "pending" && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Admin note (optional)"
                    value={note[r._id] || ""}
                    onChange={e => setNote(n => ({ ...n, [r._id]: e.target.value }))}
                    className="flex-1 bg-cream-50 border border-cream-200 rounded-xl px-3 py-2 text-sm text-brown-800 focus:outline-none focus:border-orange-400"
                  />
                  <Button variant="primary" size="sm" onClick={() => resolve(r._id)}>Resolve</Button>
                </div>
              )}
              {r.adminNote && (
                <p className="text-xs text-olive-600 font-medium mt-2">Note: {r.adminNote}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ Stats tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function StatsTab({ token }: { token: string }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.getStats(token).then(res => setStats(res.stats)).catch(() => setStats(null)).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="skeleton rounded-2xl h-64" />;
  if (!stats) return <div className="bg-warm-white rounded-2xl border border-cream-200 p-8 text-center text-brown-400 text-sm">Failed to load statistics.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-brown-500 uppercase tracking-wide mb-3">Users</h3>
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Total users" value={stats.users.total} />
          <StatCard label="Suspended" value={stats.users.suspended} color="text-red-400" />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-brown-500 uppercase tracking-wide mb-3">Posts</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total" value={stats.posts.total} />
          <StatCard label="Active" value={stats.posts.active} color="text-olive-600" />
          <StatCard label="Sold" value={stats.posts.sold} color="text-orange-500" />
          <StatCard label="Closed" value={stats.posts.closed} />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-brown-500 uppercase tracking-wide mb-3">Reports</h3>
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Pending review" value={stats.reports.pending} color="text-yellow-600" />
        </div>
      </div>
      {/* Activity bars */}
      <div className="bg-warm-white rounded-2xl border border-cream-200 p-5">
        <h3 className="font-semibold text-brown-800 mb-4">Post distribution</h3>
        <div className="space-y-3">
          {[
            { label: "Active", count: stats.posts.active, total: stats.posts.total, color: "bg-olive-500" },
            { label: "Sold", count: stats.posts.sold, total: stats.posts.total, color: "bg-orange-500" },
            { label: "Closed", count: stats.posts.closed, total: stats.posts.total, color: "bg-cream-300" },
          ].map(row => (
            <div key={row.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-brown-700">{row.label}</span>
                <span className="text-brown-400">{row.count} ({row.total > 0 ? Math.round((row.count / row.total) * 100) : 0}%)</span>
              </div>
              <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${row.color} rounded-full transition-all duration-700`}
                  style={{ width: `${row.total > 0 ? (row.count / row.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Admin Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function Admin() {
  const { isAdmin, token } = useAuth();
  const { navigate } = useRouter();
  const [tab, setTab] = useState("stats");
  const [quickStats, setQuickStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    if (token) {
      api.admin.getStats(token).then(res => setQuickStats(res.stats)).catch(() => {});
    }
  }, [token]);

  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-brown-400 mb-4">Admin access required.</p>
        <Button variant="primary" onClick={() => navigate("discover")}>Go home</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-brown-400 font-semibold uppercase tracking-widest mb-1">Admin</p>
          <h1 className="font-display text-3xl font-semibold text-brown-900">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-olive-600 bg-olive-500/10 px-4 py-2 rounded-full border border-olive-500/20">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          Admin mode active
        </div>
      </div>

      {/* Quick stats bar */}
      {quickStats ? (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="Total users" value={quickStats.users.total} />
          <StatCard label="Active posts" value={quickStats.posts.active} color="text-olive-600" />
          <StatCard label="Pending reports" value={quickStats.reports.pending} color="text-yellow-600" sub="Need review" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="skeleton rounded-2xl h-24" />
          <div className="skeleton rounded-2xl h-24" />
          <div className="skeleton rounded-2xl h-24" />
        </div>
      )}

      {/* Tabs */}
      <Tabs
        tabs={[
          { key: "stats", label: "Statistics" },
          { key: "users", label: "Users" },
          { key: "posts", label: "Posts" },
          { key: "reports", label: "Reports", count: quickStats?.reports.pending },
        ]}
        active={tab}
        onChange={setTab}
        className="mb-6"
      />

      {tab === "stats" && <StatsTab token={token!} />}
      {tab === "users" && <UsersTab token={token!} />}
      {tab === "posts" && <PostsTab token={token!} />}
      {tab === "reports" && <ReportsTab token={token!} />}
    </div>
  );
}
