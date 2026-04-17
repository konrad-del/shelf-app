import { useState } from "react";
import { useAuth } from "../lib/auth";
import { useShelfType } from "../lib/shelfType";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { ShelfGrid } from "../components/ShelfGrid";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ShelfItem } from "@shared/schema";

const STATUSES = ["all", "wishlist", "owned", "completed"] as const;
const STATUS_LABELS: Record<string, string> = {
  all: "All", wishlist: "Wishlist", owned: "Owned", completed: "Completed",
};

const TYPE_LABELS: Record<string, string> = {
  book: "Books", podcast: "Podcasts", movie: "Movies",
};

export default function MyShelfPage() {
  const { user } = useAuth();
  const { activeType } = useShelfType();
  const { toast } = useToast();
  const [activeStatus, setActiveStatus] = useState("all");

  const { data: items, isLoading } = useQuery<ShelfItem[]>({
    queryKey: ["/api/shelf", user?.username, activeType],
    queryFn: async () => {
      if (!user) return [];
      const r = await apiRequest("GET", `/api/shelf/${user.username}?type=${activeType}`);
      return r.json();
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Please <Link href="/login"><span className="text-primary underline">sign in</span></Link> to view your shelf.</p>
      </div>
    );
  }

  const filtered = (items || []).filter(i => activeStatus === "all" || i.status === activeStatus);

  const stats = {
    total: items?.length || 0,
    wishlist: items?.filter(i => i.status === "wishlist").length || 0,
    owned: items?.filter(i => i.status === "owned").length || 0,
    completed: items?.filter(i => i.status === "completed").length || 0,
  };

  const copyLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#/u/${user.username}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({ title: "Link copied!", description: "Share your profile with friends." });
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">My {TYPE_LABELS[activeType]}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {stats.total} {stats.total === 1 ? "item" : "items"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5" data-testid="button-share-profile">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Link href="/shelf/add">
            <Button size="sm" className="gap-1.5" data-testid="button-add-item-shelf">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total, color: "" },
          { label: "Wishlist", value: stats.wishlist, color: "text-amber-400" },
          { label: "Owned", value: stats.owned, color: "text-emerald-400" },
          { label: "Completed", value: stats.completed, color: "text-sky-400" },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-lg bg-card border border-border text-center" data-testid={`stat-${s.label.toLowerCase()}`}>
            <div className={`text-xl font-bold ${s.color || "text-foreground"}`}>{s.value}</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-1.5 mb-6 flex-wrap">
        {STATUSES.map(s => (
          <Button
            key={s}
            variant={activeStatus === s ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveStatus(s)}
            className="text-xs h-7"
            data-testid={`filter-status-${s}`}
          >
            {STATUS_LABELS[s]}
          </Button>
        ))}
      </div>

      {/* Grid */}
      <ShelfGrid
        items={filtered}
        loading={isLoading}
        emptyMessage={`No ${activeStatus === "all" ? "" : activeStatus + " "}${TYPE_LABELS[activeType].toLowerCase()} yet.`}
        showAddButton
      />
    </div>
  );
}
