// Database types for Shock Collar

export interface ApiKey {
  id: string;
  created_at: string;
  key_value: string;
  project_name: string;
  is_locked: boolean;
  user_id: string;
}

export interface ActivityLog {
  id: string;
  created_at: string;
  user_id: string;
  key_id: string;
  event_type: "CREATED" | "LOCKED" | "UNLOCKED";
  description: string | null;
}

export interface Database {
  public: {
    Tables: {
      api_keys: {
        Row: ApiKey;
        Insert: Omit<ApiKey, "id" | "created_at">;
        Update: Partial<Omit<ApiKey, "id" | "created_at">>;
      };
      activity_logs: {
        Row: ActivityLog;
        Insert: Omit<ActivityLog, "id" | "created_at">;
        Update: Partial<Omit<ActivityLog, "id" | "created_at">>;
      };
    };
  };
}
