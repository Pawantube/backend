How Caching Helps: By storing frequently requested data in memory or a fast-access layer 
(e.g., Redis, Memcached), the application can serve subsequent requests more quickly.
Example: Instead of querying a database for the same user profile data repeatedly,
 store it in a cache and serve it instantly.


cycle of caching
=>1. When a client makes a request, your application first checks if the requested data is available in the cache.
=>2. Fetch Data if Cache Miss
If the data isn't found in the cache (a cache miss), your application queries the database or an external API to retrieve the required information.
=>3. Store Data in Cache
Once the data is fetched from the source, it is stored in the cache with a key and an optional time-to-live (TTL) value, so subsequent requests can fetch it quickly.
=>4 4. Serve the Response
After fetching and caching the data, send it back to the client as a response.
=>5 5. Cache Invalidation {+++}
Cached data becomes stale over time. You need a strategy to invalidate or update the cache when the underlying data changes. Common strategies include:
Time-based Expiration: Setting a TTL (e.g., setex) to automatically expire the cache.
Manual Invalidation: Deleting or updating specific cache entries when data changes.
=> this process is called in memory caching and this is done by redis package available in npm 
=>only try to cached that data which is not supposed to be change
=>get setx del set