import TTLCache from "@isaacs/ttlcache";

const cache = new TTLCache({ ttl: 1000 * 20 }); // 20 seconds

const jobKey = (userId: string, jobName: JobName) =>
  `user:${userId}:job:${jobName}`;

type JobName = "albums-fetch";
type JobStatus = "running" | "completed" | "failed";

export const updateUserJobStatus = (
  userId: string,
  job: JobName,
  status: JobStatus,
) => cache.set(jobKey(userId, job), status);

export const getUserJobStatus = (userId: string, job: JobName) =>
  cache.get(jobKey(userId, job)) as JobStatus;
