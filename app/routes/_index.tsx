import type { MetaFunction } from "@remix-run/node";
import { Redirect, effectLoader } from "~/lib/effect";
import { Effect } from "effect";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "albums" },
    { name: "description", content: "see your albums sorted by colour" },
  ];
};

export const loader = effectLoader("index", ({ session }) => {
  const userId = session.get("userId");

  return Effect.succeed(
    typeof userId === "string" && new Redirect(`/user/${userId}`)
  );
});

export default function Index() {
  return (
    <div className="center-screen">
      <div className="text-center">
        <p className="mb-2 text-2xl">
          wanna see your saved albums arranged by colour?
        </p>
        <Link className="text-xl text-green-600 hover:underline" to="/login">
          log in with spotify
        </Link>
      </div>
    </div>
  );
}
