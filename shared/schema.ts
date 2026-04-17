import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  bio: text("bio").default(""),
  avatarUrl: text("avatar_url").default(""),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Shelf items (books, podcasts, movies)
export const shelfItems = sqliteTable("shelf_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'book' | 'podcast' | 'movie'
  title: text("title").notNull(),
  creator: text("creator").notNull().default(""), // author / host / director
  coverUrl: text("cover_url").default(""),
  description: text("description").default(""),
  externalId: text("external_id").default(""), // google books id, tmdb id, etc.
  status: text("status").notNull().default("reading_list"), // per-type status values
  genre: text("genre").default(""),
  year: text("year").default(""),
  rating: integer("rating").default(0), // kept for legacy
  tier: text("tier").default(""), // S | A | B | C | D
  notes: text("notes").default(""),         // private notes
  publicNotes: text("public_notes").default(""), // public notes visible to anyone
  addedAt: integer("added_at").notNull().$defaultFn(() => Date.now()),
});

export const insertShelfItemSchema = createInsertSchema(shelfItems).omit({ id: true, addedAt: true });
export type InsertShelfItem = z.infer<typeof insertShelfItemSchema>;
export type ShelfItem = typeof shelfItems.$inferSelect;

// Follows (user -> user)
export const follows = sqliteTable("follows", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  followerId: integer("follower_id").notNull(),
  followingId: integer("following_id").notNull(),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
});

export const insertFollowSchema = createInsertSchema(follows).omit({ id: true, createdAt: true });
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type Follow = typeof follows.$inferSelect;

// Podcast episodes
export const podcastEpisodes = sqliteTable("podcast_episodes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  shelfItemId: integer("shelf_item_id").notNull(), // parent podcast
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").default(""),
  episodeNumber: text("episode_number").default(""),
  listened: integer("listened", { mode: "boolean" }).notNull().default(false),
  rating: integer("rating").default(0),
  notes: text("notes").default(""),
  addedAt: integer("added_at").notNull().$defaultFn(() => Date.now()),
});

export const insertPodcastEpisodeSchema = createInsertSchema(podcastEpisodes).omit({ id: true, addedAt: true });
export type InsertPodcastEpisode = z.infer<typeof insertPodcastEpisodeSchema>;
export type PodcastEpisode = typeof podcastEpisodes.$inferSelect;

// Recommendations (user recommends item to another user)
export const recommendations = sqliteTable("recommendations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fromUserId: integer("from_user_id").notNull(),
  toUserId: integer("to_user_id").notNull(),
  shelfItemId: integer("shelf_item_id").notNull(),
  message: text("message").default(""),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
});

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({ id: true, createdAt: true });
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;
