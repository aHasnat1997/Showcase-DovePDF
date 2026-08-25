type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    adsbygoogle?: unknown[];
  }
}

export const googleConfig = {
  gaMeasurementId:
    (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim() ||
    "",
  adsenseClientId:
    (import.meta.env.VITE_ADSENSE_CLIENT_ID as string | undefined)?.trim() ||
    "",
} as const;

const appendScriptOnce = async (
  scriptId: string,
  src: string,
  attributes?: Record<string, string>,
): Promise<void> => {
  const existing = document.getElementById(
    scriptId,
  ) as HTMLScriptElement | null;
  if (existing) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = src;
    script.async = true;

    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        script.setAttribute(key, value);
      });
    }

    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error(`Failed to load script: ${src}`)),
      { once: true },
    );

    document.head.appendChild(script);
  });
};

export function initGoogleAnalytics(): void {
  const gaMeasurementId = googleConfig.gaMeasurementId;
  if (!gaMeasurementId) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };

  window.gtag("js", new Date());
  window.gtag("config", gaMeasurementId, {
    anonymize_ip: true,
  });

  void appendScriptOnce(
    "ga4-script",
    `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`,
  ).catch((error) => {
    console.warn("GA script failed to load", error);
  });
}

export async function ensureGoogleAdSense(): Promise<boolean> {
  const adsenseClientId = googleConfig.adsenseClientId;
  if (!adsenseClientId) {
    return false;
  }

  await appendScriptOnce(
    "adsense-script",
    `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsenseClientId)}`,
    {
      crossorigin: "anonymous",
    },
  );

  return true;
}
