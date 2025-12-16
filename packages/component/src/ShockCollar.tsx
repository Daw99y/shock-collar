"use client";

import { useEffect, useState } from "react";

interface ShockCollarProps {
  /**
   * Your unique API key from the Shock Collar dashboard
   */
  apiKey: string;

  /**
   * The base URL of your Shock Collar dashboard
   * @default "https://your-dashboard.vercel.app"
   */
  dashboardUrl?: string;

  /**
   * Custom message to display when locked
   * @default "ACCESS RESTRICTED"
   */
  message?: string;

  /**
   * Custom subtitle to display when locked
   * @default "Please contact the site administrator."
   */
  subtitle?: string;
}

/**
 * ShockCollar - Remote License Management for Freelancers
 *
 * Embed this component in your client's site.
 * Control site access remotely from your dashboard.
 *
 * @example
 * ```tsx
 * import { ShockCollar } from "@shock-collar/react";
 *
 * function App() {
 *   return (
 *     <>
 *       <ShockCollar
 *         apiKey="sk_live_xxx"
 *         dashboardUrl="https://your-dashboard.vercel.app"
 *       />
 *       <YourApp />
 *     </>
 *   );
 * }
 * ```
 */
export function ShockCollar({
  apiKey,
  dashboardUrl = "",
  message = "ACCESS RESTRICTED",
  subtitle = "Please contact the site administrator.",
}: ShockCollarProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!apiKey || !dashboardUrl) {
      console.warn("[ShockCollar] Missing apiKey or dashboardUrl");
      setIsLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await fetch(
          `${dashboardUrl}/api/check-status?key=${encodeURIComponent(apiKey)}`
        );
        const data = await response.json();
        setIsLocked(data.locked === true);
      } catch (error) {
        console.error("[ShockCollar] Failed to check status:", error);
        // Fail open: don't lock the site if the API is unreachable
        setIsLocked(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Check status once on mount
    checkStatus();
  }, [apiKey, dashboardUrl]);

  // Don't render anything while loading or if unlocked
  if (isLoading || !isLocked) {
    return null;
  }

  // Locked state: Full-screen overlay
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 999999,
        backgroundColor: "rgba(255, 255, 255, 0.75)",
        backdropFilter: "blur(30px) saturate(180%)",
        WebkitBackdropFilter: "blur(30px) saturate(180%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: "#1d1d1f",
        userSelect: "none",
        animation: "shockCollarFadeIn 2s ease-out forwards",
      }}
    >
      {/* Main message */}
      <h1
        style={{
          fontSize: "clamp(2rem, 8vw, 4rem)",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          margin: 0,
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        {message}
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: "clamp(0.875rem, 2vw, 1.125rem)",
          color: "rgba(29, 29, 31, 0.6)",
          marginTop: 16,
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        {subtitle}
      </p>

      {/* CSS animation */}
      <style>
        {`
          @keyframes shockCollarFadeIn {
            from { opacity: 0; backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); }
            to { opacity: 1; backdrop-filter: blur(30px) saturate(180%); -webkit-backdrop-filter: blur(30px) saturate(180%); }
          }
        `}
      </style>
    </div>
  );
}

export default ShockCollar;
