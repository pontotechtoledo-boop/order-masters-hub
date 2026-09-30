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
      branches: {
        Row: {
          active: boolean
          address: string | null
          created_at: string
          id: string
          name: string
          organization_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          created_at?: string
          id?: string
          name: string
          organization_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          document: string | null
          email: string | null
          id: string
          kind: string
          name: string
          notes: string | null
          organization_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          kind?: string
          name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          kind?: string
          name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          accessories: string | null
          brand: string | null
          category: string
          condition_notes: string | null
          created_at: string
          customer_id: string
          id: string
          model: string | null
          organization_id: string
          serial_number: string | null
          updated_at: string
        }
        Insert: {
          accessories?: string | null
          brand?: string | null
          category: string
          condition_notes?: string | null
          created_at?: string
          customer_id: string
          id?: string
          model?: string | null
          organization_id: string
          serial_number?: string | null
          updated_at?: string
        }
        Update: {
          accessories?: string | null
          brand?: string | null
          category?: string
          condition_notes?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          model?: string | null
          organization_id?: string
          serial_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "devices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_entries: {
        Row: {
          amount: number
          branch_id: string | null
          category: string
          created_at: string
          description: string
          due_date: string | null
          entry_type: Database["public"]["Enums"]["financial_type"]
          id: string
          order_id: string | null
          organization_id: string
          paid_at: string | null
          payment_method: string | null
          status: Database["public"]["Enums"]["financial_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          branch_id?: string | null
          category: string
          created_at?: string
          description: string
          due_date?: string | null
          entry_type: Database["public"]["Enums"]["financial_type"]
          id?: string
          order_id?: string | null
          organization_id: string
          paid_at?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["financial_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          branch_id?: string | null
          category?: string
          created_at?: string
          description?: string
          due_date?: string | null
          entry_type?: Database["public"]["Enums"]["financial_type"]
          id?: string
          order_id?: string | null
          organization_id?: string
          paid_at?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["financial_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_entries_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_entries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          active: boolean
          branch_id: string | null
          category: string | null
          cost: number
          created_at: string
          id: string
          location: string | null
          minimum_quantity: number
          name: string
          organization_id: string
          price: number
          quantity: number
          sku: string | null
          supplier: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          branch_id?: string | null
          category?: string | null
          cost?: number
          created_at?: string
          id?: string
          location?: string | null
          minimum_quantity?: number
          name: string
          organization_id: string
          price?: number
          quantity?: number
          sku?: string | null
          supplier?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          branch_id?: string | null
          category?: string | null
          cost?: number
          created_at?: string
          id?: string
          location?: string | null
          minimum_quantity?: number
          name?: string
          organization_id?: string
          price?: number
          quantity?: number
          sku?: string | null
          supplier?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          inventory_item_id: string
          movement_type: string
          notes: string | null
          order_id: string | null
          organization_id: string
          quantity: number
          unit_cost: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          inventory_item_id: string
          movement_type: string
          notes?: string | null
          order_id?: string | null
          organization_id: string
          quantity: number
          unit_cost?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          inventory_item_id?: string
          movement_type?: string
          notes?: string | null
          order_id?: string | null
          organization_id?: string
          quantity?: number
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      order_events: {
        Row: {
          created_at: string
          description: string
          event_type: string
          id: string
          metadata: Json
          order_id: string
          organization_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          event_type: string
          id?: string
          metadata?: Json
          order_id: string
          organization_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          event_type?: string
          id?: string
          metadata?: Json
          order_id?: string
          organization_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          active: boolean
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          document: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          plan: string
          subscription_status: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          plan?: string
          subscription_status?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          plan?: string
          subscription_status?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      platform_admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      service_order_items: {
        Row: {
          cost: number
          created_at: string
          description: string
          id: string
          inventory_item_id: string | null
          item_type: string
          order_id: string
          organization_id: string
          quantity: number
          unit_price: number
          warranty_days: number
        }
        Insert: {
          cost?: number
          created_at?: string
          description: string
          id?: string
          inventory_item_id?: string | null
          item_type: string
          order_id: string
          organization_id: string
          quantity?: number
          unit_price?: number
          warranty_days?: number
        }
        Update: {
          cost?: number
          created_at?: string
          description?: string
          id?: string
          inventory_item_id?: string | null
          item_type?: string
          order_id?: string
          organization_id?: string
          quantity?: number
          unit_price?: number
          warranty_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_order_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_order_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      service_orders: {
        Row: {
          assigned_to: string | null
          branch_id: string | null
          completed_at: string | null
          created_at: string
          customer_id: string
          delivered_at: string | null
          device_id: string
          diagnosis: string | null
          discount: number
          estimated_at: string | null
          id: string
          order_number: number
          organization_id: string
          priority: Database["public"]["Enums"]["order_priority"]
          reported_issue: string
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          technical_report: string | null
          total: number | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          branch_id?: string | null
          completed_at?: string | null
          created_at?: string
          customer_id: string
          delivered_at?: string | null
          device_id: string
          diagnosis?: string | null
          discount?: number
          estimated_at?: string | null
          id?: string
          order_number?: number
          organization_id: string
          priority?: Database["public"]["Enums"]["order_priority"]
          reported_issue: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          technical_report?: string | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          branch_id?: string | null
          completed_at?: string | null
          created_at?: string
          customer_id?: string
          delivered_at?: string | null
          device_id?: string
          diagnosis?: string | null
          discount?: number
          estimated_at?: string | null
          id?: string
          order_number?: number
          organization_id?: string
          priority?: Database["public"]["Enums"]["order_priority"]
          reported_issue?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          technical_report?: string | null
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          organization_id: string
          paddle_customer_id: string
          paddle_subscription_id: string
          price_id: string
          product_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          organization_id: string
          paddle_customer_id: string
          paddle_subscription_id: string
          price_id: string
          product_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          organization_id?: string
          paddle_customer_id?: string
          paddle_subscription_id?: string
          price_id?: string
          product_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      warranties: {
        Row: {
          code: string
          coverage: string | null
          created_at: string
          expires_at: string
          id: string
          order_id: string
          organization_id: string
          sent_at: string | null
          starts_at: string
          status: string
          terms: string | null
          updated_at: string
        }
        Insert: {
          code?: string
          coverage?: string | null
          created_at?: string
          expires_at: string
          id?: string
          order_id: string
          organization_id: string
          sent_at?: string | null
          starts_at?: string
          status?: string
          terms?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          coverage?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          order_id?: string
          organization_id?: string
          sent_at?: string | null
          starts_at?: string
          status?: string
          terms?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "warranties_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranties_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ensure_user_organization: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      consume_inventory_item: {
        Args: {
          _inventory_item_id: string
          _order_id: string
          _quantity: number
          _unit_price: number
          _warranty_days?: number
        }
        Returns: {
          cost: number
          created_at: string
          description: string
          id: string
          inventory_item_id: string | null
          item_type: string
          order_id: string
          organization_id: string
          quantity: number
          unit_price: number
          warranty_days: number
        }
        SetofOptions: {
          from: "*"
          to: "service_order_items"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_inventory_item: {
        Args: {
          _branch_id: string
          _category: string
          _cost: number
          _location: string
          _minimum_quantity: number
          _name: string
          _organization_id: string
          _price: number
          _quantity: number
          _sku: string
          _supplier: string
        }
        Returns: {
          active: boolean
          branch_id: string | null
          category: string | null
          cost: number
          created_at: string
          id: string
          location: string | null
          minimum_quantity: number
          name: string
          organization_id: string
          price: number
          quantity: number
          sku: string | null
          supplier: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "inventory_items"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      move_inventory: {
        Args: {
          _inventory_item_id: string
          _movement_type: string
          _notes?: string
          _quantity: number
          _unit_cost?: number
        }
        Returns: {
          active: boolean
          branch_id: string | null
          category: string | null
          cost: number
          created_at: string
          id: string
          location: string | null
          minimum_quantity: number
          name: string
          organization_id: string
          price: number
          quantity: number
          sku: string | null
          supplier: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "inventory_items"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "attendant" | "technician" | "finance"
      financial_status: "pending" | "paid" | "overdue" | "cancelled"
      financial_type: "income" | "expense"
      order_priority: "low" | "normal" | "high" | "urgent"
      order_status:
        | "received"
        | "triage"
        | "diagnosis"
        | "quote"
        | "awaiting_approval"
        | "approved"
        | "waiting_parts"
        | "repair"
        | "testing"
        | "ready"
        | "delivered"
        | "cancelled"
        | "no_repair"
        | "warranty_return"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "admin", "attendant", "technician", "finance"],
      financial_status: ["pending", "paid", "overdue", "cancelled"],
      financial_type: ["income", "expense"],
      order_priority: ["low", "normal", "high", "urgent"],
      order_status: [
        "received",
        "triage",
        "diagnosis",
        "quote",
        "awaiting_approval",
        "approved",
        "waiting_parts",
        "repair",
        "testing",
        "ready",
        "delivered",
        "cancelled",
        "no_repair",
        "warranty_return",
      ],
    },
  },
} as const
