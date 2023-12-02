import { Data } from "effect";

type CommonErrorFields = {
  cause: unknown;
};

export class GetUserRequestError extends Data.TaggedError(
  "GetUserRequestError"
)<CommonErrorFields> {}

export class GetTokensRequestError extends Data.TaggedError(
  "GetTokensRequestError"
)<CommonErrorFields> {}

export class GetAlbumsRequestError extends Data.TaggedError(
  "GetAlbumsRequestError"
)<CommonErrorFields> {}
