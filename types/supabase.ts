// Minimal Supabase Database types for this project
// You can replace this with the full types copied from Supabase Dashboard → Settings → API → Typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      chat_history: {
        Row: {
          id: string;
          user_id: string;
          created_at: string; // timestamptz
          role: 'user' | 'model';
          content: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          role: 'user' | 'model';
          content: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          role?: 'user' | 'model';
          content?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
