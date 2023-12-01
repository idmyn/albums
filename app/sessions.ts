import { createCookieSessionStorage } from "@remix-run/node";
import { env } from "./lib/env";
import { Effect } from "effect";

type SessionData = {
  userId: string;
};

type SessionFlashData = {
  error: string;
};

const {
  getSession: _getSession,
  commitSession: _commitSession,
  destroySession,
} = createCookieSessionStorage<SessionData, SessionFlashData>({
  cookie: {
    name: "__session",

    httpOnly: true,
    maxAge: 31_536_000, // one year
    secrets: [env.SESSION_SECRET],
    secure: true,
  },
});

// todo make these more ergonomic
const getSession = (...args: Parameters<typeof _getSession>) =>
  Effect.tryPromise({
    try: () => _getSession(...args),
    catch: () => new Error(),
  });
const commitSession = (...args: Parameters<typeof _commitSession>) =>
  Effect.tryPromise({
    try: () => _commitSession(...args),
    catch: () => new Error(),
  });

export { getSession, commitSession, destroySession };
