import TTLCache from "@isaacs/ttlcache";

const cache = new TTLCache({ ttl: 1000 * 20 }); // 20 seconds

const jobKey = (userId: string, jobName: JobName) =>
  `user:${userId}:job:${jobName}`;

type JobName = "albums-fetch";
type JobStatus = "running" | "completed" | "failed";

type JobData = {
  "albums-fetch": {
    fetchedSoFar: number;
    total: number;
  };
};

type JobInfo<J extends JobName> = {
  status: JobStatus;
  data?: JobData[J];
};

export const updateUserJobInfo = <J extends JobName>(
  userId: string,
  job: J,
  info: JobInfo<J>
) => cache.set(jobKey(userId, job), info);

export const getUserJobInfo = <J extends JobName>(userId: string, job: J) =>
  cache.get(jobKey(userId, job)) as undefined | JobInfo<J>;
