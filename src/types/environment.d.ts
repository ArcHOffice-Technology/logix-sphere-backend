declare namespace NodeJS {
    interface ProcessEnv {
      DB_HOST: string;
      DB_PORT: string;
      DB_USER: string;
      DB_PASSWORD: string;
      DB_NAME: string;
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;
      REDIS_HOST: string;
      REDIS_PORT: string;
      CACHE_TTL: string;
    }
  }
  