import type { Express } from "express";
import type { Server } from "http";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { createHash } from "crypto";
import { storage } from "./storage";
import { insertUserSchema, insertShelfItemSchema } from "@shared/schema";
import { z } from "zod";

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "shelf_salt_2024").digest("hex");
}

export function registerRoutes(httpServer: Server, app: Express) {
  // Session
  app.use(session({
    secret: "shelf-secret-2024",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 },
  }));

  // Passport
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy({ usernameField: "username" }, (username, password, done) => {
    const user = storage.getUserByUsername(username) || storage.getUserByEmail(username);
    if (!user) return done(null, false, { message: "User not found" });
    if (user.passwordHash !== hashPassword(password)) return done(null, false, { message: "Incorrect password" });
    return done(null, user);
  }));

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser((id: number, done) => {
    const user = storage.getUserById(id);
    done(null, user || false);
  });

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ error: "Not authenticated" });
  };

  // --- AUTH ROUTES ---
  app.post("/api/auth/register", (req, res) => {
    try {
      const data = insertUserSchema.parse({
        username: req.body.username,
        email: req.body.email,
        displayName: req.body.displayName || req.body.username,
        passwordHash: hashPassword(req.body.password),
      });
      const existing = storage.getUserByUsername(data.username) || storage.getUserByEmail(data.email);
      if (existing) return res.status(400).json({ error: "Username or email already taken" });
      const user = storage.createUser(data);
      req.login(user, (err) => {
        if (err) return res.status(500).json({ error: "Login failed after register" });
        const { passwordHash, ...safe } = user;
        res.json(safe);
      });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ error: info?.message || "Invalid credentials" });
      req.login(user, (err) => {
        if (err) return next(err);
        const { passwordHash, ...safe } = user;
        res.json(safe);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ error: "Logout failed" });
      res.json({ ok: true });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
    const { passwordHash, ...safe } = req.user as any;
    res.json(safe);
  });

  // --- USER ROUTES ---
  app.get("/api/users/search", (req, res) => {
    const q = String(req.query.q || "").trim();
    if (!q) return res.json([]);
    const results = storage.searchUsers(q).map(({ passwordHash, ...u }) => u);
    res.json(results);
  });

  app.get("/api/users/:username", (req, res) => {
    const user = storage.getUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { passwordHash, ...safe } = user;
    const followerCount = storage.getFollowers(user.id).length;
    const followingCount = storage.getFollowing(user.id).length;
    const isFollowing = req.isAuthenticated()
      ? storage.isFollowing((req.user as any).id, user.id)
      : false;
    res.json({ ...safe, followerCount, followingCount, isFollowing });
  });

  app.patch("/api/users/me", requireAuth, (req, res) => {
    const user = req.user as any;
    const updated = storage.updateUser(user.id, {
      displayName: req.body.displayName,
      bio: req.body.bio,
      avatarUrl: req.body.avatarUrl,
    });
    if (!updated) return res.status(404).json({ error: "User not found" });
    const { passwordHash, ...safe } = updated;
    res.json(safe);
  });

  // --- SHELF ITEM ROUTES ---
  app.get("/api/shelf/:username", (req, res) => {
    const user = storage.getUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ error: "User not found" });
    const type = req.query.type as string | undefined;
    const items = storage.getShelfItemsByUser(user.id, type);
    res.json(items);
  });

  app.post("/api/shelf", requireAuth, (req, res) => {
    try {
      const user = req.user as any;
      const data = insertShelfItemSchema.parse({ ...req.body, userId: user.id });
      const item = storage.createShelfItem(data);
      res.json(item);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.patch("/api/shelf/:id", requireAuth, (req, res) => {
    const item = storage.getShelfItemById(Number(req.params.id));
    if (!item) return res.status(404).json({ error: "Item not found" });
    if (item.userId !== (req.user as any).id) return res.status(403).json({ error: "Not your item" });
    const updated = storage.updateShelfItem(item.id, req.body);
    res.json(updated);
  });

  app.delete("/api/shelf/:id", requireAuth, (req, res) => {
    const item = storage.getShelfItemById(Number(req.params.id));
    if (!item) return res.status(404).json({ error: "Item not found" });
    if (item.userId !== (req.user as any).id) return res.status(403).json({ error: "Not your item" });
    storage.deleteShelfItem(item.id);
    res.json({ ok: true });
  });

  // --- FOLLOW ROUTES ---
  app.post("/api/follow/:username", requireAuth, (req, res) => {
    const me = req.user as any;
    const target = storage.getUserByUsername(req.params.username);
    if (!target) return res.status(404).json({ error: "User not found" });
    if (target.id === me.id) return res.status(400).json({ error: "Cannot follow yourself" });
    if (storage.isFollowing(me.id, target.id)) return res.status(400).json({ error: "Already following" });
    storage.follow({ followerId: me.id, followingId: target.id });
    res.json({ ok: true });
  });

  app.delete("/api/follow/:username", requireAuth, (req, res) => {
    const me = req.user as any;
    const target = storage.getUserByUsername(req.params.username);
    if (!target) return res.status(404).json({ error: "User not found" });
    storage.unfollow(me.id, target.id);
    res.json({ ok: true });
  });

  app.get("/api/followers/:username", (req, res) => {
    const user = storage.getUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ error: "User not found" });
    const followers = storage.getFollowers(user.id).map(({ passwordHash, ...u }) => u);
    res.json(followers);
  });

  app.get("/api/following/:username", (req, res) => {
    const user = storage.getUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ error: "User not found" });
    const following = storage.getFollowing(user.id).map(({ passwordHash, ...u }) => u);
    res.json(following);
  });

  // --- RECOMMENDATION ROUTES ---
  app.post("/api/recommend", requireAuth, (req, res) => {
    try {
      const me = req.user as any;
      const toUser = storage.getUserByUsername(req.body.toUsername);
      if (!toUser) return res.status(404).json({ error: "Target user not found" });
      const item = storage.getShelfItemById(Number(req.body.shelfItemId));
      if (!item) return res.status(404).json({ error: "Item not found" });
      if (item.userId !== me.id) return res.status(403).json({ error: "Can only recommend your own items" });
      const rec = storage.createRecommendation({
        fromUserId: me.id,
        toUserId: toUser.id,
        shelfItemId: item.id,
        message: req.body.message || "",
      });
      res.json(rec);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/recommendations/inbox", requireAuth, (req, res) => {
    const me = req.user as any;
    const recs = storage.getRecommendationsForUser(me.id);
    res.json(recs.map(r => ({
      ...r,
      fromUser: (() => { const { passwordHash, ...u } = r.fromUser; return u; })(),
    })));
  });

  app.get("/api/recommendations/sent", requireAuth, (req, res) => {
    const me = req.user as any;
    const recs = storage.getRecommendationsFromUser(me.id);
    res.json(recs.map(r => ({
      ...r,
      toUser: (() => { const { passwordHash, ...u } = r.toUser; return u; })(),
    })));
  });

  // Get single shelf item by ID (public)
  app.get("/api/shelf-item/:id", (req, res) => {
    const item = storage.getShelfItemById(Number(req.params.id));
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  });

  // Book search via Open Library
  app.get("/api/search/books", async (req, res) => {
    const q = String(req.query.q || "").trim();
    if (!q) return res.json([]);
    try {
      const resp = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=12&fields=key,title,author_name,cover_i,first_publish_year,subject`);
      const data = await resp.json() as any;
      const results = (data.docs || []).map((d: any) => ({
        externalId: d.key,
        title: d.title,
        creator: (d.author_name || []).slice(0, 2).join(", "),
        coverUrl: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg` : "",
        year: String(d.first_publish_year || ""),
        genre: (d.subject || []).slice(0, 2).join(", "),
        type: "book",
      }));
      res.json(results);
    } catch {
      res.json([]);
    }
  });

  // Movie search via TMDB (no key needed for basic search via open API)
  app.get("/api/search/movies", async (req, res) => {
    const q = String(req.query.q || "").trim();
    if (!q) return res.json([]);
    try {
      const resp = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`);
      // Fallback: use OMDB-style approach with Open Movie DB free tier
      // Use TVMaze for TV + Cinemagoer won't work without key — use TMDB free search
      const tvData = await resp.json() as any;
      const tvResults = (tvData || []).slice(0, 6).map((d: any) => ({
        externalId: String(d.show?.id || ""),
        title: d.show?.name || "",
        creator: (d.show?.network?.name || d.show?.webChannel?.name || ""),
        coverUrl: d.show?.image?.medium || d.show?.image?.original || "",
        year: d.show?.premiered?.substring(0, 4) || "",
        genre: (d.show?.genres || []).slice(0, 2).join(", "),
        type: "movie",
      })).filter((d: any) => d.title);

      // Also try OMDB style search for movies
      const omdbResp = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(q)}&apikey=trilogy`);
      const omdbData = await omdbResp.json() as any;
      const omdbResults = (omdbData.Search || []).slice(0, 6).map((d: any) => ({
        externalId: d.imdbID,
        title: d.Title,
        creator: "",
        coverUrl: d.Poster !== "N/A" ? d.Poster : "",
        year: d.Year,
        genre: "",
        type: "movie",
      }));

      const combined = [...tvResults, ...omdbResults].slice(0, 12);
      res.json(combined.length > 0 ? combined : tvResults);
    } catch {
      res.json([]);
    }
  });

  // Podcast search via iTunes
  app.get("/api/search/podcasts", async (req, res) => {
    const q = String(req.query.q || "").trim();
    if (!q) return res.json([]);
    try {
      const resp = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=podcast&limit=12`);
      const data = await resp.json() as any;
      const results = (data.results || []).map((d: any) => ({
        externalId: String(d.collectionId),
        title: d.collectionName,
        creator: d.artistName,
        coverUrl: d.artworkUrl600 || d.artworkUrl100 || "",
        year: d.releaseDate?.substring(0, 4) || "",
        genre: d.primaryGenreName || "",
        type: "podcast",
      }));
      res.json(results);
    } catch {
      res.json([]);
    }
  });
}
