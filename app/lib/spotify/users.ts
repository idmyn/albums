import { Effect } from "effect";
import * as S from "@effect/schema/Schema";
import { env } from "../env";
import { GetTokensRequestError, checkHeaders } from "./errors";
import * as Http from "@effect/platform/HttpClient";

export const USER_THAT_WORKS = "sa67jzfngj63u3ltursy3l1cq";

export const fetchUser = ({ access_token }: Tokens) =>
  Http.request
    .get("https://api.spotify.com/v1/me")
    .pipe(
      Http.request.setHeader("Authorization", "Bearer " + access_token),
      Http.client.fetch(),
      Effect.flatMap(checkHeaders),
      Effect.flatMap(Http.response.schemaBodyJson(User)),
      Effect.withSpan("spotify.fetchUser")
    );

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
    catch: (cause) => new GetTokensRequestError({ cause }),
  })
    .pipe(Effect.flatMap(S.parse(Tokens)))
    .pipe(Effect.withSpan("spotify.fetchTokens"));
}
