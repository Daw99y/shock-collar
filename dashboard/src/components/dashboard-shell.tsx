"use client";

import { useState, useEffect } from "react";
import { ApiKey } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  Unlock, 
  Plus, 
  Copy, 
  Check, 
  Settings, 
  Activity, 
  Terminal, 
  LogOut,
  ChevronRight,
  Shield,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateKeyForm } from "@/components/create-key-form"; // We'll wrap this or reuse logic
import { InstallModal } from "@/components/install-modal";
import { SettingsModal } from "@/components/settings-modal";

interface DashboardShellProps {
  initialKeys: ApiKey[];
  userEmail?: string;
  userId: string;
}

export function DashboardShell({ initialKeys, userEmail, userId }: DashboardShellProps) {
  // Sorting: Most recent first
  const sortedKeys = [...(initialKeys || [])].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    sortedKeys.length > 0 ? sortedKeys[0].id : null
  );
  
  // If we have keys but none selected (e.g. after deletion or initial load), select the first one
  useEffect(() => {
    if (selectedProjectId === null && sortedKeys.length > 0) {
      setSelectedProjectId(sortedKeys[0].id);
    }
  }, [sortedKeys, selectedProjectId]);

  const selectedProject = sortedKeys.find(k => k.id === selectedProjectId);
  const router = useRouter();

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-zinc-900">
      {/* 1. Left Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0 left-0 z-50">
        {/* Top: Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-zinc-900" />
            <span className="text-lg font-bold tracking-tight text-zinc-900">SHOCK COLLAR</span>
          </div>
        </div>

        {/* Middle: Project List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 mb-2">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Projects</h3>
          </div>
          
          {sortedKeys.map((project) => (
            <button
              key={project.id}
              onClick={() => setSelectedProjectId(project.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors",
                selectedProjectId === project.id
                  ? "bg-gray-100 font-medium text-zinc-900"
                  : "text-zinc-500 hover:bg-gray-50 hover:text-zinc-900"
              )}
            >
              <span className="truncate">{project.project_name}</span>
              {project.is_locked && (
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              )}
            </button>
          ))}

          {sortedKeys.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-zinc-400">
              No projects yet.
            </div>
          )}
        </div>

        {/* Bottom: User & New Project */}
        <div className="p-4 border-t border-gray-50 space-y-4">
          <Dialog>
            <DialogTrigger
              render={
                <Button className="w-full justify-start gap-2 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm rounded-xl">
                  <Plus className="w-4 h-4" />
                  New Project
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <CreateKeyForm userId={userId} />
            </DialogContent>
          </Dialog>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-zinc-600">
                {userEmail?.[0].toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium truncate max-w-[100px] text-zinc-900">
                  {userEmail?.split('@')[0]}
                </span>
                <span className="text-[10px] text-zinc-400 truncate">
                  Free Plan
                </span>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-zinc-400 hover:text-zinc-900"
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push("/login");
              }}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {selectedProject ? (
          <div className="max-w-5xl mx-auto space-y-8 fade-in-up">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                  {selectedProject.project_name}
                </h1>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                  selectedProject.is_locked 
                    ? "bg-orange-50 text-orange-700 border-orange-100"
                    : "bg-emerald-50 text-emerald-700 border-emerald-100"
                )}>
                  {selectedProject.is_locked ? "Locked" : "Active"}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <SettingsModal 
                  apiKey={selectedProject} 
                  refresh={() => router.refresh()} 
                  onDelete={() => setSelectedProjectId(null)}
                />
              </div>
            </div>

            {/* Section A: Control Center */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex items-center justify-between relative overflow-hidden group">
              {/* Subtle background gradient */}
              <div className={cn(
                  "absolute inset-0 opacity-[0.03] transition-colors duration-500",
                  selectedProject.is_locked 
                    ? "bg-gradient-to-r from-orange-500 to-red-500"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500"
                )} 
              />
              
              <div className="relative z-10 flex gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300",
                  selectedProject.is_locked ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"
                )}>
                  {selectedProject.is_locked ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">License Status</h2>
                  <p className="text-sm text-zinc-500">
                    {selectedProject.is_locked 
                      ? "Access to this site is currently restricted."
                      : "Site is accessible and running normally."}
                  </p>
                </div>
              </div>

              <div className="relative z-10">
                <LockToggle apiKey={selectedProject} refresh={() => router.refresh()} />
              </div>
            </div>

            {/* Section B: Integration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Col 1: API Key */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-zinc-400" />
                  <h3 className="font-semibold text-zinc-900">License Key</h3>
                </div>
                <p className="text-sm text-zinc-500">This unique key connects the site to Shock Collar.</p>
                
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm text-zinc-600 truncate">
                    {selectedProject.key_value}
                  </div>
                  <CopyButton text={selectedProject.key_value} />
                </div>


              </div>

              {/* Col 2: Code Snippet */}
              {/* Col 2: Integration Guide */}
              <div className="bg-zinc-950 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-between text-zinc-400 mb-6">
                    <div className="flex items-center gap-2">
                       <Terminal className="w-4 h-4" />
                       <span className="text-xs font-medium uppercase tracking-wider">Installation</span>
                    </div>
                    <span className="text-xs">React / Next.js</span>
                  </div>
                  
                  <div className="font-mono text-sm text-zinc-300 mb-6">
                    <p className="mb-2 text-zinc-400">Install the component to protect your site.</p>
                    <p className="text-zinc-500 text-xs">Click below for the full setup guide.</p>
                  </div>

                  <InstallModal apiKey={selectedProject.key_value} projectName={selectedProject.project_name} />
                </div>
                
                {/* Decorative background element */}
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
                  <Shield className="w-48 h-48 text-white" />
                </div>
              </div>
            </div>

            {/* Section C: Activity Feed */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[300px] flex flex-col">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-zinc-400" />
                        <h3 className="font-semibold text-zinc-900">Recent Activity</h3>
                    </div>
                </div>
                <div className="divide-y divide-gray-50 flex-1 overflow-y-auto max-h-[400px]">
                    <LogList projectId={selectedProject.id} />
                </div>
            </div>

          </div>
        ) : (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
               <Shield className="w-8 h-8 text-zinc-300" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">No Projects Selected</h2>
            <p className="text-zinc-500 mb-8">Select a project from the sidebar to view details, or create a new license key to get started.</p>
            <Dialog>
                <DialogTrigger
                  render={
                    <Button className="bg-zinc-900 text-white rounded-xl h-10 px-6">Create New Project</Button>
                  }
                />
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                    </DialogHeader>
                    <CreateKeyForm userId={userId} />
                </DialogContent>
            </Dialog>
          </div>
        )}
      </main>
    </div>
  );
}

// Sub-components for cleaner internal logic

function LockToggle({ apiKey, refresh }: { apiKey: ApiKey, refresh: () => void }) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleToggle = async (val: boolean) => {
    setLoading(true);
    
    // 1. Update Key Status
    await supabase
        .from("api_keys")
        .update({ is_locked: val })
        .eq("id", apiKey.id);

    // 2. Log Activity
    await supabase.from("activity_logs").insert({
        user_id: apiKey.user_id,
        key_id: apiKey.id,
        event_type: val ? "LOCKED" : "UNLOCKED",
        description: val ? "Access restrictions enabled" : "Access restrictions disabled"
    });

    setLoading(false);
    refresh(); // Triggers router.refresh() via parent callback
  };

  return (
    <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-zinc-500">
            {apiKey.is_locked ? "Locked" : "Unlocked"}
        </span>
        <Switch 
            checked={apiKey.is_locked} 
            onCheckedChange={handleToggle}
            disabled={loading}
            className="data-[state=checked]:bg-orange-500 scale-125 transition-transform"
        />
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <Button 
            variant="outline" 
            size="icon" 
            onClick={handleCopy}
            className="shrink-0 text-zinc-500 hover:text-zinc-900"
        >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
    )
}

// Client component to fetch logs
import { ActivityLog } from "@/types/database.types";

function LogList({ projectId }: { projectId: string }) {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            const { data } = await supabase
                .from("activity_logs")
                .select("*")
                .eq("key_id", projectId)
                .order("created_at", { ascending: false })
                .limit(20);
            
            if (data) setLogs(data);
            setLoading(false);
        };

        fetchLogs();

        // Optional: Subscribe to changes for real-time updates
        const channel = supabase
            .channel('activity_logs_realtime')
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'activity_logs',
                filter: `key_id=eq.${projectId}` 
            }, (payload) => {
                setLogs(current => [payload.new as ActivityLog, ...current]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        }
    }, [projectId]);

    if (loading) {
        return <div className="p-8 text-center text-sm text-zinc-400">Loading activity...</div>;
    }

    if (logs.length === 0) {
        return <div className="p-8 text-center text-sm text-zinc-400">No activity recorded yet</div>;
    }

    return (
        <>
            {logs.map((log) => (
                <ActivityRow 
                    key={log.id}
                    log={log}
                />
            ))}
        </>
    );
}

function ActivityRow({ log }: { log: ActivityLog }) {
    let icon = <Activity className="w-4 h-4 text-zinc-400" />;
    let title = "Event";

    switch(log.event_type) {
        case "CREATED":
            icon = <Plus className="w-4 h-4 text-zinc-600" />;
            title = "License Created";
            break;
        case "LOCKED":
            icon = <Lock className="w-4 h-4 text-orange-500" />;
            title = "Access Locked";
            break;
        case "UNLOCKED":
            icon = <Unlock className="w-4 h-4 text-emerald-500" />;
            title = "Access Unlocked";
            break;
    }

    return (
        <div className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                    {icon}
                </div>
                <div>
                    <h4 className="text-sm font-medium text-zinc-900">{title}</h4>
                    <p className="text-xs text-zinc-500">{log.description}</p>
                </div>
            </div>
            <span className="text-xs text-zinc-400 font-medium whitespace-nowrap ml-4">
                {new Date(log.created_at).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' })}
            </span>
        </div>
    )
}
