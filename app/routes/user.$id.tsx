import { MetaFunction, useLoaderData, useRevalidator } from "@remix-run/react";
import { colord } from "colord";
import { Effect, pipe } from "effect";
import { sortByColor } from "~/lib/color";
import { getUserAlbums } from "~/lib/db/queries/users";
import { effectLoader } from "~/lib/effect";
import { useInterval } from "usehooks-ts";
import { getFetchInfoForUser } from "~/lib/jobs";

export const meta: MetaFunction = () => {
  return [{ title: "albums" }];
};

export const loader = effectLoader("user.$id", ({ params }) => {
  const userId = params.id ?? "";
  return pipe(
    getUserAlbums(userId),
    Effect.map((albums) =>
      sortByColor(
        albums?.map((a) => ({ ...a, color: colord(a.averageColor) })) ?? []
      )
    ),
    Effect.map((albums) => {
      const jobInfo = getFetchInfoForUser(userId);
      const totalAlbumCount = jobInfo?.totalAlbumCount;
      const isAlbumsFetchInProgress =
        jobInfo?.inProgress && albums.length !== totalAlbumCount;

      return { albums, isAlbumsFetchInProgress, totalAlbumCount };
    })
  );
});

export default function User() {
  const { albums, isAlbumsFetchInProgress, totalAlbumCount } =
    useLoaderData<typeof loader>();

  const revalidator = useRevalidator();

  useInterval(
    () => {
      revalidator.revalidate();
    },
    isAlbumsFetchInProgress ? 1000 : null
  );

  return (
    <div className="w-full py-5">
      {albums.length === 0 && isAlbumsFetchInProgress ? (
        <div className="center-screen">
          <div className="flex flex-col items-center gap-2">
            <span className="loading loading-spinner loading-xs" />
            <span>fetching albums, hang tight...</span>
          </div>
        </div>
      ) : (
        <>
          {isAlbumsFetchInProgress && !!totalAlbumCount && (
            <div className="fixed top-6 right-6 text-right bg-white p-1">
              <span>
                fetched & processed
                <br />
                {albums.length} / {totalAlbumCount} so far
                <br />
                hang tight
              </span>
            </div>
          )}
          <div className="w-3/4 mx-auto flex flex-wrap gap-3 justify-center">
            {albums.map((album) => (
              <img
                key={album.id}
                src={album.mediumImageUrl}
                alt={`album art for ${album.name}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
