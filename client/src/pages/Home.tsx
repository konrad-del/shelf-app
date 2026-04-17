import { Link } from "wouter";
import { useAuth } from "../lib/auth";
import { Button } from "@/components/ui/button";
import { BookOpen, Mic2, Film, Users, Star, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  if (user) {
    // Redirect logged-in users to their shelf
    window.location.hash = "/shelf";
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
        {/* Subtle grid bg */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(38_95%_58%_/_0.06)_0%,_transparent_70%)] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="px-3 py-1 rounded-full border border-primary/30 text-primary text-xs font-medium tracking-wide uppercase">
              Your personal shelf
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
            Track everything<br />
            <span className="text-primary">you love.</span>
          </h1>

          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
            Books, podcasts, and movies — all in one shelf. Share your collection, follow friends, and discover what they're reading or watching.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg" className="gap-2 w-full sm:w-auto" data-testid="button-get-started">
                Get started free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/discover">
              <Button variant="outline" size="lg" className="w-full sm:w-auto" data-testid="button-browse">
                Browse shelves
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: BookOpen,
              color: "text-amber-400",
              title: "Books",
              desc: "Track what you've read, what you own, and what's on your wishlist.",
            },
            {
              icon: Mic2,
              color: "text-purple-400",
              title: "Podcasts",
              desc: "Catalog your favorite shows and episodes in one place.",
            },
            {
              icon: Film,
              color: "text-sky-400",
              title: "Movies & TV",
              desc: "Build your watchlist and log what you've already seen.",
            },
            {
              icon: Users,
              color: "text-emerald-400",
              title: "Social",
              desc: "Follow friends, share recommendations, and discover through community.",
            },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="p-5 rounded-xl border border-border bg-card hover-elevate" data-testid={`feature-${title.toLowerCase()}`}>
              <Icon className={`w-6 h-6 mb-3 ${color}`} />
              <h3 className="font-semibold text-sm text-foreground mb-1.5">{title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
