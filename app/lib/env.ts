import * as S from "@effect/schema/Schema";
import { Either as E } from "effect";

// TODO use Config for this?
// https://discord.com/channels/795981131316985866/1128715133456236694/1130170957806448710

const Env = S.struct({
  NODE_ENV: S.optional(S.literal("production", "development"), {
    default: () => "development",
  }),
  SESSION_SECRET: S.string,
  SPOTIFY_CLIENT_ID: S.string,
  SPOTIFY_CLIENT_SECRET: S.string,
  SPOTIFY_REDIRECT_URL: S.string,
  DATABASE_URL: S.string,
});

const result = S.parseEither(Env)(process.env);

if (E.isLeft(result)) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(result.left.errors, null, 2)
  );
  throw process.exit(1);
}

export const env = result.right;
