"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InstallModalProps {
  apiKey: string;
  projectName: string;
}

const COMPONENT_CODE = `"use client";

import { useEffect, useState } from "react";

interface ShockCollarProps {
  apiKey: string;
  dashboardUrl: string;
  message?: string;
  subtitle?: string;
}

export function ShockCollar({
  apiKey,
  dashboardUrl,
  message = "ACCESS RESTRICTED",
  subtitle = "Please contact the site administrator.",
}: ShockCollarProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!apiKey || !dashboardUrl) {
      setIsLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await fetch(
          \\\`\\\${dashboardUrl}/api/check-status?key=\\\${encodeURIComponent(apiKey)}\\\`
        );
        const data = await response.json();
        setIsLocked(data.locked === true);
      } catch (error) {
        console.error("[ShockCollar] Failed to check status:", error);
        setIsLocked(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [apiKey, dashboardUrl]);

  if (isLoading || !isLocked) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        backdropFilter: "blur(20px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: "#ffffff",
        animation: "shockCollarFadeIn 2s ease-out forwards",
      }}
    >
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: "#ef4444",
          marginBottom: 32,
          animation: "shockCollarPulse 2s ease-in-out infinite",
        }}
      />
      <h1
        style={{
          fontSize: "clamp(2rem, 8vw, 4rem)",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          margin: 0,
          textAlign: "center",
        }}
      >
        {message}
      </h1>
      <p
        style={{
          fontSize: "clamp(0.875rem, 2vw, 1.125rem)",
          color: "rgba(255, 255, 255, 0.6)",
          marginTop: 16,
          textAlign: "center",
        }}
      >
        {subtitle}
      </p>
      <style>{\\\`
        @keyframes shockCollarFadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(20px); }
        }
        @keyframes shockCollarPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      \\\`}</style>
    </div>
  );
}`;

export function InstallModal({ apiKey, projectName }: InstallModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);

  const dashboardUrl = typeof window !== "undefined" ? window.location.origin : "";

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full shadow-sm">
          Install Protection
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            Install Protection on "{projectName}"
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Step 1: Component Code */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-sm">
                1
              </div>
              <div>
                <h3 className="text-base font-semibold">Create Component</h3>
                <p className="text-sm text-muted-foreground">Add the protection logic to your project.</p>
              </div>
            </div>
            
            <div className="ml-11">
              <p className="text-sm text-muted-foreground mb-2">
                Create <code className="bg-muted px-1.5 py-0.5 rounded text-xs border">components/ShockCollar.tsx</code> and paste this:
              </p>
              <div className="relative group">
                <div className="bg-muted/50 rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-[300px] border shadow-sm custom-scrollbar">
                  <pre>{COMPONENT_CODE}</pre>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity bg-background hover:bg-muted shadow-sm"
                  onClick={() => copyToClipboard(COMPONENT_CODE)}
                >
                  {copiedCode ? "Copied!" : "Copy Code"}
                </Button>
              </div>
            </div>
          </div>

          <div className="w-px h-8 bg-border ml-4 -my-4" />

          {/* Step 2: Usage */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-sm">
                2
              </div>
              <div>
                <h3 className="text-base font-semibold">Add to Layout</h3>
                <p className="text-sm text-muted-foreground">Apply globally to your application.</p>
              </div>
            </div>

            <div className="ml-11">
              <div className="bg-muted/50 rounded-xl p-4 font-mono text-sm overflow-x-auto border shadow-sm">
                <pre className="text-xs leading-relaxed">
{`import { ShockCollar } from "@/components/ShockCollar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ShockCollar
          apiKey="${apiKey}"
          dashboardUrl="${dashboardUrl}"
        />
        {children}
      </body>
    </html>
  );
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-muted/30 border-t">
           <div className="flex items-center gap-3 text-sm text-muted-foreground bg-background p-3 rounded-lg border shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Once installed, toggling the lock in your dashboard will immediately update the site.
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
