import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "./lib/auth";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import ProfilePage from "./pages/Profile";
import MyShelfPage from "./pages/MyShelf";
import ItemDetailPage from "./pages/ItemDetail";
import AddItemPage from "./pages/AddItem";
import RecommendationsPage from "./pages/Recommendations";
import DiscoverPage from "./pages/Discover";
import NotFound from "./pages/not-found";
import { Navbar } from "./components/Navbar";

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router hook={useHashLocation}>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/register" component={RegisterPage} />
            <Route path="/shelf" component={MyShelfPage} />
            <Route path="/shelf/add" component={AddItemPage} />
            <Route path="/shelf/item/:id" component={ItemDetailPage} />
            <Route path="/recommendations" component={RecommendationsPage} />
            <Route path="/discover" component={DiscoverPage} />
            <Route path="/u/:username" component={ProfilePage} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Toaster />
      </div>
    </Router>
  );
}
