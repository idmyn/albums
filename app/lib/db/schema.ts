import { sqliteTable, text, int, primaryKey } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

const createdAt = int("created_at", { mode: "timestamp" }).default(
  sql`(strftime('%s','now'))`,
);

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  createdAt,
});
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const usersRelations = relations(users, ({ many }) => ({
  albumsToUsers: many(albumsToUsers),
}));

export const artists = sqliteTable("artists", {
  createdAt,
  id: text("id").primaryKey(),
  name: text("name"),
});
export type Artist = typeof artists.$inferSelect;
export type NewArtist = typeof artists.$inferInsert;

export const albums = sqliteTable("albums", {
  createdAt,
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  averageColor: text("average_color").notNull(),
  smallImageUrl: text("small_image_url").notNull(),
  mediumImageUrl: text("medium_image_url").notNull(),
  largeImageUrl: text("large_image_url").notNull(),
});
export type Album = typeof albums.$inferSelect;
export type NewAlbum = typeof albums.$inferInsert;

export const albumRelations = relations(albums, ({ many }) => ({
  albumsToUsers: many(albumsToUsers),
  albumsToArtists: many(albumsToArtists),
}));

export const albumsToUsers = sqliteTable(
  "albums_to_users",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    albumId: text("album_id")
      .notNull()
      .references(() => albums.id),
  },
  (t) => ({
    pk: primaryKey(t.userId, t.albumId),
  }),
);

export const albumsToUsersRelations = relations(albumsToUsers, ({ one }) => ({
  album: one(albums, {
    fields: [albumsToUsers.albumId],
    references: [albums.id],
  }),
  user: one(users, {
    fields: [albumsToUsers.userId],
    references: [users.id],
  }),
}));

export const albumsToArtists = sqliteTable(
  "albums_to_artists",
  {
    albumId: text("album_id")
      .notNull()
      .references(() => albums.id),
    artistId: text("artist_id")
      .notNull()
      .references(() => artists.id),
  },
  (t) => ({
    pk: primaryKey(t.artistId, t.albumId),
  }),
);

export const albumsToArtistsRelations = relations(
  albumsToArtists,
  ({ one }) => ({
    album: one(albums, {
      fields: [albumsToArtists.albumId],
      references: [albums.id],
    }),
    artist: one(artists, {
      fields: [albumsToArtists.artistId],
      references: [artists.id],
    }),
  }),
);
