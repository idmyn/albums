import type { MetaFunction } from "@remix-run/node";
import { Link } from "../components/Link";
import { Box, Flex, Text } from "@radix-ui/themes";
import { Redirect, effectLoader } from "~/lib/effect";
import { getSession } from "~/sessions";
import { Effect } from "effect";

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
      <Flex p="7" direction="column" gap="3" style={{ textAlign: "center" }}>
        <Text as="p" size="7">
          wanna see your saved albums arranged by colour?
        </Text>
        <Link size="6" color="green" to="/login">
          log in with spotify
        </Link>
      </Flex>
    </div>
  );
}
