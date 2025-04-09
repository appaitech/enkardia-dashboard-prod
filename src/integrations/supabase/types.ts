export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      client_businesses: {
        Row: {
          contact_name: string
          created_at: string
          created_by: string | null
          email: string
          id: string
          industry: string | null
          name: string
          phone: string | null
          updated_at: string
          xero_connected: boolean
        }
        Insert: {
          contact_name: string
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          industry?: string | null
          name: string
          phone?: string | null
          updated_at?: string
          xero_connected?: boolean
        }
        Update: {
          contact_name?: string
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          industry?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
          xero_connected?: boolean
        }
        Relationships: []
      }
      invitations: {
        Row: {
          accepted: boolean | null
          client_business_id: string
          created_at: string | null
          created_by: string | null
          email: string
          expires_at: string | null
          id: string
          token: string
        }
        Insert: {
          accepted?: boolean | null
          client_business_id: string
          created_at?: string | null
          created_by?: string | null
          email: string
          expires_at?: string | null
          id?: string
          token: string
        }
        Update: {
          accepted?: boolean | null
          client_business_id?: string
          created_at?: string | null
          created_by?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_client_business_id_fkey"
            columns: ["client_business_id"]
            isOneToOne: false
            referencedRelation: "client_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string
          created_at: string
          email: string | null
          id: string
          name: string | null
          role: string
          updated_at: string
        }
        Insert: {
          account_type?: string
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          account_type?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          client_business_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          start_date: string | null
          status: string
          task_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          client_business_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          task_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          client_business_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          task_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_client_business_id_fkey"
            columns: ["client_business_id"]
            isOneToOne: false
            referencedRelation: "client_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_client_businesses: {
        Row: {
          client_business_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          client_business_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          client_business_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_client_businesses_client_business_id_fkey"
            columns: ["client_business_id"]
            isOneToOne: false
            referencedRelation: "client_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      xero_tokens: {
        Row: {
          access_token: string
          authentication_event_id: string
          client_id: string | null
          created_at: string
          expires_in: number
          id: string
          id_token: string | null
          refresh_token: string
          scope: string | null
          token_expiry: string
          token_type: string
          updated_at: string
          xero_userid: string | null
        }
        Insert: {
          access_token: string
          authentication_event_id: string
          client_id?: string | null
          created_at?: string
          expires_in: number
          id?: string
          id_token?: string | null
          refresh_token: string
          scope?: string | null
          token_expiry: string
          token_type: string
          updated_at?: string
          xero_userid?: string | null
        }
        Update: {
          access_token?: string
          authentication_event_id?: string
          client_id?: string | null
          created_at?: string
          expires_in?: number
          id?: string
          id_token?: string | null
          refresh_token?: string
          scope?: string | null
          token_expiry?: string
          token_type?: string
          updated_at?: string
          xero_userid?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: { token_input: string; user_id_input: string }
        Returns: boolean
      }
      get_client_business_from_token: {
        Args: { token_input: string }
        Returns: string
      }
      get_user_role_and_account_type: {
        Args: { user_id: string }
        Returns: {
          user_role: string
          user_account_type: string
        }[]
      }
      is_valid_invitation_token: {
        Args: { token_input: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
