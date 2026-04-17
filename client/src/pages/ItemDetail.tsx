import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useAuth } from "../lib/auth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Trash2, Star, BookOpen, Mic2, Film, Share2, Send } from "lucide-react";
import { EpisodesPanel } from "../components/EpisodesPanel";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { ShelfItem } from "@shared/schema";

const TYPE_ICONS = { book: BookOpen, podcast: Mic2, movie: Film };
const STATUS_COLORS = { wishlist: "text-amber-400", owned: "text-emerald-400", completed: "text-sky-400" };
const STATUS_LABELS = { wishlist: "Wishlist", owned: "Owned", completed: "Completed" };

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [recommendTo, setRecommendTo] = useState("");
  const [recMessage, setRecMessage] = useState("");
  const [recOpen, setRecOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [editingNotes, setEditingNotes] = useState(false);
  const [publicNotes, setPublicNotes] = useState("");
  const [editingPublicNotes, setEditingPublicNotes] = useState(false);

  const { data: item, isLoading } = useQuery<ShelfItem>({
    queryKey: ["/api/shelf/item", id],
    queryFn: async () => {
      // Get owner from item - we fetch via shelf endpoint
      // We need to fetch the item directly - we use a workaround by getting all items
      // Actually, we'll need to get by user — let's use a direct route
      const r = await apiRequest("GET", `/api/shelf-item/${id}`);
      if (!r.ok) throw new Error("Not found");
      return r.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const r = await apiRequest("PATCH", `/api/shelf/${id}`, data);
      if (!r.ok) throw new Error((await r.json()).error);
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/shelf/item", id] });
      qc.invalidateQueries({ queryKey: ["/api/shelf"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("DELETE", `/api/shelf/${id}`);
      if (!r.ok) throw new Error((await r.json()).error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/shelf"] });
      toast({ title: "Removed from shelf" });
      setLocation("/shelf");
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const recommendMutation = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("POST", "/api/recommend", {
        toUsername: recommendTo.trim(),
        shelfItemId: Number(id),
        message: recMessage,
      });
      if (!r.ok) throw new Error((await r.json()).error);
      return r.json();
    },
    onSuccess: () => {
      toast({ title: "Recommendation sent!" });
      setRecOpen(false);
      setRecommendTo("");
      setRecMessage("");
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="w-32 h-5 bg-muted rounded" />
          <div className="flex gap-6">
            <div className="w-40 h-60 bg-muted rounded" />
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted-foreground">Item not found.</div>;

  const TypeIcon = TYPE_ICONS[item.type as keyof typeof TYPE_ICONS] || BookOpen;
  const isOwner = user?.id === item.userId;

  const saveNotes = () => {
    updateMutation.mutate({ notes });
    setEditingNotes(false);
    toast({ title: "Notes saved" });
  };

  const savePublicNotes = () => {
    updateMutation.mutate({ publicNotes });
    setEditingPublicNotes(false);
    toast({ title: "Public note saved" });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Button variant="ghost" size="sm" className="gap-2 mb-6 -ml-2 text-muted-foreground"
        onClick={() => setLocation("/shelf")} data-testid="button-back">
        <ArrowLeft className="w-4 h-4" />
        Back to shelf
      </Button>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Cover */}
        <div className="flex-shrink-0">
          {item.coverUrl ? (
            <img src={item.coverUrl} alt={item.title}
              className="w-40 h-60 sm:w-48 sm:h-72 object-cover rounded-lg shadow-2xl" />
          ) : (
            <div className="w-40 h-60 sm:w-48 sm:h-72 rounded-lg bg-muted flex flex-col items-center justify-center gap-3">
              <TypeIcon className="w-10 h-10 text-muted-foreground" />
              <span className="text-xs text-muted-foreground text-center px-3">{item.title}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4 min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="secondary" className="gap-1 text-xs">
                <TypeIcon className="w-3 h-3" />
                {item.type}
              </Badge>
              {item.genre && <Badge variant="outline" className="text-xs">{item.genre}</Badge>}
              {item.year && <span className="text-xs text-muted-foreground">{item.year}</span>}
            </div>
            <h1 className="text-xl font-bold text-foreground leading-tight">{item.title}</h1>
            {item.creator && <p className="text-muted-foreground mt-1">by {item.creator}</p>}
          </div>

          {/* Status */}
          {isOwner ? (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Status</Label>
              <Select value={item.status} onValueChange={(v) => updateMutation.mutate({ status: v })}>
                <SelectTrigger className="w-44" data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wishlist">🟡 Wishlist</SelectItem>
                  <SelectItem value="owned">🟢 Owned</SelectItem>
                  <SelectItem value="completed">🔵 Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <span className={`font-medium ${STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || ""}`}>
                {STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status}
              </span>
            </div>
          )}

          {/* Rating */}
          {isOwner && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Rating</Label>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button"
                    onClick={() => updateMutation.mutate({ rating: item.rating === n ? 0 : n })}
                    data-testid={`star-${n}`}>
                    <Star className={`w-5 h-5 transition-colors ${n <= (item.rating || 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            {user && !isOwner && (
              <Dialog open={recOpen} onOpenChange={setRecOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5" data-testid="button-recommend">
                    <Send className="w-4 h-4" />
                    Recommend to friend
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send recommendation</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <Label>Recipient username</Label>
                      <Input placeholder="username" value={recommendTo} onChange={e => setRecommendTo(e.target.value)}
                        data-testid="input-recommend-to" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Message (optional)</Label>
                      <Input placeholder="Why they'd love it…" value={recMessage} onChange={e => setRecMessage(e.target.value)}
                        data-testid="input-rec-message" />
                    </div>
                    <Button onClick={() => recommendMutation.mutate()} disabled={!recommendTo.trim() || recommendMutation.isPending}
                      className="w-full" data-testid="button-send-rec">
                      {recommendMutation.isPending ? "Sending…" : "Send"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {isOwner && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5" data-testid="button-recommend-owner">
                    <Send className="w-4 h-4" />
                    Recommend
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Recommend to someone</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <Label>Recipient username</Label>
                      <Input placeholder="username" value={recommendTo} onChange={e => setRecommendTo(e.target.value)}
                        data-testid="input-recommend-to" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Message (optional)</Label>
                      <Input placeholder="Why they'd love it…" value={recMessage} onChange={e => setRecMessage(e.target.value)} />
                    </div>
                    <Button onClick={() => recommendMutation.mutate()} disabled={!recommendTo.trim() || recommendMutation.isPending}
                      className="w-full">
                      {recommendMutation.isPending ? "Sending…" : "Send recommendation"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {isOwner && (
              <Button variant="ghost" size="sm" className="gap-1.5 text-destructive"
                onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}
                data-testid="button-delete">
                <Trash2 className="w-4 h-4" />
                {deleteMutation.isPending ? "Removing…" : "Remove"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Episodes panel — only for podcasts */}
      {item.type === "podcast" && (
        <EpisodesPanel podcastId={item.id} isOwner={isOwner} />
      )}

      {/* Public notes — visible to everyone */}
      <div className="mt-8 border-t border-border pt-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <Label className="text-sm font-medium">Public note</Label>
            <p className="text-xs text-muted-foreground mt-0.5">Visible to anyone who views this item</p>
          </div>
          {isOwner && (
            !editingPublicNotes ? (
              <Button variant="ghost" size="sm"
                onClick={() => { setPublicNotes((item as any).publicNotes || ""); setEditingPublicNotes(true); }}
                data-testid="button-edit-public-notes">
                {(item as any).publicNotes ? "Edit" : "Add public note"}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditingPublicNotes(false)}>Cancel</Button>
                <Button size="sm" onClick={savePublicNotes} data-testid="button-save-public-notes">Save</Button>
              </div>
            )
          )}
        </div>
        {isOwner && editingPublicNotes ? (
          <textarea
            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-y focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Share your thoughts publicly — recommendations, favourite quotes, why others should check this out…"
            value={publicNotes}
            onChange={e => setPublicNotes(e.target.value)}
            data-testid="textarea-public-notes"
          />
        ) : (item as any).publicNotes ? (
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">{(item as any).publicNotes}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">{isOwner ? "No public note yet." : "No public note from the owner."}</p>
        )}
      </div>

      {/* Private notes — owner only */}
      {isOwner && (
        <div className="mt-6 border-t border-border pt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <Label className="text-sm font-medium">Private notes</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Only you can see this</p>
            </div>
            {!editingNotes ? (
              <Button variant="ghost" size="sm" onClick={() => { setNotes(item.notes || ""); setEditingNotes(true); }}
                data-testid="button-edit-notes">
                {item.notes ? "Edit" : "Add notes"}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditingNotes(false)}>Cancel</Button>
                <Button size="sm" onClick={saveNotes} data-testid="button-save-notes">Save</Button>
              </div>
            )}
          </div>
          {editingNotes ? (
            <textarea
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Private thoughts, quotes, reminders — only you can see this…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              data-testid="textarea-notes"
            />
          ) : item.notes ? (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No private notes yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
