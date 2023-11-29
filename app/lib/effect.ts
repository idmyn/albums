import { Effect, Runtime } from "effect";
import { redirect as remixRedirect, LoaderFunctionArgs } from "@remix-run/node";
import { logAndMapErrors } from "./logger";
import { runtime } from "./tracing";

type RedirectOptions = Parameters<typeof remixRedirect>[1];

export class Redirect {
  readonly _tag = "Redirect";
  constructor(public path: string, public options?: RedirectOptions) {}
}

export const redirect = (path: string, options?: RedirectOptions) =>
  Effect.succeed(new Redirect(path, options));

const runPromise = Runtime.runPromise(runtime);

export const effectLoader = <V>(
  loaderName: string,
  cb: (args: LoaderFunctionArgs) => Effect.Effect<never, unknown, V>
) => {
  return async (args: LoaderFunctionArgs): Promise<V> => {
    const value = await cb(args).pipe(
      logAndMapErrors(() => new Redirect("/error")),
      Effect.withSpan(`loader.${loaderName}`),
      runPromise
    );

    if (value instanceof Redirect) {
      throw remixRedirect(value.path, value.options);
    }

    return value;
  };
};
