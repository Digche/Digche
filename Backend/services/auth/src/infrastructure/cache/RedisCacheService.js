import Redis from "ioredis";
import { CacheService } from "../../application/services/CacheService.js";

export class RedisCacheService extends CacheService {
  constructor({
    host,
    port,
    password = null,
    keyPrefix = "auth:"
  }) {
    super();

    if (!host) {
      throw new Error("Redis host is required");
    }

    if (!port) {
      throw new Error("Redis port is required");
    }

    this.client = new Redis({
      host,
      port,
      password: password || undefined,
      keyPrefix,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true
    });

    this.client.on("error", (error) => {
      console.error("[RedisCacheService] Redis error:", error.message);
    });
  }

  async get(key) {
    const value = await this.client.get(key);

    if (value === null) {
      return null;
    }

    return this.deserialize(value);
  }

  async set(key, value, ttlSeconds = null) {
    const serializedValue = this.serialize(value);

    if (ttlSeconds) {
      await this.client.set(key, serializedValue, "EX", ttlSeconds);
      return true;
    }

    await this.client.set(key, serializedValue);
    return true;
  }

  async delete(key) {
    const deletedCount = await this.client.del(key);
    return deletedCount > 0;
  }

  async exists(key) {
    const exists = await this.client.exists(key);
    return exists === 1;
  }

  async increment(key, ttlSeconds = null) {
    const count = await this.client.incr(key);

    if (count === 1 && ttlSeconds) {
      await this.client.expire(key, ttlSeconds);
    }

    return count;
  }

  async ttl(key) {
    return this.client.ttl(key);
  }

  async close() {
    await this.client.quit();
  }

  serialize(value) {
    return JSON.stringify(value);
  }

  deserialize(value) {
    return JSON.parse(value);
  }
}