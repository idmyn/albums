import { pipe, Cause, Effect, Console } from "effect";

export const logErrors = (p: Effect.Effect<never, unknown, unknown>) => {
  return pipe(
    p,
    Effect.sandbox,
    Effect.catchTags({
      Die: (cause) =>
        Console.log(`Caught a defect: ${cause.defect}`).pipe(
          Effect.as("fallback result on defect")
        ),
      Interrupt: (cause) =>
        Console.log(`Caught a defect: ${cause.fiberId}`).pipe(
          Effect.as("fallback result on fiber interruption")
        ),
      Fail: (cause) =>
        Console.log(`Caught a defect: ${cause.error}`).pipe(
          Effect.as("fallback result on failure")
        ),
    }),
    Effect.unsandbox
  );
};

export const logAndMapErrors = <V, E>(
  mapFn: (cause: Cause.Cause<unknown>) => E
): ((
  p: Effect.Effect<never, unknown, V>
) => Effect.Effect<never, unknown, V | E>) => {
  return (p) =>
    pipe(
      p,
      Effect.sandbox,
      Effect.catchTags({
        Die: (cause) =>
          Console.log(`Caught a defect: ${cause.defect}`).pipe(
            Effect.map(() => mapFn(cause))
          ),
        Interrupt: (cause) =>
          Console.log(`Caught a defect: ${cause.fiberId}`).pipe(
            Effect.map(() => mapFn(cause))
          ),
        Fail: (cause) =>
          Console.log(`Caught a defect: ${cause.error}`).pipe(
            Effect.map(() => mapFn(cause))
          ),
      }),
      Effect.unsandbox
    );
};
