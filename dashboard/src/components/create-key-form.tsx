"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

function generateApiKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let key = "pk_live_";
  for (let i = 0; i < 24; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

interface CreateKeyFormProps {
  userId: string;
}

export function CreateKeyForm({ userId }: CreateKeyFormProps) {
  const [projectName, setProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim() || !userId) {
      console.error("Missing data:", { projectName, userId });
      return;
    }

    setIsCreating(true);

    const newKey = generateApiKey();

    console.log("Creating key with:", {
      key_value: newKey,
      project_name: projectName.trim(),
      user_id: userId,
    });

    // 1. Create the Key
    const { data: keyData, error: keyError } = await supabase
      .from("api_keys")
      .insert({
        key_value: newKey,
        project_name: projectName.trim(),
        is_locked: false,
        user_id: userId,
      })
      .select()
      .single();

    if (keyError) {
      console.error("Failed to create key:", keyError.message);
      setIsCreating(false);
      return;
    }

    // 2. Log the event
    if (keyData) {
      await supabase.from("activity_logs").insert({
        user_id: userId,
        key_id: keyData.id,
        event_type: "CREATED",
        description: `License key created for ${projectName.trim()}`,
      });
    }

    console.log("Created successfully:", keyData);
    setProjectName("");
    setIsCreating(false);
    router.refresh();
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Client project name (e.g., Acme Corp Website)"
            className="flex-1 bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            disabled={isCreating}
          />
          <Button type="submit" disabled={isCreating || !projectName.trim()}>
            {isCreating ? "Creating..." : "Generate Key"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
