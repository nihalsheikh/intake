const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error("VITE_API_URL is not configured");
}

export const envConfig = {
  apiUrl,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;

export type EnvConfig = typeof envConfig;
