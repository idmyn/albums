import { Cause, Effect, Console } from "effect";

export const logErrors = (p: Effect.Effect<never, unknown, unknown>) => {
  return logAndMapErrors(() => Effect.succeedNone)(p);
};

export const logAndMapErrors = <V, E>(
  mapFn: (cause: Cause.Cause<unknown>) => E
): ((
  p: Effect.Effect<never, unknown, V>
) => Effect.Effect<never, unknown, V | E>) => {
  return (p) =>
    p.pipe(
      Effect.catchAllCause((cause) =>
        Console.log(cause).pipe(Effect.map(() => mapFn(cause)))
      )
    );
};
