import { ShelfItem } from "@shared/schema";
import { Link } from "wouter";
import { BookOpen, Mic2, Film } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getStatusBorderColor, getStatusLabel, getTier } from "../lib/shelfConstants";

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
  const borderColor = getStatusBorderColor(item.type, item.status);
  const tier = getTier((item as any).tier);

  return (
    <Link href={`${linkPrefix}/${item.id}`}>
      <div
        className={`cover-card border-b-2 ${borderColor} group`}
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

        {/* Tier badge — always visible if tier set */}
        {tier && (
          <div className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-md flex items-center justify-center font-black text-xs shadow ${tier.badge} text-white`}>
            {tier.value}
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
              {getStatusLabel(item.type, item.status)}
            </Badge>
            {tier && (
              <span className={`text-[10px] font-black ${tier.text}`}>{tier.value}</span>
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
