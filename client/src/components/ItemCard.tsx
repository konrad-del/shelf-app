import { ShelfItem } from "@shared/schema";
import { Link } from "wouter";
import { BookOpen, Mic2, Film, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = {
  wishlist: "border-b-amber-400",
  owned: "border-b-emerald-500",
  completed: "border-b-sky-400",
};

const STATUS_LABELS: Record<string, string> = {
  wishlist: "Wishlist",
  owned: "Owned",
  completed: "Completed",
};

const TYPE_ICONS: Record<string, any> = {
  book: BookOpen,
  podcast: Mic2,
  movie: Film,
};

interface ItemCardProps {
  item: ShelfItem;
  linkPrefix?: string;
}

export function ItemCard({ item, linkPrefix = "/shelf/item" }: ItemCardProps) {
  const TypeIcon = TYPE_ICONS[item.type] || BookOpen;

  return (
    <Link href={`${linkPrefix}/${item.id}`}>
      <div
        className={`cover-card border-b-2 ${STATUS_COLORS[item.status] || "border-b-border"} group`}
        data-testid={`card-item-${item.id}`}
      >
        {item.coverUrl ? (
          <img
            src={item.coverUrl}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-3 text-center bg-gradient-to-b from-muted to-background">
            <TypeIcon className="w-8 h-8 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium leading-tight line-clamp-3">
              {item.title}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
          <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">{item.title}</p>
          {item.creator && (
            <p className="text-white/60 text-[11px] mt-0.5 line-clamp-1">{item.creator}</p>
          )}
          <div className="flex items-center gap-1.5 mt-2">
            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4">
              {STATUS_LABELS[item.status] || item.status}
            </Badge>
            {item.rating > 0 && (
              <div className="flex items-center gap-0.5 text-amber-400">
                <Star className="w-2.5 h-2.5 fill-current" />
                <span className="text-[10px] text-white/80">{item.rating}</span>
              </div>
            )}
          </div>
        </div>

        {/* Type icon badge */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
            <TypeIcon className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>
    </Link>
  );
}
