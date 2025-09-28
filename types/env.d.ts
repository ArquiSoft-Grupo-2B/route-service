declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    NODE_ENV?: string;
    FRONTEND_URL?: string;
    AUTH_SERVICE_URL?: string;
    CALCULATION_SERVICE_URL?: string;
    OSRM_PROFILE?: string;
    DB_HOST?: string;
    DB_PORT?: string;
    DB_USER?: string;
    DB_PASSWORD?: string;
    DB_NAME?: string;
  }
}
