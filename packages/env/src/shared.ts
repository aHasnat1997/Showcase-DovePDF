import { z } from "zod";

// Shared environment variables used by both server and client
export const sharedEnvVars = {
  SERVER_URL: z
    .string()
    .url()
    .default("http://localhost:5050")
    .describe("Base URL of the API server"),
  API_HOST: z
    .string()
    .default("localhost")
    .describe("API server hostname"),
  API_PORT: z
    .coerce.number()
    .default(5050)
    .describe("API server port"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development")
    .describe("Application environment"),
};
