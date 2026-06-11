import { RedisCacheService } from "./RedisCacheService.js";

export function createCacheService({ env }) {
  if (env.cache.provider !== "redis") {
    throw new Error(`Unsupported cache provider: ${env.cache.provider}`);
  }

  return new RedisCacheService({
    host: env.redis.host,
    port: env.redis.port,
    password: env.redis.password,
    keyPrefix: env.redis.keyPrefix
  });
}