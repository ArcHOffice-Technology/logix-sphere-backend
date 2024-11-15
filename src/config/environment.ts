
import dotenv from 'dotenv';

dotenv.config();

export const environment = {
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: parseInt(process.env.DB_PORT || '5432', 10),
  dbUser: process.env.DB_USER || 'user',
  dbPassword: process.env.DB_PASSWORD || 'password',
  dbName: process.env.DB_NAME || 'logixsphere_db',
  jwtSecret: process.env.JWT_SECRET || 'default_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  cacheTTL: parseInt(process.env.CACHE_TTL || '600', 10),
};
