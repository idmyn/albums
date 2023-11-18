import { Container, Flex, Text } from "@radix-ui/themes";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { colord } from "colord";
import { Effect, pipe } from "effect";
import { sortByColor } from "~/lib/color";
import { getUserAlbums } from "~/lib/db/queries/users";
import { effectLoader } from "~/lib/effect";
import { useInterval } from "usehooks-ts";
import { getUserJobStatus } from "~/lib/jobs";
import { Center } from "~/components/Center";

export const loader = effectLoader(({ params }) => {
  const userId = params.id ?? "";
  return pipe(
    getUserAlbums(userId),
    Effect.map((albums) =>
      sortByColor(
        albums?.map((a) => ({ ...a, color: colord(a.averageColor) })) ?? []
      )
    ),
    Effect.map((albums) => {
      const isAlbumsFetchInProgress =
        getUserJobStatus(userId, "albums-fetch") === "running";
      return { albums, isAlbumsFetchInProgress };
    })
  );
});

export default function User() {
  const { albums, isAlbumsFetchInProgress } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  useInterval(revalidator.revalidate, isAlbumsFetchInProgress ? 1000 : null);

  return (
    <Container size="4">
      {isAlbumsFetchInProgress ? (
        <Center height="100vh">
          <Text size="6">loading...</Text>
        </Center>
      ) : (
        <Flex p="5" gap="3" wrap="wrap" justify="center">
          {albums.map((album) => (
            <img
              key={album.id}
              src={album.mediumImageUrl}
              alt={`album art for ${album.name}`}
            />
          ))}
        </Flex>
      )}
    </Container>
  );
}
