import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useAuth } from "../lib/auth";
import { ShelfGrid } from "../components/ShelfGrid";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Mic2, Film, UserPlus, UserCheck, Share2, LayoutGrid } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { ShelfItem } from "@shared/schema";
import { TierBoard } from "../components/TierBoard";

const TYPES = [
  { value: "all", label: "All" },
  { value: "book", label: "Books", icon: BookOpen },
  { value: "podcast", label: "Podcasts", icon: Mic2 },
  { value: "movie", label: "Movies", icon: Film },
];

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [activeType, setActiveType] = useState("all");
  const [tierView, setTierView] = useState(false);
  const [tierType, setTierType] = useState("book");

  const { data: profile, isLoading: loadingProfile } = useQuery<any>({
    queryKey: ["/api/users", username],
    queryFn: async () => {
      const r = await apiRequest("GET", `/api/users/${username}`);
      if (!r.ok) throw new Error("Not found");
      return r.json();
    },
  });

  const { data: items, isLoading: loadingItems } = useQuery<ShelfItem[]>({
    queryKey: ["/api/shelf", username, activeType],
    queryFn: async () => {
      const params = activeType !== "all" ? `?type=${activeType}` : "";
      const r = await apiRequest("GET", `/api/shelf/${username}${params}`);
      return r.json();
    },
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const r = profile?.isFollowing
        ? await apiRequest("DELETE", `/api/follow/${username}`)
        : await apiRequest("POST", `/api/follow/${username}`);
      if (!r.ok) throw new Error((await r.json()).error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/users", username] });
      toast({ title: profile?.isFollowing ? "Unfollowed" : "Now following!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (loadingProfile) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="w-32 h-5 bg-muted rounded" />
              <div className="w-20 h-4 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return (
    <div className="max-w-6xl mx-auto px-4 py-20 text-center text-muted-foreground">
      User not found.
    </div>
  );

  const isOwnProfile = user?.username === username;
  const stats = {
    total: items?.length || 0,
    books: items?.filter(i => i.type === "book").length || 0,
    podcasts: items?.filter(i => i.type === "podcast").length || 0,
    movies: items?.filter(i => i.type === "movie").length || 0,
  };

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast({ title: "Profile link copied!" });
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
        <Avatar className="w-16 h-16">
          <AvatarImage src={profile.avatarUrl || ""} />
          <AvatarFallback className="text-xl bg-primary/20 text-primary font-bold">
            {profile.displayName?.[0]?.toUpperCase() || profile.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-foreground">
              {profile.displayName || profile.username}
            </h1>
            <span className="text-muted-foreground text-sm">@{profile.username}</span>
          </div>
          {profile.bio && <p className="text-muted-foreground text-sm mb-2">{profile.bio}</p>}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-foreground font-medium">{profile.followerCount} <span className="text-muted-foreground font-normal">followers</span></span>
            <span className="text-foreground font-medium">{profile.followingCount} <span className="text-muted-foreground font-normal">following</span></span>
            <span className="text-foreground font-medium">{stats.total} <span className="text-muted-foreground font-normal">items</span></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5" data-testid="button-share">
            <Share2 className="w-4 h-4" />
          </Button>
          {user && !isOwnProfile && (
            <Button
              variant={profile.isFollowing ? "outline" : "default"}
              size="sm"
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
              className="gap-1.5"
              data-testid="button-follow"
            >
              {profile.isFollowing ? (
                <><UserCheck className="w-4 h-4" /> Following</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Follow</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Type stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total, color: "" },
          { label: "Books", value: stats.books, color: "text-amber-400" },
          { label: "Podcasts", value: stats.podcasts, color: "text-purple-400" },
          { label: "Movies", value: stats.movies, color: "text-sky-400" },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-lg bg-card border border-border text-center">
            <div className={`text-xl font-bold ${s.color || "text-foreground"}`}>{s.value}</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex items-center bg-muted/50 rounded-lg p-0.5 gap-0.5">
          <button
            type="button"
            onClick={() => setTierView(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              !tierView ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Shelf
          </button>
          <button
            type="button"
            onClick={() => setTierView(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              tierView ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Tier Board
          </button>
        </div>
      </div>

      {tierView ? (
        <div className="space-y-4">
          {/* Tier board type selector */}
          <div className="flex items-center gap-1.5">
            {([{value: "book", label: "Books"}, {value: "movie", label: "Movies"}, {value: "podcast", label: "Podcasts"}]).map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTierType(t.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-all ${
                  tierType === t.value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <TierBoard
            items={(items || []).filter(i => i.type === tierType)}
            isOwner={false}
          />
        </div>
      ) : (
        <>
          {/* Type tabs */}
          <Tabs value={activeType} onValueChange={setActiveType} className="mb-6">
            <TabsList className="bg-muted/50">
              {TYPES.map(t => (
                <TabsTrigger key={t.value} value={t.value} className="gap-1.5 text-xs" data-testid={`tab-${t.value}`}>
                  {t.icon && <t.icon className="w-3.5 h-3.5" />}
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Shelf grid */}
          <ShelfGrid
            items={items || []}
            loading={loadingItems}
            emptyMessage={isOwnProfile ? "Your shelf is empty." : `${profile.displayName || profile.username}'s shelf is empty.`}
            showAddButton={isOwnProfile}
            linkPrefix={isOwnProfile ? "/shelf/item" : undefined}
          />
        </>
      )}
    </div>
  );
}
