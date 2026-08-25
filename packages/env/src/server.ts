import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { sharedEnvVars } from "./shared";

export const env = createEnv({
  server: {
    ...sharedEnvVars,
    CORS_ORIGIN: z.url().describe("API server URL"),
    EDITOR_URL: z
      .url()
      .default("http://localhost:5173")
      .describe("Web editor URL"),
    PORT: z.coerce.number().default(5050).describe("Server port"),
    STIRLING_PDF_URL: z
      .url()
      .default("https://stirlingpdf.example.com")
      .describe("Base URL of the Stirling PDF server"),
    STIRLING_PDF_API_KEY: z
      .string()
      .default("")
      .describe("API key for Stirling PDF (X-API-KEY header)"),
    STIRLING_PDF_FONTS_DIR: z
      .string()
      .default("")
      .describe("Optional directory for custom fonts to embed in HTML"),
    // Landing page runtime tokens — injected into the built HTML at serve time
    // so the Docker image doesn't need build-args for these values.
    GA_MEASUREMENT_ID: z
      .string()
      .default("")
      .describe("Google Analytics GA4 Measurement ID (e.g. G-XXXXXXX)"),
    ADSENSE_CLIENT_ID: z
      .string()
      .default("")
      .describe("Google AdSense publisher ID (e.g. ca-pub-XXXXXXXX)"),
    ADSENSE_SLOT_LANDING_HERO: z
      .string()
      .default("")
      .describe("AdSense ad slot ID for the hero strip"),
    ADSENSE_SLOT_LANDING_CTA: z
      .string()
      .default("")
      .describe("AdSense ad slot ID for the CTA strip"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

// Export API_HOST and API_PORT for landing page serving
export const API_HOST = env.API_HOST;
export const API_PORT = env.API_PORT;
