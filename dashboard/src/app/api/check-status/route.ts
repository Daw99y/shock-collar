import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// CORS headers for external client websites
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Handle preflight CORS requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Main GET handler
export async function GET(request: NextRequest) {
  try {
    // Get the key from query params
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    // Validate key exists
    if (!key) {
      return NextResponse.json(
        { error: "Missing API key", locked: false },
        { status: 400, headers: corsHeaders }
      );
    }

    // Create Supabase client (using service-level access for API route)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Query the api_keys table
    const { data, error } = await supabase
      .from("api_keys")
      .select("is_locked")
      .eq("key_value", key)
      .single();

    // Handle database errors
    if (error) {
      // Key not found
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Invalid API key", locked: false },
          { status: 404, headers: corsHeaders }
        );
      }
      // Other database errors
      return NextResponse.json(
        { error: "Database error", locked: false },
        { status: 500, headers: corsHeaders }
      );
    }

    // Return the lock status
    return NextResponse.json(
      { locked: data.is_locked },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Check status error:", error);
    return NextResponse.json(
      { error: "Internal server error", locked: false },
      { status: 500, headers: corsHeaders }
    );
  }
}
