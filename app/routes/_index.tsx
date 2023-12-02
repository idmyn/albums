import type { MetaFunction } from "@remix-run/node";
import { Redirect, effectLoader } from "~/lib/effect";
import { getSession } from "~/sessions";
import { Effect } from "effect";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "albums" },
    { name: "description", content: "see your albums sorted by colour" },
  ];
};

export const loader = effectLoader("index", ({ request }) => {
  // TODO get/provide session data in effectLoader
  return getSession(request.headers.get("Cookie")).pipe(
    Effect.map((session) => {
      const userId = session.get("userId");
      if (typeof userId === "string") {
        return new Redirect(`/user/${userId}`);
      } else {
        return null;
      }
    })
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
