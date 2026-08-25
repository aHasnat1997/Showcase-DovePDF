import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_SERVER_URL: z
      .string()
      .url()
      .default("http://localhost:5050")
      .describe("API server URL for the web app"),
    VITE_API_HOST: z
      .string()
      .default("localhost")
      .describe("API server hostname"),
    VITE_GA_MEASUREMENT_ID: z
      .string()
      .default("")
      .describe("Google Analytics 4 measurement ID"),
    VITE_ADSENSE_CLIENT_ID: z
      .string()
      .default("")
      .describe("Google AdSense publisher client ID"),
    VITE_ADSENSE_SLOT_RIGHT_PANEL: z
      .string()
      .default("")
      .describe("AdSense slot ID for right panel ad placement"),
    VITE_ADSENSE_SLOT_PREVIEW_EMPTY: z
      .string()
      .default("")
      .describe("AdSense slot ID for preview empty state placement"),
  },
  runtimeEnv: (import.meta as any).env,
  emptyStringAsUndefined: true,
});
