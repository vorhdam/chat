# Ratelimit

This package exports a rate limiter function to supress frequent or malicious request.

This packages uses the `@repo/redis` package so it should only be used on the server. Using this code on the client will bundle the private Redis to the browser which would create a huge vulnerability. If you need caching on the client please use [React's cache](https://react.dev/reference/react/cache).

Redis methods should only be used from the server! That is why this package imports `server-only`, a package that prevents Redis being bundled into the client.
