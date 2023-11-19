import { Effect, Stream, Chunk, Option, pipe } from "effect";
import * as S from "@effect/schema/Schema";
import * as PR from "@effect/schema/ParseResult";
import { updateUserJobInfo } from "../jobs";

const fetchAlbumsPage = (access_token: string, pageUrl?: string) =>
  pipe(
    Effect.tryPromise({
      try: async () => {
        const firstPage = "https://api.spotify.com/v1/me/albums?limit=50";
        return fetch(pageUrl ?? firstPage, {
          headers: {
            Authorization: "Bearer " + access_token,
          },
        }).then((res) => res.json());
      },
      catch: () => new Error(),
    }),
    Effect.flatMap(S.parseEither(SpotifyAlbumsResponse))
  );

export const fetchAlbums = (userId: string, access_token: string) =>
  Stream.paginateChunkEffect(
    "https://api.spotify.com/v1/me/albums?limit=50",
    (pageUrl) => {
      return fetchAlbumsPage(access_token, pageUrl).pipe(
        Effect.map((output) => {
          const { total, next } = output;
          const progress = getProgressFromNextUrl(next);

          if (Option.isSome(progress)) {
            // TODO: this should just be the albums total set on user row
            // then progress can be determined from how many albums we have in db
            // NOTE: perhaps I don't calculate average colour immediately
            // then I have a job running every second or so, calculating averages
            // where they don't exist
            updateUserJobInfo(userId, "albums-fetch", {
              status: "running",
              data: { total, fetchedSoFar: progress.value },
            });
          }

          return [Chunk.fromIterable(output.items), next];
        })
      );
    }
  );

const getProgressFromNextUrl = (
  nextUrl: Option.Option<string>
): Option.Option<number> => {
  return Option.match(nextUrl, {
    onNone: () => Option.none(),
    onSome: (u) => {
      const url = new URL(u);
      const params = url.searchParams;
      const step = Number(params.get("limit"));
      const nextOffset = Number(params.get("offset"));
      if (!isNaN(step) && !isNaN(nextOffset)) {
        return Option.some(nextOffset - step);
      }

      return Option.none();
    },
  });
};

const SpotifyArtist = S.struct({
  id: S.string,
  name: S.string,
});
type SpotifyArtist = S.Schema.To<typeof SpotifyArtist>;

const SpotifyAlbum = S.struct({
  id: S.string,
  name: S.string,
  artists: S.array(SpotifyArtist),
  images: S.array(
    S.struct({
      height: S.number,
      width: S.number,
      url: S.string,
    })
  ).pipe(
    S.itemsCount(3),
    S.transformOrFail(
      S.struct({
        smallImageUrl: S.string,
        mediumImageUrl: S.string,
        largeImageUrl: S.string,
      }),
      (arr) => {
        const images = [...arr].sort((a, b) => a.width - b.width);
        return PR.success({
          smallImageUrl: images[0]!.url,
          mediumImageUrl: images[1]!.url,
          largeImageUrl: images[2]!.url,
        });
      },
      (_) => PR.failure(PR.forbidden)
    )
  ),
});
export type SpotifyAlbum = S.Schema.To<typeof SpotifyAlbum>;

//class SpotifyAlbumImages extends S.Class<SpotifyAlbumImages>()({
//
//})
//
//class Foo extends SpotifyAlbum.transform<Foo>()(
//  {
//    smallImageUrl: S.string,
//    mediumImageUrl: S.string,
//    largeImageUrl: S.string,
//    averageColor: S.string,
//  },
//  (input) => {
//    const foo = input.images[3]
//  }
//)

const SpotifyAlbumsResponse = S.struct({
  items: S.array(S.struct({ added_at: S.Date, album: SpotifyAlbum })),
  next: S.optionFromNullable(S.string),
  total: S.number,
});
type SpotifyAlbumsResponse = S.Schema.To<typeof SpotifyAlbumsResponse>;
