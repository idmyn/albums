import { Effect } from "effect";
import * as S from "@effect/schema/Schema";
import { env } from "../env";

export const fetchUser = ({ access_token }: Tokens) =>
  Effect.tryPromise({
    try: () =>
      fetch("https://api.spotify.com/v1/me", {
        headers: {
          authorization: "Bearer " + access_token,
        },
      }).then((res) => res.json()),
    catch: () => new GetUserRequestError(),
  }).pipe(Effect.flatMap(S.parse(User)));

class GetUserRequestError {
  readonly _tag = "GetUserRequestError";
}

class GetTokensRequestError {
  readonly _tag = "GetTokensRequestError";
}

const Tokens = S.struct({
  access_token: S.string,
  refresh_token: S.string,
});
type Tokens = S.Schema.To<typeof Tokens>;

const User = S.struct({
  id: S.string,
});
type User = S.Schema.To<typeof User>;

export function fetchTokens(code: string) {
  const payload = {
    code,
    redirect_uri: env.SPOTIFY_REDIRECT_URL,
    grant_type: "authorization_code",
  };

  const authorization =
    "Basic " +
    Buffer.from(
      env.SPOTIFY_CLIENT_ID + ":" + env.SPOTIFY_CLIENT_SECRET
    ).toString("base64");

  const formEncoded = Object.entries(payload)
    .map(
      ([key, value]) =>
        encodeURIComponent(key) + "=" + encodeURIComponent(value)
    )
    .join("&");

  return Effect.tryPromise({
    try: () =>
      fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          authorization,
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: formEncoded,
      }).then((res) => res.json()),
    catch: () => new GetTokensRequestError(),
  }).pipe(Effect.flatMap(S.parse(Tokens)));
}
