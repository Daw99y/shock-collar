import { createClient } from "@/utils/supabase/server";
import { DashboardShell } from "@/components/dashboard-shell";

export const revalidate = 0; // Disable caching for real-time updates

export default async function Dashboard() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Middleware should handle this, but for type safety
    return null;
  }

  // Fetch only this user's keys
  const { data: keys, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch keys:", error);
  }

  return (
    <DashboardShell 
      initialKeys={keys || []} 
      userId={user.id} 
      userEmail={user.email} 
    />
  );
}

