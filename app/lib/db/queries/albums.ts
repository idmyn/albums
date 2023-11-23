import { db } from "../client";
import { mapDbError } from "../errors";
import {
  NewAlbum,
  NewArtist,
  albumsToArtists,
  albumsToUsers,
  albums,
  artists,
} from "../schema";
import { Effect } from "effect";
import { ReadonlyDeep } from "type-fest";
import { inArray } from "drizzle-orm";
import { SpotifyAlbum } from "~/lib/spotify/albums";

type AlbumWithArtists = NewAlbum & {
  artists: NewArtist[];
};

export const storeUserAlbums = (
  userId: string,
  newAlbums: ReadonlyDeep<AlbumWithArtists[]>
) => {
  const albumArtistPairs = newAlbums.flatMap((album) =>
    album.artists.map((artist) => ({
      albumId: album.id,
      artistId: artist.id,
    }))
  );

  const userAlbumParis = newAlbums.map((album) => ({
    userId,
    albumId: album.id,
  }));

  const albumsToStore: NewAlbum[] = newAlbums.map((album) => ({
    id: album.id,
    name: album.name,
    smallImageUrl: album.smallImageUrl,
    mediumImageUrl: album.mediumImageUrl,
    largeImageUrl: album.largeImageUrl,
    averageColor: album.averageColor,
  }));

  const artistsToStore: NewArtist[] = newAlbums.flatMap(
    (album) => album.artists
  );

  const storeAlbums = Effect.tryPromise({
    try: () =>
      db.insert(albums).values(albumsToStore).onConflictDoNothing().run(),
    catch: mapDbError,
  });

  const storeArtists = Effect.tryPromise({
    try: () =>
      db.insert(artists).values(artistsToStore).onConflictDoNothing().run(),
    catch: mapDbError,
  });

  const storeAlbumArtistPairs = Effect.tryPromise({
    try: () =>
      db
        .insert(albumsToArtists)
        .values(albumArtistPairs)
        .onConflictDoNothing()
        .run(),
    catch: mapDbError,
  });

  const storeUserAlbumPairs = Effect.tryPromise({
    try: () =>
      db
        .insert(albumsToUsers)
        .values(userAlbumParis)
        .onConflictDoNothing()
        .run(),
    catch: mapDbError,
  });

  const storeEntities = Effect.all([storeAlbums, storeArtists], {
    concurrency: "unbounded",
  });

  const storeRelationships = Effect.all(
    [storeAlbumArtistPairs, storeUserAlbumPairs],
    { concurrency: "unbounded" }
  );

  return Effect.all([storeEntities, storeRelationships]);
};

export const lookupAverageColors = (
  newAlbums: ReadonlyDeep<SpotifyAlbum[]>
) => {
  return Effect.tryPromise({
    try: () =>
      db.query.albums.findMany({
        where: inArray(
          albums.id,
          newAlbums.map((a) => a.id)
        ),
      }),
    catch: mapDbError,
  }).pipe(
    Effect.map((seenAlbums) =>
      newAlbums.map((newAlbum) => {
        const averageColor = seenAlbums.find(
          (a) => a.id === newAlbum.id
        )?.averageColor;
        return {
          ...newAlbum,
          averageColor,
        };
      })
    )
  );
};
