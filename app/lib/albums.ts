import { Effect, Stream, Chunk, pipe } from "effect";
import { updateUserJobInfo } from "./jobs";
import { fetchAlbums, SpotifyAlbum } from "./spotify/albums";
import { average } from "./color";
import { storeUserAlbums } from "./db/queries/albums";

export const triggerAlbumsFetchAndStore = (
  userId: string,
  accessToken: string
): Effect.Effect<never, unknown, unknown> => {
  return Effect.sync(() => {
    updateUserJobInfo(userId, "albums-fetch", { status: "running" });
    // intentionally not awaited
    pipe(
      fetchAlbums(userId, accessToken),
      Stream.flatMap(({ album }) => processAlbum(album)),
      Stream.grouped(50),
      Stream.tap((albums) => storeUserAlbums(userId, Chunk.toArray(albums))),
      Stream.runCollect, // TODO finalizer?
      Effect.tap(() => {
        updateUserJobInfo(userId, "albums-fetch", { status: "completed" });
        return Effect.succeedNone;
      }),
      Effect.runPromise
    );
  });
};

const processAlbum = (album: SpotifyAlbum) =>
  pipe(
    // NOTE: could move average into schema transformation
    average(album.images.smallImageUrl),
    Effect.map((averageColor) => {
      const { smallImageUrl, mediumImageUrl, largeImageUrl } = album.images;

      return {
        id: album.id,
        name: album.name,
        averageColor: averageColor.toHex(),
        artists: album.artists,
        smallImageUrl,
        mediumImageUrl,
        largeImageUrl,
      };
    })
  );
