/**
 * Environment configuration.
 * Centralized parsing and validation of environment variables.
 */
export const ENV = {
  APP_ENV: process.env.NEXT_PUBLIC_ENV || "DEV",
  API_BASE_URL_PROD: process.env.NEXT_PUBLIC_BASE_URL_PROD,
  API_BASE_URL_STAGING: process.env.NEXT_PUBLIC_BASE_URL_STAGING,
  API_BASE_URL_DEV: process.env.NEXT_PUBLIC_BASE_URL_DEV || "http://localhost:3000/api",
  AUTH_ENDPOINT: process.env.NEXT_PUBLIC_AUTH || "/user/login",
  
  get apiUrl() {
    if (this.APP_ENV === "PROD") return this.API_BASE_URL_PROD;
    if (this.APP_ENV === "STAGING") return this.API_BASE_URL_STAGING;
    return this.API_BASE_URL_DEV;
  },
  
  endpoints: {
    auth: process.env.NEXT_PUBLIC_AUTH || "api/user/login",
    dashboard: process.env.NEXT_PUBLIC_DASHBOARD || "api/dashboard/v1",
    toppiLog: process.env.NEXT_PUBLIC_TOPPI_LOG || "api/toppi_log",
    toppiLogMobile: process.env.NEXT_PUBLIC_TOPPI_LOG_MOBILE || "api/toppi_log/mobile",
    toppi: process.env.NEXT_PUBLIC_TOPPI || "api/toppi",
    republish: process.env.NEXT_PUBLIC_REPUBLISH || "api/toppi_log/re-publish",
    reOcr: process.env.NEXT_PUBLIC_RE_OCR || "api/mqtt/to-ocr",
    reOcrPublish: process.env.NEXT_PUBLIC_RE_OCR_PUBLISH || "api/mqtt/to-ocr-publish",
    mqttLog: process.env.NEXT_PUBLIC_MQTT_LOG || "api/mqtt",
    mqttLogToday: process.env.NEXT_PUBLIC_MQTT_LOG_TODAY || "api/mqtt/today",
    mqttLogCounter: process.env.NEXT_PUBLIC_MQTT_LOG_COUNTER || "api/mqtt/counter",
    mqttLogCounterExp: process.env.NEXT_PUBLIC_MQTT_LOG_COUNTER_EXP || "api/mqtt/counter-export",
    customer: process.env.NEXT_PUBLIC_CUSTOMER || "api/customer",
    company: process.env.NEXT_PUBLIC_COMPANY || "api/company",
  }
};
