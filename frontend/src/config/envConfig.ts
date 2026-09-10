export const envConfig = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;

export type EnvConfig = typeof envConfig;
