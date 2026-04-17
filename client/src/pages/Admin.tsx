import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useAuth } from "../lib/auth";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, BookOpen, UserCheck, Search, ArrowUpDown } from "lucide-react";
import { useState, useMemo } from "react";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  itemCount: number;
  followerCount: number;
  followingCount: number;
}

type SortKey = "id" | "username" | "itemCount" | "followerCount";

export default function AdminPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDesc, setSortDesc] = useState(true);

  const { data: users, isLoading, error } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const r = await apiRequest("GET", "/api/admin/users");
      if (!r.ok) throw new Error((await r.json()).error);
      return r.json();
    },
    enabled: !!user,
  });

  const filtered = useMemo(() => {
    if (!users) return [];
    let list = users.filter(u =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.displayName.toLowerCase().includes(search.toLowerCase())
    );
    list = [...list].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDesc ? bv - av : av - bv;
      return sortDesc
        ? String(bv).localeCompare(String(av))
        : String(av).localeCompare(String(bv));
    });
    return list;
  }, [users, search, sortKey, sortDesc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDesc(d => !d);
    else { setSortKey(key); setSortDesc(true); }
  };

  const totalItems = users?.reduce((s, u) => s + u.itemCount, 0) ?? 0;

  if (!user) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center text-muted-foreground">
      Please sign in.
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center text-destructive">
      Access denied — admin only.
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Admin</h1>
          <p className="text-sm text-muted-foreground mt-0.5">User management</p>
        </div>
        <Badge variant="outline" className="text-xs gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          konrad only
        </Badge>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total users", value: users?.length ?? "—", icon: Users, color: "text-primary" },
          { label: "Total items", value: totalItems, icon: BookOpen, color: "text-amber-400" },
          { label: "Loading", value: isLoading ? "…" : "Ready", icon: UserCheck, color: "text-emerald-400" },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl border border-border bg-card flex items-center gap-3">
            <div className={`${s.color}`}><s.icon className="w-5 h-5" /></div>
            <div>
              <div className="text-lg font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by username, email, or name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 px-4 py-2.5 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <button className="text-left flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => toggleSort("username")}>
              User <ArrowUpDown className="w-3 h-3" />
            </button>
            <span>Email</span>
            <button className="text-left flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => toggleSort("itemCount")}>
              Items <ArrowUpDown className="w-3 h-3" />
            </button>
            <button className="text-left flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => toggleSort("followerCount")}>
              Followers <ArrowUpDown className="w-3 h-3" />
            </button>
            <span>ID</span>
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">No users found.</div>
          ) : (
            filtered.map(u => (
              <div
                key={u.id}
                className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/20 transition-colors items-center"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="text-xs bg-primary/20 text-primary font-bold">
                      {u.displayName?.[0]?.toUpperCase() || u.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <Link href={`/u/${u.username}`}>
                      <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer">
                        {u.displayName || u.username}
                      </span>
                    </Link>
                    <p className="text-xs text-muted-foreground">@{u.username}</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground truncate">{u.email}</span>
                <span className="text-sm font-medium text-foreground">{u.itemCount}</span>
                <span className="text-sm text-muted-foreground">{u.followerCount}</span>
                <span className="text-xs text-muted-foreground/60">#{u.id}</span>
              </div>
            ))
          )}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground mt-3 text-right">
          Showing {filtered.length} of {users?.length} users
        </p>
      )}
    </div>
  );
}
