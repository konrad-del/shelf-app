import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useAuth } from "../lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { BookOpen, Mic2, Film, Send, Inbox } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const TYPE_ICONS = { book: BookOpen, podcast: Mic2, movie: Film };

function RecCard({ rec, direction }: { rec: any; direction: "in" | "out" }) {
  const TypeIcon = TYPE_ICONS[rec.item?.type as keyof typeof TYPE_ICONS] || BookOpen;
  const otherUser = direction === "in" ? rec.fromUser : rec.toUser;

  return (
    <div className="flex gap-4 p-4 rounded-xl border border-border bg-card hover-elevate" data-testid="rec-card">
      {/* Cover */}
      <Link href={`/shelf/item/${rec.item?.id}`}>
        <div className="w-12 h-[72px] sm:w-16 sm:h-24 rounded overflow-hidden bg-muted flex-shrink-0 cursor-pointer">
          {rec.item?.coverUrl ? (
            <img src={rec.item.coverUrl} alt={rec.item?.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <TypeIcon className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Avatar className="w-5 h-5">
              <AvatarImage src={otherUser?.avatarUrl || ""} />
              <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                {otherUser?.displayName?.[0] || otherUser?.username?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <Link href={`/u/${otherUser?.username}`}>
              <span className="text-sm font-medium text-primary hover:underline cursor-pointer">
                {otherUser?.displayName || otherUser?.username}
              </span>
            </Link>
            <span className="text-xs text-muted-foreground">
              {direction === "in" ? "recommended" : "you recommended to"} {direction === "out" && (
                <Link href={`/u/${otherUser?.username}`}>
                  <span className="text-primary hover:underline cursor-pointer">
                    {otherUser?.displayName || otherUser?.username}
                  </span>
                </Link>
              )}
            </span>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {rec.createdAt ? formatDistanceToNow(new Date(rec.createdAt), { addSuffix: true }) : ""}
          </span>
        </div>

        <Link href={`/shelf/item/${rec.item?.id}`}>
          <p className="font-semibold text-sm text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-1">
            {rec.item?.title}
          </p>
        </Link>
        {rec.item?.creator && (
          <p className="text-xs text-muted-foreground">{rec.item.creator}</p>
        )}

        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant="secondary" className="text-[10px] h-4 px-1.5 gap-0.5">
            <TypeIcon className="w-2.5 h-2.5" />
            {rec.item?.type}
          </Badge>
        </div>

        {rec.message && (
          <p className="text-xs text-muted-foreground mt-2 italic border-l-2 border-primary/30 pl-2">
            "{rec.message}"
          </p>
        )}
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  const { user } = useAuth();

  const { data: inbox, isLoading: loadingInbox } = useQuery<any[]>({
    queryKey: ["/api/recommendations/inbox"],
    queryFn: async () => {
      const r = await apiRequest("GET", "/api/recommendations/inbox");
      return r.json();
    },
    enabled: !!user,
  });

  const { data: sent, isLoading: loadingSent } = useQuery<any[]>({
    queryKey: ["/api/recommendations/sent"],
    queryFn: async () => {
      const r = await apiRequest("GET", "/api/recommendations/sent");
      return r.json();
    },
    enabled: !!user,
  });

  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center text-muted-foreground">
      Please <Link href="/login"><span className="text-primary underline">sign in</span></Link> to view recommendations.
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-1">Recommendations</h1>
      <p className="text-muted-foreground text-sm mb-6">Books, podcasts, and movies your friends think you'd love.</p>

      <Tabs defaultValue="inbox">
        <TabsList className="bg-muted/50 mb-6">
          <TabsTrigger value="inbox" className="gap-1.5" data-testid="tab-inbox">
            <Inbox className="w-4 h-4" />
            Inbox
            {inbox && inbox.length > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {inbox.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-1.5" data-testid="tab-sent">
            <Send className="w-4 h-4" />
            Sent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          {loadingInbox ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
            </div>
          ) : inbox && inbox.length > 0 ? (
            <div className="space-y-3">
              {inbox.map((rec: any) => <RecCard key={rec.id} rec={rec} direction="in" />)}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground text-sm">
              No recommendations yet. Follow people and they'll send you picks.
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent">
          {loadingSent ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
            </div>
          ) : sent && sent.length > 0 ? (
            <div className="space-y-3">
              {sent.map((rec: any) => <RecCard key={rec.id} rec={rec} direction="out" />)}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground text-sm">
              You haven't sent any recommendations yet.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
