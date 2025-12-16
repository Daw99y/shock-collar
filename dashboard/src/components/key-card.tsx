"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ApiKey } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { InstallModal } from "@/components/install-modal";

interface KeyCardProps {
  apiKey: ApiKey;
}

export function KeyCard({ apiKey }: KeyCardProps) {
  const [isLocked, setIsLocked] = useState(apiKey.is_locked);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleToggle = async () => {
    setIsUpdating(true);
    const newLockState = !isLocked;

    const { error } = await supabase
      .from("api_keys")
      .update({ is_locked: newLockState })
      .eq("id", apiKey.id);

    if (error) {
      console.error("Failed to update lock status:", error);
      setIsUpdating(false);
      return;
    }

    setIsLocked(newLockState);
    setIsUpdating(false);
    router.refresh();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="bg-card/50 border-border/50 hover:border-border transition-colors">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          {/* Left side: Project info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-medium truncate">{apiKey.project_name}</h3>
              <Badge
                variant={isLocked ? "destructive" : "secondary"}
                className="shrink-0"
              >
                {isLocked ? "LOCKED" : "ACTIVE"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono">
                {apiKey.key_value}
              </code>
              <span className="hidden sm:inline">
                Created {formatDate(apiKey.created_at)}
              </span>
            </div>
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center gap-3">
            <InstallModal apiKey={apiKey.key_value} projectName={apiKey.project_name} />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {isLocked ? "Unlock" : "Lock"}
              </span>
              <Switch
                checked={isLocked}
                onCheckedChange={handleToggle}
                disabled={isUpdating}
                className="data-[state=checked]:bg-destructive"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

