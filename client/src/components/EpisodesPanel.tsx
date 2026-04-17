import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, Plus, Trash2, ChevronDown, ChevronUp, Headphones } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PodcastEpisode } from "@shared/schema";

interface EpisodesPanelProps {
  podcastId: number;
  isOwner: boolean;
}

function EpisodeRow({ ep, isOwner, onUpdate, onDelete }: {
  ep: PodcastEpisode;
  isOwner: boolean;
  onUpdate: (id: number, data: any) => void;
  onDelete: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editNotes, setEditNotes] = useState(ep.notes || "");

  return (
    <div className="border border-border rounded-lg overflow-hidden" data-testid={`episode-${ep.id}`}>
      {/* Row header */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        {isOwner && (
          <Checkbox
            checked={ep.listened}
            onCheckedChange={(v) => onUpdate(ep.id, { listened: !!v })}
            data-testid={`episode-listened-${ep.id}`}
            className="flex-shrink-0"
          />
        )}
        {!isOwner && (
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ep.listened ? "bg-emerald-400" : "bg-muted-foreground/30"}`} />
        )}

        <button
          className="flex-1 text-left min-w-0"
          onClick={() => setExpanded(e => !e)}
        >
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium truncate ${ep.listened ? "text-muted-foreground line-through" : "text-foreground"}`}>
              {ep.episodeNumber ? <span className="text-muted-foreground text-xs mr-1">#{ep.episodeNumber}</span> : null}
              {ep.title}
            </span>
          </div>
        </button>

        {/* Star rating */}
        {isOwner && (
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => onUpdate(ep.id, { rating: ep.rating === n ? 0 : n })} data-testid={`ep-star-${ep.id}-${n}`}>
                <Star className={`w-3.5 h-3.5 transition-colors ${n <= (ep.rating || 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
              </button>
            ))}
          </div>
        )}
        {!isOwner && ep.rating > 0 && (
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs text-muted-foreground">{ep.rating}</span>
          </div>
        )}

        <button onClick={() => setExpanded(e => !e)} className="text-muted-foreground flex-shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded area */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-border/50 pt-2.5 space-y-3">
          {ep.description && (
            <p className="text-xs text-muted-foreground">{ep.description}</p>
          )}
          {isOwner && (
            <>
              <div className="space-y-1">
                <Label className="text-xs">Notes</Label>
                <textarea
                  className="w-full min-h-[60px] rounded-md border border-input bg-background px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Your thoughts on this episode…"
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  onBlur={() => { if (editNotes !== ep.notes) onUpdate(ep.id, { notes: editNotes }); }}
                />
              </div>
              <button
                onClick={() => onDelete(ep.id)}
                className="text-xs text-destructive hover:underline flex items-center gap-1"
                data-testid={`episode-delete-${ep.id}`}
              >
                <Trash2 className="w-3 h-3" />
                Remove episode
              </button>
            </>
          )}
          {!isOwner && ep.notes && (
            <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-2">{ep.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}

export function EpisodesPanel({ podcastId, isOwner }: EpisodesPanelProps) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newEpNum, setNewEpNum] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const { data: episodes, isLoading } = useQuery<PodcastEpisode[]>({
    queryKey: ["/api/shelf/episodes", podcastId],
    queryFn: async () => {
      const r = await apiRequest("GET", `/api/shelf/${podcastId}/episodes`);
      return r.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("POST", `/api/shelf/${podcastId}/episodes`, {
        title: newTitle.trim(),
        episodeNumber: newEpNum.trim(),
        description: newDesc.trim(),
        listened: false,
        rating: 0,
        notes: "",
      });
      if (!r.ok) throw new Error((await r.json()).error);
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/shelf/episodes", podcastId] });
      setNewTitle(""); setNewEpNum(""); setNewDesc(""); setAdding(false);
      toast({ title: "Episode added" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const r = await apiRequest("PATCH", `/api/episodes/${id}`, data);
      if (!r.ok) throw new Error((await r.json()).error);
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/shelf/episodes", podcastId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/episodes/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/shelf/episodes", podcastId] });
      toast({ title: "Episode removed" });
    },
  });

  const listenedCount = episodes?.filter(e => e.listened).length || 0;

  return (
    <div className="mt-8 border-t border-border pt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-foreground">Episodes</h2>
          {episodes && episodes.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {listenedCount}/{episodes.length} listened
            </span>
          )}
        </div>
        {isOwner && (
          <Button size="sm" variant="outline" onClick={() => setAdding(a => !a)} className="gap-1.5 h-7 text-xs"
            data-testid="button-add-episode">
            <Plus className="w-3.5 h-3.5" />
            Add episode
          </Button>
        )}
      </div>

      {/* Progress bar */}
      {episodes && episodes.length > 0 && (
        <div className="mb-4 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-purple-400 rounded-full transition-all duration-500"
            style={{ width: `${(listenedCount / episodes.length) * 100}%` }}
          />
        </div>
      )}

      {/* Add form */}
      {adding && isOwner && (
        <div className="mb-4 p-3 rounded-lg border border-border bg-card space-y-3">
          <div className="flex gap-2">
            <div className="w-20 flex-shrink-0 space-y-1">
              <Label className="text-xs">Ep #</Label>
              <Input
                placeholder="42"
                value={newEpNum}
                onChange={e => setNewEpNum(e.target.value)}
                className="h-8 text-sm"
                data-testid="input-ep-number"
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Episode title <span className="text-destructive">*</span></Label>
              <Input
                placeholder="Episode title…"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="h-8 text-sm"
                data-testid="input-ep-title"
                onKeyDown={e => { if (e.key === "Enter" && newTitle.trim()) addMutation.mutate(); }}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Description (optional)</Label>
            <Input
              placeholder="Brief description…"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              className="h-8 text-sm"
              data-testid="input-ep-desc"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => addMutation.mutate()}
              disabled={!newTitle.trim() || addMutation.isPending}
              className="h-7 text-xs" data-testid="button-ep-save">
              {addMutation.isPending ? "Adding…" : "Add"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="h-7 text-xs">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Episode list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : episodes && episodes.length > 0 ? (
        <div className="space-y-2">
          {episodes.map(ep => (
            <EpisodeRow
              key={ep.id}
              ep={ep}
              isOwner={isOwner}
              onUpdate={(id, data) => updateMutation.mutate({ id, data })}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground text-xs">
          {isOwner ? "No episodes tracked yet. Add one above." : "No episodes tracked yet."}
        </div>
      )}
    </div>
  );
}
