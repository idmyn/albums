import TTLCache from "@isaacs/ttlcache";

type FetchJobInfo = {
  inProgress: boolean;
  totalAlbumCount?: number;
};
const fetchJobCache = new TTLCache({ ttl: 1000 * 20 }); // 20 seconds
export const setFetchInfoForUser = (userId: string, info: FetchJobInfo) =>
  fetchJobCache.set(userId, info);
export const getFetchInfoForUser = (userId: string) =>
  fetchJobCache.get<FetchJobInfo>(userId);
