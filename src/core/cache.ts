
import { createClient } from 'redis';
import { environment } from '../config/environment';

const redisClient = createClient({
  host: environment.redisHost,
  port: environment.redisPort,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect();

export const cache = {
  async get(key: string) {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  },
  async set(key: string, data: any, ttl: number = environment.cacheTTL) {
    await redisClient.set(key, JSON.stringify(data), 'EX', ttl);
  },
};
