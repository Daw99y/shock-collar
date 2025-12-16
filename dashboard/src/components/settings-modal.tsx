"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, RefreshCw, Trash2, Settings, Loader2 } from "lucide-react";
import { ApiKey } from "@/types/database.types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
  apiKey: ApiKey;
  refresh: () => void;
  onDelete?: () => void; // Callback to clear selection in parent
}

export function SettingsModal({ apiKey, refresh, onDelete }: SettingsModalProps) {
  const [name, setName] = useState(apiKey.project_name);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  // 1. Rename Project
  const handleRename = async () => {
    if (!name.trim() || name === apiKey.project_name) return;
    
    setLoading(true);
    const { error } = await supabase
      .from("api_keys")
      .update({ project_name: name })
      .eq("id", apiKey.id);

    if (!error) {
      await supabase.from("activity_logs").insert({
        user_id: apiKey.user_id,
        key_id: apiKey.id,
        event_type: "RENAME", // Note: You might need to add this to types if strict, or just use string
        description: `Renamed project from "${apiKey.project_name}" to "${name}"`
      } as any); // Type assertion until we update the union type
      
      refresh();
      router.refresh();
      setOpen(false);
    }
    setLoading(false);
  };

  // 2. Regenerate Key
  const handleRegenerateKey = async () => {
    setLoading(true);
    const newKey = `sk_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
    
    const { error } = await supabase
        .from("api_keys")
        .update({ key_value: newKey })
        .eq("id", apiKey.id);
    
    if (!error) {
        await supabase.from("activity_logs").insert({
            user_id: apiKey.user_id,
            key_id: apiKey.id,
            event_type: "KEY_ROTATION",
            description: "API Key was rotated (regenerated)"
        } as any);

        refresh();
        router.refresh();
        setOpen(false);
    }
    setLoading(false);
  }

  // 3. Delete Project
  const handleDelete = async () => {
    setLoading(true);
    const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", apiKey.id);
    
    if (!error) {
        setOpen(false);
        if (onDelete) onDelete();
        router.refresh(); // Hard refresh to update sidebar list
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 rounded-lg text-zinc-600">
            <Settings className="w-4 h-4" />
            Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
            {/* Rename */}
            <div className="space-y-2">
                <Label>Project Name</Label>
                <div className="flex gap-2">
                    <Input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Project Name" 
                    />
                    <Button onClick={handleRename} disabled={loading || name===apiKey.project_name}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                    </Button>
                </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Regenerate */}
            <div className="space-y-2">
                <Label>Rotate API Key</Label>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-900 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <p>Regenerating the key will immediately revoke the old one. You will need to update your environment variables.</p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-zinc-600 gap-2 mt-2">
                            <RefreshCw className="w-4 h-4" />
                            Regenerate Key
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. The current API Key will stop working immediately.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRegenerateKey}>Yes, regenerate it</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Delete */}
            <div className="space-y-2">
                <Label className="text-red-600">Danger Zone</Label>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full justify-start gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 shadow-none">
                            <Trash2 className="w-4 h-4" />
                            Delete Project
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the project "<strong>{apiKey.project_name}</strong>" and all its history. This cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete Project</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
