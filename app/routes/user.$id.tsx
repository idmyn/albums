import { Box, Container, Flex, Text } from "@radix-ui/themes";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { colord } from "colord";
import { Effect, pipe } from "effect";
import { sortByColor } from "~/lib/color";
import { getUserAlbums } from "~/lib/db/queries/users";
import { effectLoader } from "~/lib/effect";
import { useInterval } from "usehooks-ts";
import { getUserJobInfo } from "~/lib/jobs";
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
      const jobInfo = getUserJobInfo(userId, "albums-fetch");
      const isAlbumsFetchInProgress = jobInfo?.status === "running";
      const fetchStatus = jobInfo?.data;

      return { albums, isAlbumsFetchInProgress, fetchStatus };
    })
  );
});

export default function User() {
  const { albums, isAlbumsFetchInProgress, fetchStatus } =
    useLoaderData<typeof loader>();

  const revalidator = useRevalidator();

  useInterval(
    () => {
      revalidator.revalidate();
    },
    isAlbumsFetchInProgress ? 1000 : null
  );

  return (
    <Container size="4">
      {albums.length === 0 && isAlbumsFetchInProgress ? (
        <Center height="100vh">
          <Text size="6">fetching albums, hang tight...</Text>
        </Center>
      ) : (
        <>
          {!!fetchStatus && (
            <Box
              p="2"
              style={{
                textAlign: "right",
                backgroundColor: "white",
                position: "fixed",
                top: "var(--space-5)",
                right: "var(--space-5)",
              }}
            >
              <Text size="5">
                fetched & processed
                <br />
                {albums.length} / {fetchStatus.total} so far
                <br />
                hang tight
              </Text>
            </Box>
          )}
          <Flex pt="5" gap="3" wrap="wrap" justify="center">
            {albums.map((album) => (
              <img
                key={album.id}
                src={album.mediumImageUrl}
                alt={`album art for ${album.name}`}
              />
            ))}
          </Flex>
        </>
      )}
    </Container>
  );
}
