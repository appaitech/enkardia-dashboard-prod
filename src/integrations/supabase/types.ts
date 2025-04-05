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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: {
          token_input: string
          user_id_input: string
        }
        Returns: boolean
      }
      get_client_business_from_token: {
        Args: {
          token_input: string
        }
        Returns: string
      }
      get_user_role_and_account_type: {
        Args: {
          user_id: string
        }
        Returns: {
          user_role: string
          user_account_type: string
        }[]
      }
      is_valid_invitation_token: {
        Args: {
          token_input: string
        }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
