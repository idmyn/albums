import { Effect, Stream, Chunk, pipe } from "effect";
import { fetchAlbums, SpotifyAlbum } from "./spotify/albums";
import { average } from "./color";
import { setFetchInfoForUser } from "./jobs";
import { storeUserAlbums, lookupAverageColors } from "./db/queries/albums";

export const triggerAlbumsFetchAndStore = (
  userId: string,
  accessToken: string
): Effect.Effect<never, unknown, unknown> => {
  return Effect.sync(() => {
    setFetchInfoForUser(userId, { inProgress: true });
    // intentionally not awaited
    pipe(
      fetchAlbums(userId, accessToken),
      Stream.flatMap((_albums) => {
        const albums = Chunk.toArray(_albums).map(({ album }) => album);
        return lookupAverageColors(albums);
      }),
      Stream.flatMap((albums) =>
        pipe(
          albums.map(processAlbum),
          Effect.all // TODO concurrency?
        )
      ),
      Stream.tap((albums) => storeUserAlbums(userId, albums)),
      Stream.runCollect, // TODO finalizer?
      Effect.tap(() => {
        setFetchInfoForUser(userId, { inProgress: false });
        return Effect.succeedNone;
      }),
      Effect.runPromise
    );
  });
};

const processAlbum = (album: SpotifyAlbum & { averageColor?: string }) => {
  const { smallImageUrl, mediumImageUrl, largeImageUrl } = album.images;
  return (
    album.averageColor
      ? Effect.succeed(album.averageColor)
      : average(album.images.smallImageUrl).pipe(Effect.map((c) => c.toHex()))
  ).pipe(
    Effect.map((averageColor) => ({
      id: album.id,
      name: album.name,
      averageColor,
      artists: album.artists,
      smallImageUrl,
      mediumImageUrl,
      largeImageUrl,
    }))
  );
};
