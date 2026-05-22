export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievement_defs: {
        Row: {
          code: string
          criteria: Json | null
          description: string | null
          icon: string
          id: string
          title: string
          xp_reward: number
        }
        Insert: {
          code: string
          criteria?: Json | null
          description?: string | null
          icon?: string
          id?: string
          title: string
          xp_reward?: number
        }
        Update: {
          code?: string
          criteria?: Json | null
          description?: string | null
          icon?: string
          id?: string
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      achievements: {
        Row: {
          code: string
          description: string | null
          id: string
          title: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          code: string
          description?: string | null
          id?: string
          title: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          code?: string
          description?: string | null
          id?: string
          title?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chapter_progress: {
        Row: {
          chapter: string
          id: string
          is_weak: boolean
          mastery: number
          progress: number
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter: string
          id?: string
          is_weak?: boolean
          mastery?: number
          progress?: number
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter?: string
          id?: string
          is_weak?: boolean
          mastery?: number
          progress?: number
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chapters: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
          subject_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          subject_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          subject_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      difficulties: {
        Row: {
          id: string
          level: number
          name: string
          user_id: string | null
        }
        Insert: {
          id?: string
          level?: number
          name: string
          user_id?: string | null
        }
        Update: {
          id?: string
          level?: number
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      missions: {
        Row: {
          completed: boolean
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          progress: number
          target_type: string
          target_value: number
          title: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          progress?: number
          target_type?: string
          target_value?: number
          title: string
          user_id: string
          xp_reward?: number
        }
        Update: {
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          progress?: number
          target_type?: string
          target_value?: number
          title?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      mock_tests: {
        Row: {
          accuracy: number
          id: string
          max_score: number
          mistakes: number
          name: string
          notes: string | null
          percentile: number | null
          score: number
          taken_at: string
          time_taken_min: number | null
          user_id: string
        }
        Insert: {
          accuracy?: number
          id?: string
          max_score?: number
          mistakes?: number
          name: string
          notes?: string | null
          percentile?: number | null
          score?: number
          taken_at?: string
          time_taken_min?: number | null
          user_id: string
        }
        Update: {
          accuracy?: number
          id?: string
          max_score?: number
          mistakes?: number
          name?: string
          notes?: string | null
          percentile?: number | null
          score?: number
          taken_at?: string
          time_taken_min?: number | null
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          category: string | null
          color: string
          content: string
          created_at: string
          id: string
          pinned: boolean
          title: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          color?: string
          content: string
          created_at?: string
          id?: string
          pinned?: boolean
          title?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          color?: string
          content?: string
          created_at?: string
          id?: string
          pinned?: boolean
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_streak: number
          display_name: string | null
          id: string
          last_active_date: string | null
          level: number
          longest_streak: number
          rank: string
          updated_at: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_streak?: number
          display_name?: string | null
          id: string
          last_active_date?: string | null
          level?: number
          longest_streak?: number
          rank?: string
          updated_at?: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_streak?: number
          display_name?: string | null
          id?: string
          last_active_date?: string | null
          level?: number
          longest_streak?: number
          rank?: string
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
      question_logs: {
        Row: {
          chapter: string
          correct: number
          created_at: string
          difficulty: string | null
          id: string
          notes: string | null
          skipped: number
          solved: number
          source: string | null
          subject: string
          time_spent_min: number
          user_id: string
          wrong: number
        }
        Insert: {
          chapter: string
          correct?: number
          created_at?: string
          difficulty?: string | null
          id?: string
          notes?: string | null
          skipped?: number
          solved?: number
          source?: string | null
          subject: string
          time_spent_min?: number
          user_id: string
          wrong?: number
        }
        Update: {
          chapter?: string
          correct?: number
          created_at?: string
          difficulty?: string | null
          id?: string
          notes?: string | null
          skipped?: number
          solved?: number
          source?: string | null
          subject?: string
          time_spent_min?: number
          user_id?: string
          wrong?: number
        }
        Relationships: []
      }
      ranks: {
        Row: {
          color: string
          id: string
          min_xp: number
          name: string
          sort_order: number
        }
        Insert: {
          color?: string
          id?: string
          min_xp: number
          name: string
          sort_order?: number
        }
        Update: {
          color?: string
          id?: string
          min_xp?: number
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      revisions: {
        Row: {
          chapter: string
          created_at: string
          due_date: string | null
          id: string
          status: string
          subject: string
          topic: string | null
          user_id: string
        }
        Insert: {
          chapter: string
          created_at?: string
          due_date?: string | null
          id?: string
          status?: string
          subject: string
          topic?: string | null
          user_id: string
        }
        Update: {
          chapter?: string
          created_at?: string
          due_date?: string | null
          id?: string
          status?: string
          subject?: string
          topic?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sources: {
        Row: {
          id: string
          name: string
          sort_order: number
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          sort_order?: number
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number
          user_id?: string | null
        }
        Relationships: []
      }
      subjects: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          sort_order: number
          user_id: string | null
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          user_id?: string | null
        }
        Relationships: []
      }
      xp_history: {
        Row: {
          amount: number
          created_at: string
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
