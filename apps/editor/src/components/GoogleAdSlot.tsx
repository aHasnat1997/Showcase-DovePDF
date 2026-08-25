import { useEffect, useRef, type CSSProperties } from "react";
import { ensureGoogleAdSense, googleConfig } from "../lib/google";

interface GoogleAdSlotProps {
  adSlot: string;
  className?: string;
  adStyle?: CSSProperties;
  fallbackLabel?: string;
}

export function GoogleAdSlot({
  adSlot,
  className,
  adStyle,
  fallbackLabel = "Ad Space",
}: GoogleAdSlotProps) {
  const hasPushedRef = useRef(false);

  const normalizedSlot = adSlot.trim();
  const isConfigured =
    googleConfig.adsenseClientId.length > 0 && normalizedSlot.length > 0;

  useEffect(() => {
    if (!isConfigured || hasPushedRef.current) {
      return;
    }

    let cancelled = false;

    const renderSlot = async () => {
      try {
        const isEnabled = await ensureGoogleAdSense();
        if (!isEnabled || cancelled) {
          return;
        }

        (window.adsbygoogle = window.adsbygoogle || []).push({});
        hasPushedRef.current = true;
      } catch (error) {
        console.warn("AdSense slot render failed", error);
      }
    };

    void renderSlot();

    return () => {
      cancelled = true;
    };
  }, [isConfigured]);

  if (!isConfigured) {
    return (
      <div
        className={className}
        aria-label="Advertisement placeholder"
        role="presentation"
      >
        <div>{fallbackLabel}</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...(adStyle || {}) }}
        data-ad-client={googleConfig.adsenseClientId}
        data-ad-slot={normalizedSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
        data-adtest={import.meta.env.DEV ? "on" : undefined}
      />
    </div>
  );
}
