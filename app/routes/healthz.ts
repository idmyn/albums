import { Effect } from "effect";
import { effectLoader } from "~/lib/effect";

export const loader = effectLoader(() => Effect.succeed("ok"));
