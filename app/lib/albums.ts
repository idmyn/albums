import { Effect, Stream, Chunk, pipe } from "effect";
import { updateUserJobStatus } from "./jobs";
import { fetchAlbums, SpotifyAlbum } from "./spotify/albums";
import { average } from "./color";
import { storeUserAlbums } from "./db/queries/albums";

export const triggerAlbumsFetchAndStore = (
  userId: string,
  accessToken: string
): Effect.Effect<never, unknown, unknown> => {
  return Effect.sync(() => {
    updateUserJobStatus(userId, "albums-fetch", "running");
    // intentionally not awaited
    pipe(
      fetchAlbums(accessToken),
      Stream.flatMap(({ album }) => processAlbum(album)),
      Stream.runCollect,
      Effect.map(Chunk.toReadonlyArray),
      Effect.tap((albums) => {
        // NOTE: I reckon ideally I'd Stream.tap -> saveAlbum with batching
        // https://discord.com/channels/795981131316985866/1172228115150417930/1174276571859800105
        // storeAlbums(),
        console.log("finished! fetched this many albums:", albums.length);
        return storeUserAlbums(userId, albums);
      }),
      Effect.tap(() => {
        updateUserJobStatus(userId, "albums-fetch", "completed");
        return Effect.succeedNone;
      }),
      Effect.runPromise
    ).then(() => {
      console.log("done!");
    });
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
