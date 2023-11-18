import { Redirect, effectLoader } from "~/lib/effect";
import { spotifyAuthState } from "~/cookies.server";
import { pipe, Effect } from "effect";
import { fetchTokens, fetchUser } from "~/lib/spotify/users";
import { storeUser } from "~/lib/db/queries/users";
import { triggerAlbumsFetchAndStore } from "~/lib/albums";

export const loader = effectLoader(({ request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code) {
    return Effect.fail(new Error());
  }

  const cookieHeader = request.headers.get("Cookie");

  const checkCookie = Effect.tryPromise({
    try: () => spotifyAuthState.parse(cookieHeader),
    catch: () => new Error(),
  }).pipe(
    Effect.map((storedState) => {
      if (!code || !state || state !== storedState) {
        return Effect.fail("cookie state didn't match");
      }
    })
  );

  return checkCookie.pipe(
    Effect.flatMap(() => fetchTokens(code)),
    Effect.flatMap((tokens) =>
      pipe(
        fetchUser(tokens),
        Effect.tap(storeUser),
        Effect.tap(({ id }) =>
          triggerAlbumsFetchAndStore(id, tokens.access_token)
        )
      )
    ),
    Effect.map((user) => new Redirect(`/user/${user.id}`))
  );
});
