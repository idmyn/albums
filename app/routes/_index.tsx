import type { MetaFunction } from "@remix-run/node";
import { Link } from "../components/Link";
import { Center } from "~/components/Center";
import { Box, Flex, Text } from "@radix-ui/themes";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <Center height="100vh">
      <Flex p="7" direction="column" gap="3" style={{ textAlign: "center" }}>
        <Text as="p" size="7">
          wanna see your albums arranged by the colour of their album art?
        </Text>
        <Link size="6" color="green" to="/login">
          log in with spotify
        </Link>
      </Flex>
    </Center>
  );
}
