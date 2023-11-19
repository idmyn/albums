import { Config } from "drizzle-kit";

export default {
  schema: "./app/lib/db/schema.ts",
  out: "./migrations",
  driver: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:./local.db",
    authToken: process.env.DATABASE_TOKEN,
  },
} satisfies Config;
