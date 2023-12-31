import { Effect, Runtime, Layer, Scope, pipe, Console } from "effect";
import { redirect as remixRedirect, LoaderFunctionArgs } from "@remix-run/node";
import { logAndMapErrors } from "./logger";
import { otelLayer } from "./tracing";
import { Session, getSession } from "~/sessions";
import { SpotifyUnauthorizedError } from "./spotify/errors";
import { USER_THAT_WORKS } from "./spotify/users";

type RedirectOptions = Parameters<typeof remixRedirect>[1];

export class Redirect {
  readonly _tag = "Redirect";
  constructor(public path: string, public options?: RedirectOptions) {}
}

export const redirect = (path: string, options?: RedirectOptions) =>
  Effect.succeed(new Redirect(path, options));

const scope = Effect.runSync(Scope.make());
export const runtime = Layer.toRuntime(otelLayer).pipe(
  Scope.extend(scope),
  Effect.runSync
);
const runPromise = Runtime.runPromise(runtime);

export const effectLoader = <V>(
  loaderName: string,
  cb: (
    args: LoaderFunctionArgs & { session: Session }
  ) => Effect.Effect<never, any, V> // TODO it'd be great to remove this 'any'
) => {
  return async (args: LoaderFunctionArgs): Promise<V> => {
    const loaderFn = pipe(
      getSession(args.request.headers.get("Cookie")),
      Effect.flatMap((session) => cb({ ...args, session })),
      Effect.withSpan(`loaders.${loaderName}`)
    );

    const value = await loaderFn.pipe(
      Effect.catchTag(
        "SpotifyUnauthorizedError",
        (err: SpotifyUnauthorizedError) =>
          Console.log(err).pipe(
            Effect.map(
              () => new Redirect(`/user/${USER_THAT_WORKS}?unauthorized=true`)
            )
          )
      ),
      logAndMapErrors(() => new Redirect("/error")),
      runPromise
    );

    if (value instanceof Redirect) {
      throw remixRedirect(value.path, value.options);
    }

    return value;
  };
};
