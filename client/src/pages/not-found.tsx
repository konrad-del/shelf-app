import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold text-muted-foreground/30 mb-4">404</h1>
      <p className="text-muted-foreground mb-6">Page not found.</p>
      <Link href="/">
        <Button variant="outline">Go home</Button>
      </Link>
    </div>
  );
}
