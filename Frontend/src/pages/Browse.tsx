import { useState, useEffect } from "react";
import { useRouter } from "../context";
import { Button, SearchBar, Tabs, Select, SkeletonCard } from "../components/ui";
import { PostCard } from "../components/PostCard";
import { EmptyState } from "../components/EmptyState";
import { api } from "../api";
import type { Post } from "../types";

interface Filters {
  type: string;
  status: string;
  sort: string;
  minPrice: string;
  maxPrice: string;
}

function FilterPanel({
  filters,
  onChange,
  onReset,
}: {
  filters: Filters;
  onChange: (k: keyof Filters, v: string) => void;
  onReset: () => void;
}) {
  return (
    <aside className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-brown-800 text-sm">Filters</h3>
        <button onClick={onReset} className="text-xs text-orange-500 font-semibold hover:underline">
          Reset all
        </button>
      </div>

      <Select
        label="Post type"
        value={filters.type}
        onChange={(e) => onChange("type", e.target.value)}
        options={[
          { value: "", label: "All types" },
          { value: "sell", label: "Selling" },
          { value: "buy", label: "Looking for" },
        ]}
      />

      <Select
        label="Status"
        value={filters.status}
        onChange={(e) => onChange("status", e.target.value)}
        options={[
          { value: "active", label: "Active" },
          { value: "sold", label: "Sold" },
          { value: "closed", label: "Closed" },
          { value: "", label: "All statuses" },
        ]}
      />

      <Select
        label="Sort by"
        value={filters.sort}
        onChange={(e) => onChange("sort", e.target.value)}
        options={[
          { value: "newest", label: "Newest first" },
          { value: "oldest", label: "Oldest first" },
        ]}
      />

      <div>
        <label className="text-sm font-semibold text-brown-700 block mb-2">Price range (birr)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => onChange("minPrice", e.target.value)}
            className="w-full bg-warm-white border-2 border-cream-200 rounded-xl px-3 py-2 text-sm text-brown-800 focus:outline-none focus:border-orange-400 transition-colors"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => onChange("maxPrice", e.target.value)}
            className="w-full bg-warm-white border-2 border-cream-200 rounded-xl px-3 py-2 text-sm text-brown-800 focus:outline-none focus:border-orange-400 transition-colors"
          />
        </div>
      </div>
    </aside>
  );
}

export default function Browse() {
  const { navigate, params } = useRouter();
  const [search, setSearch] = useState(params.search || "");
  const [activeTab, setActiveTab] = useState(params.type || "all");
  const [filters, setFilters] = useState<Filters>({
    type: params.type || "",
    status: "active",
    sort: "newest",
    minPrice: "",
    maxPrice: "",
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  function updateFilter(k: keyof Filters, v: string) {
    setFilters((f) => ({ ...f, [k]: v }));
    if (k === "type") setActiveTab(v || "all");
  }

  function resetFilters() {
    setFilters({ type: "", status: "active", sort: "newest", minPrice: "", maxPrice: "" });
    setActiveTab("all");
    setSearch("");
  }

  useEffect(() => {
    setLoading(true);
    const queryParams: Record<string, string> = {};
    if (filters.type) queryParams.type = filters.type;
    if (filters.status) queryParams.status = filters.status;
    if (filters.sort) queryParams.sort = filters.sort;
    if (filters.minPrice) queryParams.minPrice = filters.minPrice;
    if (filters.maxPrice) queryParams.maxPrice = filters.maxPrice;
    if (search) queryParams.search = search;

    api.posts.getAll(queryParams).then((res) => {
      setPosts(res.posts);
      setTotal(res.total);
    }).finally(() => setLoading(false));
  }, [filters, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-brown-900 mb-1">Browse posts</h1>
        <p className="text-brown-400 text-sm">Find materials, items, and opportunities from the community</p>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-3 mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search materials, products, or things you need..."
          className="flex-1"
        />
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-warm-white border-2 border-cream-200 rounded-2xl text-sm font-semibold text-brown-700 hover:border-orange-300 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
          Filters
        </button>
      </div>

      {/* Mobile filters */}
      {showMobileFilters && (
        <div className="lg:hidden bg-warm-white border border-cream-200 rounded-2xl p-5 mb-6">
          <FilterPanel filters={filters} onChange={updateFilter} onReset={resetFilters} />
          <Button onClick={() => setShowMobileFilters(false)} variant="primary" size="sm" className="mt-4 w-full">
            Apply filters
          </Button>
        </div>
      )}

      {/* Tabs */}
      <Tabs
        tabs={[
          { key: "all", label: "All" },
          { key: "sell", label: "Selling" },
          { key: "buy", label: "Looking for" },
        ]}
        active={activeTab}
        onChange={(k) => {
          setActiveTab(k);
          updateFilter("type", k === "all" ? "" : k);
        }}
        className="mb-6 max-w-xs"
      />

      <div className="flex gap-8">
        {/* Desktop sidebar filters */}
        <div className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-warm-white rounded-2xl border border-cream-200 p-5 sticky top-24">
            <FilterPanel filters={filters} onChange={updateFilter} onReset={resetFilters} />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1">
          {/* Results header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-brown-400">
              {loading ? "Searching..." : `${total} post${total !== 1 ? "s" : ""} found`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              illustration="search"
              title="No posts found"
              description={search ? `No posts matching "${search}". Try different keywords.` : "No posts match your current filters."}
              action={{ label: "Reset filters", onClick: resetFilters }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}

          {/* Prompt to post */}
          {!loading && posts.length > 0 && (
            <div className="mt-10 bg-cream-100 rounded-2xl p-6 border border-cream-200 text-center">
              <p className="text-brown-500 text-sm mb-3">
                Didn&apos;t find what you need? Post a BUY request and let people come to you.
              </p>
              <Button variant="secondary" size="sm" onClick={() => navigate("create-post")}>
                Create a BUY post
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
