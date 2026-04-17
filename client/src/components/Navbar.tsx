import { Link, useLocation } from "wouter";
import { useAuth } from "../lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, Mic2, Film, Plus, Bell, Compass, LogOut, User, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

export function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const { data: inboxCount } = useQuery({
    queryKey: ["/api/recommendations/inbox"],
    queryFn: async () => {
      const r = await apiRequest("GET", "/api/recommendations/inbox");
      if (!r.ok) return [];
      return r.json();
    },
    enabled: !!user,
    select: (data: any[]) => data?.length ?? 0,
  });

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" data-testid="link-logo">
          <div className="flex items-center gap-2 cursor-pointer group">
            <svg aria-label="Shelf" width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-primary">
              <rect x="2" y="20" width="24" height="3" rx="1.5" fill="currentColor" opacity="0.9"/>
              <rect x="4" y="6" width="5" height="14" rx="1" fill="currentColor" opacity="0.7"/>
              <rect x="11" y="9" width="4" height="11" rx="1" fill="currentColor" opacity="0.9"/>
              <rect x="17" y="5" width="6" height="15" rx="1" fill="currentColor"/>
            </svg>
            <span className="font-display font-bold text-lg tracking-tight text-foreground group-hover:text-primary transition-colors">
              Shelf
            </span>
          </div>
        </Link>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/discover">
            <Button variant="ghost" size="sm" data-testid="link-discover"
              className={location === "/discover" ? "text-primary" : "text-muted-foreground"}>
              <Compass className="w-4 h-4 mr-1.5" />
              Discover
            </Button>
          </Link>
          {user && (
            <>
              <Link href="/shelf">
                <Button variant="ghost" size="sm" data-testid="link-my-shelf"
                  className={location.startsWith("/shelf") ? "text-primary" : "text-muted-foreground"}>
                  <BookOpen className="w-4 h-4 mr-1.5" />
                  My Shelf
                </Button>
              </Link>
              <Link href="/recommendations">
                <Button variant="ghost" size="sm" data-testid="link-recommendations"
                  className={`relative ${location === "/recommendations" ? "text-primary" : "text-muted-foreground"}`}>
                  <Bell className="w-4 h-4 mr-1.5" />
                  Inbox
                  {inboxCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {inboxCount}
                    </span>
                  )}
                </Button>
              </Link>
            </>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/shelf/add">
                <Button size="sm" data-testid="button-add-item" className="gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 pl-1" data-testid="button-user-menu">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={user.avatarUrl || ""} />
                      <AvatarFallback className="text-xs bg-primary/20 text-primary">
                        {user.displayName?.[0]?.toUpperCase() || user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm">{user.displayName || user.username}</span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href={`/u/${user.username}`} data-testid="link-my-profile">
                      <User className="w-4 h-4 mr-2" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/shelf" data-testid="link-shelf-menu">
                      <BookOpen className="w-4 h-4 mr-2" />
                      My Shelf
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/recommendations" data-testid="link-inbox-menu">
                      <Bell className="w-4 h-4 mr-2" />
                      Recommendations
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} data-testid="button-logout" className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" data-testid="link-login">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" data-testid="link-register">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
