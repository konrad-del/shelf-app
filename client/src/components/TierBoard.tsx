import { TIERS, getTier } from "../lib/shelfConstants";
import { BookOpen, Mic2, Film } from "lucide-react";
import type { ShelfItem } from "@shared/schema";

const TYPE_ICONS: Record<string, any> = { book: BookOpen, podcast: Mic2, movie: Film };

interface TierBoardProps {
  items: ShelfItem[];
  onTierChange?: (itemId: number, tier: string | null) => void;
  isOwner?: boolean;
}

export function TierBoard({ items, onTierChange, isOwner = false }: TierBoardProps) {
  const rated = items.filter(i => (i as any).tier);
  const unrated = items.filter(i => !(i as any).tier);

  return (
    <div className="space-y-2">
      {TIERS.map(tier => {
        const tierItems = items.filter(i => (i as any).tier === tier.value);
        return (
          <div key={tier.value} className={`flex items-stretch rounded-xl border ${tier.border} overflow-hidden`}>
            {/* Tier label */}
            <div className={`flex items-center justify-center w-14 flex-shrink-0 ${tier.bg} border-r ${tier.border}`}>
              <div className="text-center">
                <div className={`text-2xl font-black ${tier.text}`}>{tier.value}</div>
              </div>
            </div>

            {/* Items */}
            <div className={`flex-1 p-2 ${tier.bg} min-h-[72px]`}>
              {tierItems.length === 0 ? (
                <div className="flex items-center h-full pl-2">
                  <span className="text-xs text-muted-foreground/40 italic">No items yet</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tierItems.map(item => {
                    const TypeIcon = TYPE_ICONS[item.type] || BookOpen;
                    return (
                      <div key={item.id} className="group relative flex-shrink-0" title={item.title}>
                        {item.coverUrl ? (
                          <img
                            src={item.coverUrl}
                            alt={item.title}
                            className="w-12 h-16 object-cover rounded shadow-md"
                          />
                        ) : (
                          <div className="w-12 h-16 rounded bg-muted flex flex-col items-center justify-center shadow-md gap-1 p-1">
                            <TypeIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-[8px] text-muted-foreground text-center leading-tight line-clamp-3">
                              {item.title}
                            </span>
                          </div>
                        )}
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-10 pointer-events-none">
                          <div className="bg-popover border border-border rounded-md shadow-lg px-2 py-1.5 w-36">
                            <p className="text-xs font-semibold text-foreground line-clamp-2">{item.title}</p>
                            {item.creator && <p className="text-[10px] text-muted-foreground mt-0.5">{item.creator}</p>}
                          </div>
                        </div>
                        {/* Remove tier button (owner only) */}
                        {isOwner && onTierChange && (
                          <button
                            onClick={() => onTierChange(item.id, null)}
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow"
                            title="Remove from tier"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Unrated items (owner only) */}
      {isOwner && unrated.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Not yet ranked</p>
          <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-dashed border-border bg-muted/20">
            {unrated.map(item => {
              const TypeIcon = TYPE_ICONS[item.type] || BookOpen;
              return (
                <div key={item.id} className="group relative flex-shrink-0" title={item.title}>
                  {item.coverUrl ? (
                    <img src={item.coverUrl} alt={item.title} className="w-12 h-16 object-cover rounded shadow opacity-60 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-12 h-16 rounded bg-muted flex flex-col items-center justify-center shadow gap-1 p-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <TypeIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[8px] text-muted-foreground text-center leading-tight line-clamp-3">{item.title}</span>
                    </div>
                  )}
                  {/* Tier picker on hover */}
                  {onTierChange && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex z-10 gap-0.5 bg-popover border border-border rounded-lg shadow-lg p-1">
                      {TIERS.map(t => (
                        <button
                          key={t.value}
                          onClick={() => onTierChange(item.id, t.value)}
                          className={`w-7 h-7 rounded font-black text-xs ${t.bg} ${t.text} border ${t.border} hover:opacity-80 transition-opacity`}
                          title={t.label}
                        >
                          {t.value}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
