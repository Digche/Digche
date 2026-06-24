export class CacheService {
  async get(key) {
    throw new Error("CacheService.get is not implemented");
  }

  async set(key, value, ttlSeconds = null) {
    throw new Error("CacheService.set is not implemented");
  }

  async delete(key) {
    throw new Error("CacheService.delete is not implemented");
  }

  async exists(key) {
    throw new Error("CacheService.exists is not implemented");
  }

  async increment(key, ttlSeconds = null) {
    throw new Error("CacheService.increment is not implemented");
  }

  async ttl(key) {
    throw new Error("CacheService.ttl is not implemented");
  }

  async close() {
    throw new Error("CacheService.close is not implemented");
  }
}