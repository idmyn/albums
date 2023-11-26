import { Cause, Effect } from "effect";

export const logger = {
  error: (cause: Cause.Cause<unknown>, extra?: Record<string, unknown>) => {
    console.error(Cause.pretty(cause), { extra });
    return Effect.succeedNone;
  },
};
