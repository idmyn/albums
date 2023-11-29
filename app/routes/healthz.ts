import { Effect } from "effect";
import { effectLoader } from "~/lib/effect";

export const loader = effectLoader("healthz", () => Effect.succeed("ok"));
