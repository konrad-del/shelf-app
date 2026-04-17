import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../lib/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Mic2, Film, Search, Plus, ArrowLeft, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

type ItemType = "book" | "podcast" | "movie";

interface SearchResult {
  externalId: string;
  title: string;
  creator: string;
  coverUrl: string;
  year: string;
  genre: string;
  type: ItemType;
}

export default function AddItemPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [type, setType] = useState<ItemType>("book");
  const [query, setQuery] = useState("");
  const [searchTriggered, setSearchTriggered] = useState("");
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [status, setStatus] = useState("wishlist");
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");

  const { data: results, isLoading: searching } = useQuery<SearchResult[]>({
    queryKey: [`/api/search/${type}s`, searchTriggered],
    queryFn: async () => {
      if (!searchTriggered) return [];
      const r = await apiRequest("GET", `/api/search/${type}s?q=${encodeURIComponent(searchTriggered)}`);
      return r.json();
    },
    enabled: !!searchTriggered,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!selected) return;
      const r = await apiRequest("POST", "/api/shelf", {
        type,
        title: selected.title,
        creator: selected.creator,
        coverUrl: selected.coverUrl,
        externalId: selected.externalId,
        year: selected.year,
        genre: selected.genre,
        status,
        rating,
        notes,
        userId: user?.id,
      });
      if (!r.ok) throw new Error((await r.json()).error);
      return r.json();
    },
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: ["/api/shelf"] });
      toast({ title: "Added to shelf!", description: `"${selected?.title}" is now on your shelf.` });
      setLocation(`/shelf/item/${item.id}`);
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center text-muted-foreground">
      Please sign in to add items.
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Button variant="ghost" size="sm" className="gap-2 mb-6 -ml-2 text-muted-foreground"
        onClick={() => setLocation("/shelf")} data-testid="button-back">
        <ArrowLeft className="w-4 h-4" />
        Back to shelf
      </Button>

      <h1 className="text-xl font-bold mb-1">Add to shelf</h1>
      <p className="text-muted-foreground text-sm mb-6">Search for a book, podcast, or movie to add.</p>

      {/* Type selector */}
      <Tabs value={type} onValueChange={(v) => { setType(v as ItemType); setSearchTriggered(""); setSelected(null); }} className="mb-5">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="book" className="gap-1.5" data-testid="tab-book">
            <BookOpen className="w-4 h-4" /> Books
          </TabsTrigger>
          <TabsTrigger value="podcast" className="gap-1.5" data-testid="tab-podcast">
            <Mic2 className="w-4 h-4" /> Podcasts
          </TabsTrigger>
          <TabsTrigger value="movie" className="gap-1.5" data-testid="tab-movie">
            <Film className="w-4 h-4" /> Movies & TV
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      {!selected && (
        <>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder={`Search ${type === "book" ? "books by title or author" : type === "podcast" ? "podcasts by name" : "movies or TV shows"}…`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") setSearchTriggered(query); }}
                data-testid="input-search"
              />
            </div>
            <Button onClick={() => setSearchTriggered(query)} disabled={!query.trim()} data-testid="button-search">
              Search
            </Button>
          </div>

          {/* Results */}
          {searching ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : results && results.length > 0 ? (
            <div className="space-y-1 mb-2">
              <p className="text-xs text-muted-foreground mb-3">{results.length} results — click to select</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className="aspect-[2/3] rounded-md overflow-hidden bg-muted cursor-pointer ring-0 hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => setSelected(r)}
                    data-testid={`result-item-${i}`}
                  >
                    {r.coverUrl ? (
                      <img src={r.coverUrl} alt={r.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                        <span className="text-[10px] text-muted-foreground line-clamp-3">{r.title}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : searchTriggered && !searching ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No results found. Try a different search.
            </div>
          ) : null}
        </>
      )}

      {/* Selected item form */}
      {selected && (
        <div className="space-y-6">
          <div className="flex gap-4 p-4 rounded-lg border border-border bg-card">
            {selected.coverUrl ? (
              <img src={selected.coverUrl} alt={selected.title}
                className="w-16 h-24 object-cover rounded flex-shrink-0" />
            ) : (
              <div className="w-16 h-24 rounded bg-muted flex items-center justify-center flex-shrink-0">
                {type === "book" && <BookOpen className="w-6 h-6 text-muted-foreground" />}
                {type === "podcast" && <Mic2 className="w-6 h-6 text-muted-foreground" />}
                {type === "movie" && <Film className="w-6 h-6 text-muted-foreground" />}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground line-clamp-2">{selected.title}</h3>
              {selected.creator && <p className="text-xs text-muted-foreground mt-0.5">{selected.creator}</p>}
              {selected.year && <p className="text-xs text-muted-foreground">{selected.year}</p>}
              {selected.genre && <p className="text-xs text-muted-foreground">{selected.genre}</p>}
            </div>
            <Button variant="ghost" size="sm" className="self-start text-muted-foreground"
              onClick={() => setSelected(null)} data-testid="button-deselect">
              Change
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger data-testid="select-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wishlist">🟡 Wishlist</SelectItem>
                <SelectItem value="owned">🟢 Owned</SelectItem>
                <SelectItem value="completed">🔵 Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Rating (optional)</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setRating(rating === n ? 0 : n)}
                  className="p-0.5" data-testid={`star-${n}`}>
                  <Star className={`w-6 h-6 transition-colors ${n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                </button>
              ))}
              {rating > 0 && (
                <button type="button" onClick={() => setRating(0)}
                  className="text-xs text-muted-foreground ml-2">Clear</button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <textarea
              id="notes"
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Your thoughts, quotes, or why you want to read/watch/listen…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              data-testid="textarea-notes"
            />
          </div>

          <Button
            onClick={() => addMutation.mutate()}
            disabled={addMutation.isPending}
            className="w-full gap-2"
            data-testid="button-confirm-add"
          >
            <Plus className="w-4 h-4" />
            {addMutation.isPending ? "Adding…" : "Add to shelf"}
          </Button>
        </div>
      )}
    </div>
  );
}
