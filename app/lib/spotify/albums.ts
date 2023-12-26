import { Effect, Stream, Chunk, pipe } from "effect";
import * as S from "@effect/schema/Schema";
import * as PR from "@effect/schema/ParseResult";
import { setFetchInfoForUser } from "../jobs";
import { GetAlbumsRequestError, checkHeaders } from "./errors";
import * as Http from "@effect/platform/HttpClient";
import { IncomingMessage } from "@effect/platform/Http/IncomingMessage";

const schemaEitherBodyJson = <I, A>(schema: S.Schema<I, A>) => {
  const parse = S.parseEither(schema);
  return <E>(
    self: IncomingMessage<E>
  ): Effect.Effect<never, E | PR.ParseError, A> =>
    Effect.flatMap(self.json, parse);
};

export const fetchAlbumsPage = (access_token: string, pageUrl?: string) =>
  Http.request
    .get(pageUrl ?? "https://api.spotify.com/v1/me/albums?limit=50")
    .pipe(
      Http.request.setHeader("Authorization", "Bearer " + access_token),
      Http.client.fetch(),
      Effect.flatMap(checkHeaders),
      Effect.flatMap(schemaEitherBodyJson(SpotifyAlbumsResponse)),
      Effect.withSpan("spotify.fetchUser")
    );

export const fetchAlbums = (userId: string, access_token: string) => {
  const pageSize = 50;

  return Stream.paginateChunkEffect(
    `https://api.spotify.com/v1/me/albums?limit=${pageSize}`,
    (pageUrl) => {
      return fetchAlbumsPage(access_token, pageUrl).pipe(
        Effect.map((output) => {
          const { total, next } = output;

          setFetchInfoForUser(userId, {
            inProgress: true,
            totalAlbumCount: total,
          });

          return [Chunk.fromIterable(output.items), next];
        })
      );
    }
  ).pipe(Stream.grouped(pageSize));
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
        return PR.succeed({
          smallImageUrl: images[0]!.url,
          mediumImageUrl: images[1]!.url,
          largeImageUrl: images[2]!.url,
        });
      },
      (_) => PR.fail(PR.forbidden)
    )
  ),
});
export type SpotifyAlbum = S.Schema.To<typeof SpotifyAlbum>;

const SpotifyAlbumsResponse = S.struct({
  items: S.array(S.struct({ added_at: S.Date, album: SpotifyAlbum })),
  next: S.optionFromNullable(S.string),
  total: S.number,
});
type SpotifyAlbumsResponse = S.Schema.To<typeof SpotifyAlbumsResponse>;
