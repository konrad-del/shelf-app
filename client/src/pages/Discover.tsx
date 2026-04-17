import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Search, Users } from "lucide-react";

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users, isLoading } = useQuery<any[]>({
    queryKey: ["/api/users/search", searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      const r = await apiRequest("GET", `/api/users/search?q=${encodeURIComponent(searchTerm)}`);
      return r.json();
    },
    enabled: !!searchTerm,
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-1">Discover</h1>
        <p className="text-muted-foreground text-sm">Find people to follow and explore their shelves.</p>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by username or name…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") setSearchTerm(query); }}
            data-testid="input-user-search"
          />
        </div>
        <button
          onClick={() => setSearchTerm(query)}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover-elevate"
          data-testid="button-user-search"
        >
          Search
        </button>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : users && users.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground mb-3">{users.length} result{users.length !== 1 ? "s" : ""}</p>
          {users.map((u: any) => (
            <Link key={u.id} href={`/u/${u.username}`}>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover-elevate cursor-pointer"
                data-testid={`user-card-${u.username}`}>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={u.avatarUrl || ""} />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">
                    {u.displayName?.[0]?.toUpperCase() || u.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{u.displayName || u.username}</p>
                  <p className="text-xs text-muted-foreground">@{u.username}</p>
                  {u.bio && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{u.bio}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : searchTerm && !isLoading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No users found matching "{searchTerm}".
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground/50">
          <Users className="w-10 h-10 mx-auto mb-3" />
          <p className="text-sm">Search for people by username or display name</p>
        </div>
      )}
    </div>
  );
}
