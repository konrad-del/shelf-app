import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and, desc, like, or, inArray } from "drizzle-orm";
import {
  users, shelfItems, follows, recommendations, podcastEpisodes,
  type User, type InsertUser,
  type ShelfItem, type InsertShelfItem,
  type Follow, type InsertFollow,
  type Recommendation, type InsertRecommendation,
  type PodcastEpisode, type InsertPodcastEpisode,
} from "@shared/schema";

const sqlite = new Database("/data/shelf.db");
const db = drizzle(sqlite);

// Run migrations
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    bio TEXT DEFAULT '',
    avatar_url TEXT DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS shelf_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    creator TEXT NOT NULL DEFAULT '',
    cover_url TEXT DEFAULT '',
    description TEXT DEFAULT '',
    external_id TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'wishlist',
    genre TEXT DEFAULT '',
    year TEXT DEFAULT '',
    rating INTEGER DEFAULT 0,
    notes TEXT DEFAULT '',
    added_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS follows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    UNIQUE(follower_id, following_id)
  );
  CREATE TABLE IF NOT EXISTS podcast_episodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shelf_item_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    episode_number TEXT DEFAULT '',
    listened INTEGER NOT NULL DEFAULT 0,
    rating INTEGER DEFAULT 0,
    notes TEXT DEFAULT '',
    added_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user_id INTEGER NOT NULL,
    to_user_id INTEGER NOT NULL,
    shelf_item_id INTEGER NOT NULL,
    message TEXT DEFAULT '',
    created_at INTEGER NOT NULL
  );
`);

// Migrations for columns added after initial schema
try { sqlite.exec(`ALTER TABLE shelf_items ADD COLUMN public_notes TEXT DEFAULT ''`); } catch {}
try { sqlite.exec(`ALTER TABLE shelf_items ADD COLUMN tier TEXT DEFAULT ''`); } catch {}

export interface IStorage {
  // Users
  createUser(data: InsertUser): User;
  getUserById(id: number): User | undefined;
  getUserByUsername(username: string): User | undefined;
  getUserByEmail(email: string): User | undefined;
  updateUser(id: number, data: Partial<Pick<User, "displayName" | "bio" | "avatarUrl">>): User | undefined;
  searchUsers(query: string): User[];

  // Shelf Items
  createShelfItem(data: InsertShelfItem): ShelfItem;
  getShelfItemById(id: number): ShelfItem | undefined;
  getShelfItemsByUser(userId: number, type?: string): ShelfItem[];
  updateShelfItem(id: number, data: Partial<InsertShelfItem>): ShelfItem | undefined;
  deleteShelfItem(id: number): void;

  // Follows
  follow(data: InsertFollow): Follow;
  unfollow(followerId: number, followingId: number): void;
  isFollowing(followerId: number, followingId: number): boolean;
  getFollowers(userId: number): User[];
  getFollowing(userId: number): User[];

  // Episodes
  createEpisode(data: InsertPodcastEpisode): PodcastEpisode;
  getEpisodesByPodcast(shelfItemId: number): PodcastEpisode[];
  updateEpisode(id: number, data: Partial<InsertPodcastEpisode>): PodcastEpisode | undefined;
  deleteEpisode(id: number): void;

  // Recommendations
  createRecommendation(data: InsertRecommendation): Recommendation;
  getRecommendationsForUser(userId: number): (Recommendation & { fromUser: User; item: ShelfItem })[];
  getRecommendationsFromUser(userId: number): (Recommendation & { toUser: User; item: ShelfItem })[];

  // Feed
  getFollowingFeed(userId: number, limit?: number): (ShelfItem & { user: Omit<User, 'passwordHash'> })[]; 
}

export class SqliteStorage implements IStorage {
  createUser(data: InsertUser): User {
    return db.insert(users).values(data).returning().get()!;
  }

  getUserById(id: number): User | undefined {
    return db.select().from(users).where(eq(users.id, id)).get();
  }

  getUserByUsername(username: string): User | undefined {
    return db.select().from(users).where(eq(users.username, username)).get();
  }

  getUserByEmail(email: string): User | undefined {
    return db.select().from(users).where(eq(users.email, email)).get();
  }

  updateUser(id: number, data: Partial<Pick<User, "displayName" | "bio" | "avatarUrl">>): User | undefined {
    return db.update(users).set(data).where(eq(users.id, id)).returning().get();
  }

  searchUsers(query: string): User[] {
    const q = `%${query}%`;
    return db.select().from(users).where(
      or(like(users.username, q), like(users.displayName, q))
    ).all();
  }

  createShelfItem(data: InsertShelfItem): ShelfItem {
    const now = Date.now();
    return db.insert(shelfItems).values({ ...data, addedAt: now }).returning().get()!;
  }

  getShelfItemById(id: number): ShelfItem | undefined {
    return db.select().from(shelfItems).where(eq(shelfItems.id, id)).get();
  }

  getShelfItemsByUser(userId: number, type?: string): ShelfItem[] {
    if (type) {
      return db.select().from(shelfItems)
        .where(and(eq(shelfItems.userId, userId), eq(shelfItems.type, type)))
        .orderBy(desc(shelfItems.addedAt))
        .all();
    }
    return db.select().from(shelfItems)
      .where(eq(shelfItems.userId, userId))
      .orderBy(desc(shelfItems.addedAt))
      .all();
  }

  updateShelfItem(id: number, data: Partial<InsertShelfItem>): ShelfItem | undefined {
    return db.update(shelfItems).set(data).where(eq(shelfItems.id, id)).returning().get();
  }

  deleteShelfItem(id: number): void {
    db.delete(shelfItems).where(eq(shelfItems.id, id)).run();
  }

  follow(data: InsertFollow): Follow {
    const now = Date.now();
    return db.insert(follows).values({ ...data, createdAt: now }).returning().get()!;
  }

  unfollow(followerId: number, followingId: number): void {
    db.delete(follows).where(
      and(eq(follows.followerId, followerId), eq(follows.followingId, followingId))
    ).run();
  }

  isFollowing(followerId: number, followingId: number): boolean {
    const row = db.select().from(follows).where(
      and(eq(follows.followerId, followerId), eq(follows.followingId, followingId))
    ).get();
    return !!row;
  }

  getFollowers(userId: number): User[] {
    const rows = db.select().from(follows).where(eq(follows.followingId, userId)).all();
    return rows.map(f => db.select().from(users).where(eq(users.id, f.followerId)).get()).filter(Boolean) as User[];
  }

  getFollowing(userId: number): User[] {
    const rows = db.select().from(follows).where(eq(follows.followerId, userId)).all();
    return rows.map(f => db.select().from(users).where(eq(users.id, f.followingId)).get()).filter(Boolean) as User[];
  }

  createRecommendation(data: InsertRecommendation): Recommendation {
    const now = Date.now();
    return db.insert(recommendations).values({ ...data, createdAt: now }).returning().get()!;
  }

  getRecommendationsForUser(userId: number): (Recommendation & { fromUser: User; item: ShelfItem })[] {
    const recs = db.select().from(recommendations)
      .where(eq(recommendations.toUserId, userId))
      .orderBy(desc(recommendations.createdAt))
      .all();
    return recs.map(r => {
      const fromUser = db.select().from(users).where(eq(users.id, r.fromUserId)).get()!;
      const item = db.select().from(shelfItems).where(eq(shelfItems.id, r.shelfItemId)).get()!;
      return { ...r, fromUser, item };
    }).filter(r => r.fromUser && r.item);
  }

  getRecommendationsFromUser(userId: number): (Recommendation & { toUser: User; item: ShelfItem })[] {
    const recs = db.select().from(recommendations)
      .where(eq(recommendations.fromUserId, userId))
      .orderBy(desc(recommendations.createdAt))
      .all();
    return recs.map(r => {
      const toUser = db.select().from(users).where(eq(users.id, r.toUserId)).get()!;
      const item = db.select().from(shelfItems).where(eq(shelfItems.id, r.shelfItemId)).get()!;
      return { ...r, toUser, item };
    }).filter(r => r.toUser && r.item);
  }

  createEpisode(data: InsertPodcastEpisode): PodcastEpisode {
    const now = Date.now();
    return db.insert(podcastEpisodes).values({ ...data, addedAt: now }).returning().get()!;
  }

  getEpisodesByPodcast(shelfItemId: number): PodcastEpisode[] {
    return db.select().from(podcastEpisodes)
      .where(eq(podcastEpisodes.shelfItemId, shelfItemId))
      .orderBy(desc(podcastEpisodes.addedAt))
      .all();
  }

  updateEpisode(id: number, data: Partial<InsertPodcastEpisode>): PodcastEpisode | undefined {
    return db.update(podcastEpisodes).set(data).where(eq(podcastEpisodes.id, id)).returning().get();
  }

  deleteEpisode(id: number): void {
    db.delete(podcastEpisodes).where(eq(podcastEpisodes.id, id)).run();
  }

  getFollowingFeed(userId: number, limit = 30): (ShelfItem & { user: Omit<User, 'passwordHash'> })[] {
    const followingRows = db.select().from(follows).where(eq(follows.followerId, userId)).all();
    const followingIds = followingRows.map(f => f.followingId);
    if (followingIds.length === 0) return [];
    const items = db.select().from(shelfItems)
      .where(inArray(shelfItems.userId, followingIds))
      .orderBy(desc(shelfItems.addedAt))
      .limit(limit)
      .all();
    return items.map(item => {
      const u = db.select().from(users).where(eq(users.id, item.userId)).get()!;
      const { passwordHash, ...safeUser } = u;
      return { ...item, user: safeUser };
    }).filter(i => i.user);
  }
}

export const storage = new SqliteStorage();
