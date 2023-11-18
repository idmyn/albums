import { db } from "../client";
import { mapDbError } from "../errors";
import { users, User } from "../schema";
import { Effect } from "effect";
import { eq } from "drizzle-orm";

export const storeUser = (user: User) =>
  Effect.tryPromise({
    try: () => db.insert(users).values(user).onConflictDoNothing().run(),
    catch: mapDbError,
  });

export const getUserAlbums = (userId: string) =>
  Effect.tryPromise({
    try: () =>
      db.query.users.findFirst({
        where: eq(users.id, userId),
        with: {
          albumsToUsers: {
            with: {
              album: {
                with: {
                  albumsToArtists: {
                    with: {
                      artist: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    catch: mapDbError,
  }).pipe(
    Effect.map((result) => {
      return result?.albumsToUsers
        .flatMap(({ album }) => album)
        .map(({ albumsToArtists, ...album }) => ({
          ...album,
          artists: albumsToArtists.map(({ artist }) => artist),
        }));
    }),
  );
