import { Effect } from "effect";
import { spotifyAuthState } from "~/cookies.server";
import { effectLoader, redirect } from "~/lib/effect";
import { env } from "~/lib/env";

const randomString = (length: number) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let str = "";
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return str;
};

export const loader = effectLoader((_args) => {
  const state = randomString(16);

  const serializeCookie = Effect.tryPromise({
    try: () => spotifyAuthState.serialize(state),
    catch: () => new Error(),
  });

  const scope = "user-library-read";

  const queryParams = {
    response_type: "code",
    client_id: env.SPOTIFY_CLIENT_ID,
    scope: scope,
    redirect_uri: env.SPOTIFY_REDIRECT_URL,
    state: state,
  };

  const redirectUrl = new URL("https://accounts.spotify.com/authorize");

  Object.entries(queryParams).forEach(([name, value]) =>
    redirectUrl.searchParams.set(name, value)
  );

  return serializeCookie.pipe(
    Effect.flatMap((cookie) =>
      redirect(redirectUrl.href, {
        headers: { "Set-Cookie": cookie },
      })
    )
  );
});
