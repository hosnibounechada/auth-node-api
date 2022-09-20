import { createClient, RedisClientType } from "redis";

class Redis {
  private static instance: Redis;
  private static client: RedisClientType;

  private constructor() {}

  public init(url: string) {
    Redis.client = createClient({ url });
    return Redis.client;
  }

  static getInstance() {
    if (!Redis.instance) Redis.instance = new Redis();
    return Redis.instance;
  }

  public getRedisClient() {
    return Redis.client;
  }
}

export default Redis.getInstance();
