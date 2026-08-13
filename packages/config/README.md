# Redis

This package exports a redis client which is mostly used for caching and ratelimiting.

This packages uses [Bun's native Redis](https://bun.com/docs/runtime/redis) which is about 7x faster and consumes half as much memory as other Redis clients would. This makes scalability a bit less challenging while we keep the simplicity and DX. This proves useful if the app has unpredictable traffic.

Redis methods should only be used from the server! That is why this package imports `server-only`, a package that prevents Redis being bundled into the client.
