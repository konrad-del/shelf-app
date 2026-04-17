import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useAuth } from "../lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Search, Users, Star, BookOpen, Mic2, Film, TrendingUp, Clock, Sparkles } from "lucide-react";
import { FAMOUS_PICKS, getAllFamousBooks, type FamousBook } from "../lib/famousRecommendations";

const TYPE_ICONS: Record<string, any> = { book: BookOpen, podcast: Mic2, movie: Film };
const STATUS_COLORS: Record<string, string> = {
  wishlist: "border-amber-400/60",
  owned: "border-emerald-400/60",
  completed: "border-sky-400/60",
};

function FeedItemCard({ item }: { item: any }) {
  const Icon = TYPE_ICONS[item.type] || BookOpen;
  return (
    <Link href={`/shelf/item/${item.id}`}>
      <div className={`group flex gap-3 p-3 rounded-xl border border-border bg-card hover:bg-card/80 transition-all cursor-pointer ${STATUS_COLORS[item.status] || ""}`}>
        {item.coverUrl ? (
          <img src={item.coverUrl} alt={item.title}
            className="w-12 h-16 object-cover rounded-md flex-shrink-0 shadow" />
        ) : (
          <div className="w-12 h-16 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground line-clamp-2 leading-snug">{item.title}</p>
          {item.creator && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.creator}</p>}
          <div className="flex items-center gap-2 mt-1.5">
            {item.rating > 0 && (
              <div className="flex items-center gap-0.5">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
            )}
            {item.user && (
              <span className="text-xs text-muted-foreground">by @{item.user.username}</span>
            )}
          </div>
          {item.publicNotes && (
            <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2 italic">"{item.publicNotes}"</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function DiscoverPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [famousTab, setFamousTab] = useState<"bybook" | "byperson">("bybook");

  const { data: feedItems } = useQuery<any[]>({
    queryKey: ["/api/feed"],
    queryFn: async () => {
      const r = await apiRequest("GET", "/api/feed");
      if (!r.ok) return [];
      return r.json();
    },
    enabled: !!user,
  });

  const { data: topRated } = useQuery<any[]>({
    queryKey: ["/api/feed/top-rated"],
    queryFn: async () => {
      const r = await apiRequest("GET", "/api/feed/top-rated");
      if (!r.ok) return [];
      return r.json();
    },
    enabled: !!user,
  });

  const { data: users, isLoading: searchLoading } = useQuery<any[]>({
    queryKey: ["/api/users/search", searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      const r = await apiRequest("GET", `/api/users/search?q=${encodeURIComponent(searchTerm)}`);
      return r.json();
    },
    enabled: !!searchTerm,
  });

  const allFamousBooks = getAllFamousBooks();
  const activePerson = selectedPerson ? FAMOUS_PICKS.find(p => p.person === selectedPerson) : null;

  const newestFeed = feedItems?.slice(0, 12) ?? [];
  const hasFollowingContent = newestFeed.length > 0 || (topRated && topRated.length > 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">

      {/* ── People from your network ── */}
      {user && (
        <section>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="text-base font-bold">From people you follow</h2>
          </div>

          {!hasFollowingContent ? (
            <div className="text-center py-10 rounded-xl border border-border bg-card/40">
              <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Follow people to see their shelves here.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Search below to find people.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {topRated && topRated.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Top rated</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {topRated.slice(0, 6).map((item: any) => (
                      <FeedItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}
              {newestFeed.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recently added</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {newestFeed.map((item: any) => (
                      <FeedItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ── Famous people recommendations ── */}
      <section>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="text-base font-bold">What leaders & icons are reading</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-5">
          Book recommendations from{" "}
          <a href="https://www.bookmarked.club/people" target="_blank" rel="noopener noreferrer"
            className="text-primary hover:underline">bookmarked.club</a>
        </p>

        {/* Tab: by book or by person */}
        <div className="flex items-center bg-muted/50 rounded-lg p-0.5 gap-0.5 w-fit mb-5">
          {([{ value: "bybook", label: "Most recommended" }, { value: "byperson", label: "Browse by person" }] as const).map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => { setFamousTab(t.value); setSelectedPerson(null); }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                famousTab === t.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {famousTab === "bybook" && (
          <div className="space-y-2">
            {allFamousBooks.slice(0, 30).map((book: FamousBook) => (
              <div key={`${book.title}-${book.author}`}
                className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card">
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{book.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {book.recommendedBy.map(r => (
                      <button
                        key={r.person}
                        onClick={() => { setFamousTab("byperson"); setSelectedPerson(r.person); }}
                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {r.person}
                      </button>
                    ))}
                  </div>
                </div>
                {book.recommendedBy.length > 1 && (
                  <Badge variant="secondary" className="text-xs flex-shrink-0 mt-0.5">
                    {book.recommendedBy.length}×
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {famousTab === "byperson" && (
          <div>
            {/* Person selector */}
            <div className="flex flex-wrap gap-2 mb-5">
              {FAMOUS_PICKS.map(p => (
                <button
                  key={p.person}
                  type="button"
                  onClick={() => setSelectedPerson(selectedPerson === p.person ? null : p.person)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selectedPerson === p.person
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                  }`}
                >
                  {p.person}
                </button>
              ))}
            </div>

            {activePerson ? (
              <div>
                <div className="mb-4">
                  <p className="font-semibold text-sm">{activePerson.person}</p>
                  <p className="text-xs text-muted-foreground">{activePerson.role}</p>
                </div>
                <div className="space-y-2">
                  {activePerson.books.map(book => (
                    <div key={`${book.title}-${book.author}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{book.title}</p>
                        <p className="text-xs text-muted-foreground">{book.author}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Select a person above to see their reading list.
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Find people ── */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <Users className="w-4 h-4 text-primary" />
          <h2 className="text-base font-bold">Find people</h2>
        </div>

        <div className="flex gap-2 mb-6">
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
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
            data-testid="button-user-search"
          >
            Search
          </button>
        </div>

        {searchLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : users && users.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-3">{users.length} result{users.length !== 1 ? "s" : ""}</p>
            {users.map((u: any) => (
              <Link key={u.id} href={`/u/${u.username}`}>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-card/80 transition-all cursor-pointer"
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
        ) : searchTerm && !searchLoading ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            No users found matching "{searchTerm}".
          </div>
        ) : null}
      </section>
    </div>
  );
}
