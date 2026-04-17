import { ShelfItem } from "@shared/schema";
import { ItemCard } from "./ItemCard";
import { BookOpen, Mic2, Film, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface ShelfGridProps {
  items: ShelfItem[];
  loading?: boolean;
  emptyMessage?: string;
  showAddButton?: boolean;
  linkPrefix?: string;
}

export function ShelfGrid({ items, loading, emptyMessage, showAddButton, linkPrefix }: ShelfGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] rounded-md bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex gap-3 mb-4 text-muted-foreground/40">
          <BookOpen className="w-8 h-8" />
          <Mic2 className="w-8 h-8" />
          <Film className="w-8 h-8" />
        </div>
        <p className="text-muted-foreground text-sm">{emptyMessage || "Nothing here yet."}</p>
        {showAddButton && (
          <Link href="/shelf/add">
            <Button className="mt-4 gap-2" size="sm" data-testid="button-empty-add">
              <Plus className="w-4 h-4" />
              Add something
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} linkPrefix={linkPrefix} />
      ))}
    </div>
  );
}
