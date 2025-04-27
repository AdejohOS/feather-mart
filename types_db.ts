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
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_media: {
        Row: {
          created_at: string | null
          farm_id: string
          id: string
          type: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          farm_id: string
          id?: string
          type: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          farm_id?: string
          id?: string
          type?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_media_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          address: string | null
          biosecurity_measures: string | null
          breeds: string[] | null
          business_hours: string | null
          certifications: string[] | null
          city: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          delivery_details: string | null
          delivery_options: string[] | null
          description: string
          established_date: string | null
          farm_type: string[]
          farming_practices: string | null
          formatted_address: string | null
          has_processing_facility: boolean
          housing_types: string[] | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          payment_methods: string[] | null
          pickup_available: boolean
          pickup_details: string | null
          place_id: string | null
          postal_code: string | null
          processing_details: string | null
          production_capacity: string | null
          seller_id: string
          size: string | null
          state: string | null
          storage_capabilities: string | null
          updated_at: string
          website: string | null
          wholesale_available: boolean
          wholesale_details: string | null
        }
        Insert: {
          address?: string | null
          biosecurity_measures?: string | null
          breeds?: string[] | null
          business_hours?: string | null
          certifications?: string[] | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          delivery_details?: string | null
          delivery_options?: string[] | null
          description: string
          established_date?: string | null
          farm_type: string[]
          farming_practices?: string | null
          formatted_address?: string | null
          has_processing_facility?: boolean
          housing_types?: string[] | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          payment_methods?: string[] | null
          pickup_available?: boolean
          pickup_details?: string | null
          place_id?: string | null
          postal_code?: string | null
          processing_details?: string | null
          production_capacity?: string | null
          seller_id: string
          size?: string | null
          state?: string | null
          storage_capabilities?: string | null
          updated_at?: string
          website?: string | null
          wholesale_available?: boolean
          wholesale_details?: string | null
        }
        Update: {
          address?: string | null
          biosecurity_measures?: string | null
          breeds?: string[] | null
          business_hours?: string | null
          certifications?: string[] | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          delivery_details?: string | null
          delivery_options?: string[] | null
          description?: string
          established_date?: string | null
          farm_type?: string[]
          farming_practices?: string | null
          formatted_address?: string | null
          has_processing_facility?: boolean
          housing_types?: string[] | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          payment_methods?: string[] | null
          pickup_available?: boolean
          pickup_details?: string | null
          place_id?: string | null
          postal_code?: string | null
          processing_details?: string | null
          production_capacity?: string | null
          seller_id?: string
          size?: string | null
          state?: string | null
          storage_capabilities?: string | null
          updated_at?: string
          website?: string | null
          wholesale_available?: boolean
          wholesale_details?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farms_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: number
          order_id: number
          product_id: string | null
          product_name: string
          product_price: number
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          order_id: number
          product_id?: string | null
          product_name: string
          product_price: number
          quantity?: number
        }
        Update: {
          created_at?: string | null
          id?: number
          order_id?: number
          product_id?: string | null
          product_name?: string
          product_price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          id: number
          shipping_address: Json | null
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          shipping_address?: Json | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          shipping_address?: Json | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      product_media: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          type: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          type: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          type?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          age: string | null
          available_date: string | null
          breed: string | null
          category: string
          created_at: string
          description: string
          discount_price: number | null
          farm_id: string | null
          id: string
          is_antibiotic: boolean
          is_available: boolean
          is_free_range: boolean
          is_hormone: boolean
          is_organic: boolean
          is_vaccinated: boolean
          minimum_order: number | null
          name: string
          nutritional_info: string | null
          origin: string | null
          price: number
          seller_id: string
          sku: string | null
          stock: number
          storage_instructions: string | null
          tags: string[] | null
          unit: string
          updated_at: string
          weight: string | null
        }
        Insert: {
          age?: string | null
          available_date?: string | null
          breed?: string | null
          category: string
          created_at?: string
          description: string
          discount_price?: number | null
          farm_id?: string | null
          id?: string
          is_antibiotic?: boolean
          is_available?: boolean
          is_free_range?: boolean
          is_hormone?: boolean
          is_organic?: boolean
          is_vaccinated?: boolean
          minimum_order?: number | null
          name: string
          nutritional_info?: string | null
          origin?: string | null
          price: number
          seller_id: string
          sku?: string | null
          stock: number
          storage_instructions?: string | null
          tags?: string[] | null
          unit: string
          updated_at?: string
          weight?: string | null
        }
        Update: {
          age?: string | null
          available_date?: string | null
          breed?: string | null
          category?: string
          created_at?: string
          description?: string
          discount_price?: number | null
          farm_id?: string | null
          id?: string
          is_antibiotic?: boolean
          is_available?: boolean
          is_free_range?: boolean
          is_hormone?: boolean
          is_organic?: boolean
          is_vaccinated?: boolean
          minimum_order?: number | null
          name?: string
          nutritional_info?: string | null
          origin?: string | null
          price?: number
          seller_id?: string
          sku?: string | null
          stock?: number
          storage_instructions?: string | null
          tags?: string[] | null
          unit?: string
          updated_at?: string
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string | null
          id: number
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_stock: {
        Args: { product_id: string; amount: number }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      order_status:
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      user_role: "admin" | "buyer" | "seller"
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
    Enums: {
      order_status: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      user_role: ["admin", "buyer", "seller"],
    },
  },
} as const
