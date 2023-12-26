import { Data, Effect } from "effect";
import * as Http from "@effect/platform/HttpClient";

type CommonErrorFields = {
  cause: unknown;
};

export class GetUserRequestError extends Data.TaggedError(
  "GetUserRequestError"
)<CommonErrorFields> {}

export class SpotifyUnauthorizedError extends Data.TaggedError(
  "SpotifyUnauthorizedError"
)<CommonErrorFields> {}

export class GetTokensRequestError extends Data.TaggedError(
  "GetTokensRequestError"
)<CommonErrorFields> {}

export class GetAlbumsRequestError extends Data.TaggedError(
  "GetAlbumsRequestError"
)<CommonErrorFields> {}

// TODO improve this
// (probably replace with Http.client.filterStatus)
// https://github.com/Effect-TS/platform/blob/1ff034f601710c68b3f51da68c417d43896172e1/packages/platform-node/examples/http-client.ts#L29
export const checkHeaders = (
  response: Http.response.ClientResponse
): Effect.Effect<
  never,
  SpotifyUnauthorizedError,
  Http.response.ClientResponse
> => {
  const error = {
    403: new SpotifyUnauthorizedError({ cause: null }), // TODO
  }[response.status];

  if (error) return Effect.fail(error);

  return Effect.succeed(response);
};
