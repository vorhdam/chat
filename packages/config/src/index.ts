type Config = Readonly<{
  cache: {
    /** The time the cache lives by default in seconds.*/
    duration: number;
    /** The amount of time that the cache lock is released in milliseconds.*/
    lockTimeout: number;
    /** During a cache lock the second lookup polls this frequent in milliseconds.*/
    pollInterval: number;
  };
  ratelimit: {
    /** The time window in which the requests are checked in seconds.*/
    duration: number;
    /** The maximum amount of request that are allowed in that window above.*/
    limit: number;
  };
}>;

const config: Config = {
  cache: {
    duration: 600,
    lockTimeout: 3000,
    pollInterval: 100,
  },
  ratelimit: {
    duration: 60,
    limit: 300,
  },
};

export default config;
