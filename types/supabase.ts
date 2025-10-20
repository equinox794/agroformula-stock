export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string
          org_id: string
          actor_id: string
          action: string
          entity: string
          entity_id: string | null
          meta: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          actor_id: string
          action: string
          entity: string
          entity_id?: string | null
          meta?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          actor_id?: string
          action?: string
          entity?: string
          entity_id?: string | null
          meta?: Json | null
          created_at?: string
        }
      }
      memberships: {
        Row: {
          org_id: string
          user_id: string
          role: 'admin' | 'manager' | 'viewer'
          created_at: string
          updated_at: string
        }
        Insert: {
          org_id: string
          user_id: string
          role: 'admin' | 'manager' | 'viewer'
          created_at?: string
          updated_at?: string
        }
        Update: {
          org_id?: string
          user_id?: string
          role?: 'admin' | 'manager' | 'viewer'
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          org_id: string
          code: string
          name: string
          type: 'Final' | 'SemiFinished' | 'Raw'
          unit: 'kg' | 'L' | 'piece'
          vat_rate: number
          kg_price: number
          min_stock: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          code: string
          name: string
          type: 'Final' | 'SemiFinished' | 'Raw'
          unit?: 'kg' | 'L' | 'piece'
          vat_rate?: number
          kg_price?: number
          min_stock?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          code?: string
          name?: string
          type?: 'Final' | 'SemiFinished' | 'Raw'
          unit?: 'kg' | 'L' | 'piece'
          vat_rate?: number
          kg_price?: number
          min_stock?: number
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      stock_movements: {
        Row: {
          id: string
          org_id: string
          product_id: string
          warehouse_id: string
          qty_change: number
          reason: 'in' | 'out' | 'transfer' | 'adjust'
          note: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          product_id: string
          warehouse_id: string
          qty_change: number
          reason: 'in' | 'out' | 'transfer' | 'adjust'
          note?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          product_id?: string
          warehouse_id?: string
          qty_change?: number
          reason?: 'in' | 'out' | 'transfer' | 'adjust'
          note?: string | null
          created_by?: string
          created_at?: string
        }
      }
      stocks: {
        Row: {
          id: string
          org_id: string
          product_id: string
          warehouse_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          product_id: string
          warehouse_id: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          product_id?: string
          warehouse_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          org_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: string
          status: string
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          org_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan: string
          status: string
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          org_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: string
          status?: string
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      warehouses: {
        Row: {
          id: string
          org_id: string
          name: string
          location: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          location?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          location?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_audit_log: {
        Args: {
          p_org_id: string
          p_actor_id: string
          p_action: string
          p_entity: string
          p_entity_id?: string
          p_meta?: Json
        }
        Returns: undefined
      }
      get_low_stock_products: {
        Args: {
          p_org_id: string
        }
        Returns: {
          product_id: string
          product_code: string
          product_name: string
          total_quantity: number
          min_stock: number
          warehouse_count: number
        }[]
      }
      get_product_stock_summary: {
        Args: {
          p_product_id: string
          p_org_id: string
        }
        Returns: {
          warehouse_id: string
          warehouse_name: string
          quantity: number
          is_low_stock: boolean
        }[]
      }
      get_user_role_in_org: {
        Args: {
          org_id: string
          user_id: string
        }
        Returns: string
      }
      is_member_of_org: {
        Args: {
          org_id: string
          user_id: string
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
