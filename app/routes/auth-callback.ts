import { Redirect, effectLoader } from "~/lib/effect";
import { spotifyAuthState } from "~/cookies.server";
import { pipe, Effect } from "effect";
import { USER_THAT_WORKS, fetchTokens, fetchUser } from "~/lib/spotify/users";
import { storeUser } from "~/lib/db/queries/users";
import { triggerAlbumsFetchAndStore } from "~/lib/albums";
import { SemanticAttributes } from "@opentelemetry/semantic-conventions";
import { commitSession, getSession } from "~/sessions";
import { SpotifyUnauthorizedError } from "~/lib/spotify/errors";

export const loader = effectLoader("auth-callback", ({ request }) => {
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
        Effect.tap((user) =>
          Effect.annotateCurrentSpan({
            [SemanticAttributes.ENDUSER_ID]: user.id,
          })
        ),
        Effect.flatMap((user) => {
          if (user.id !== USER_THAT_WORKS) {
            return Effect.fail(
              new SpotifyUnauthorizedError({ userId: user.id })
            );
          }
          return Effect.succeed(user);
        }),
        Effect.tap(storeUser),
        Effect.tap(({ id }) =>
          triggerAlbumsFetchAndStore(id, tokens.access_token)
        )
      )
    ),
    Effect.flatMap((user) => {
      const updateSession = pipe(
        getSession(request.headers.get("Cookie")),
        Effect.flatMap((session) => {
          session.set("userId", user.id);
          return commitSession(session);
        })
      );

      return updateSession.pipe(
        Effect.map((header) => {
          return new Redirect(`/user/${user.id}`, {
            headers: {
              "Set-Cookie": header,
            },
          });
        })
      );
    })
  );
});
