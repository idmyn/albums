import type { MetaFunction } from "@remix-run/node";
import { Link } from "../components/Link";
import { Center } from "~/components/Center";
import { Box, Flex, Text } from "@radix-ui/themes";

export const meta: MetaFunction = () => {
  return [
    { title: "albums" },
    { name: "description", content: "see your albums sorted by colour" },
  ];
};

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
