/**
 * Environment configuration.
 * Centralized parsing and validation of environment variables.
 */
export const ENV = {
  APP_ENV: process.env.NEXT_PUBLIC_ENV || "DEV",
  API_BASE_URL_PROD: process.env.NEXT_PUBLIC_BASE_URL_PROD,
  API_BASE_URL_STAGING: process.env.NEXT_PUBLIC_BASE_URL_STAGING,
  API_BASE_URL_DEV: process.env.NEXT_PUBLIC_BASE_URL_DEV || "http://localhost:8000",
  AUTH_ENDPOINT: process.env.NEXT_PUBLIC_AUTH || "user/login",
  
  get apiUrl() {
    if (this.APP_ENV === "PROD") return this.API_BASE_URL_PROD;
    if (this.APP_ENV === "STAGING") return this.API_BASE_URL_STAGING;
    return this.API_BASE_URL_DEV;
  }
};
