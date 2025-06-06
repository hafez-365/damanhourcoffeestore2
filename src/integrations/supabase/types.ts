export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Product {
  id: number;
  name_ar: string;
  description_ar: string;
  image_url: string;
  price: number;
  created_at?: string;
  updated_at?: string;
}

export type Database = {
  public: {
    Tables: {
      user_addresses: {
        Row: {
          id: string;
          user_id: string;
          governorate: string;
          city: string;
          street: string;
          notes: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {          
          id: string;
          user_id: string;
          governorate: string;
          city: string;
          street: string;
          notes: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;};
        Update: {
          id: string;
          user_id: string;
          governorate: string;
          city: string;
          street: string;
          notes: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
         };
      };
       feedback: {
        Row: {
          id: string; // uuid
          user_id: string; // uuid يشير إلى profiles.id
          rating: number; // 1 إلى 5
          comment: string | null;
          created_at: string; // timestamp
        };
        Insert: {
          id?: string;
          user_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      cart_items: {
        Row: {
          created_at: string | null;
          id: string;
          product_id: number;
          quantity: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          product_id: number;
          quantity?: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          product_id?: number;
          quantity?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      order_items: {
        Row: {
          created_at: string | null;
          id: string;
          order_id: string;
          product_id: number;
          quantity: number;
          total_price: number;
          unit_price: number;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          order_id: string;
          product_id: number;
          quantity: number;
          total_price: number;
          unit_price: number;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          order_id?: string;
          product_id?: number;
          quantity?: number;
          total_price?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          created_at: string | null;
          id: string;
          notes: string | null;
          payment_status: string;
          shipping_address: Json;
          status: string;
          stripe_payment_intent_id: string | null;
          total_amount: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          payment_status?: string;
          shipping_address: Json;
          status?: string;
          stripe_payment_intent_id?: string | null;
          total_amount: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          payment_status?: string;
          shipping_address?: Json;
          status?: string;
          stripe_payment_intent_id?: string | null;
          total_amount?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          available: boolean | null;
          created_at: string;
          description: string | null;
          description_ar: string | null;
          googleFormUrl: string | null;
          id: number;
          image_url: string | null;
          name: string | null;
          name_ar: string | null;
          price: number | null;
          rating: number | null;
        };
        Insert: {
          available?: boolean | null;
          created_at?: string;
          description?: string | null;
          description_ar?: string | null;
          googleFormUrl?: string | null;
          id?: number;
          image_url?: string | null;
          name?: string | null;
          name_ar?: string | null;
          price?: number | null;
          rating?: number | null;
        };
        Update: {
          available?: boolean | null;
          created_at?: string;
          description?: string | null;
          description_ar?: string | null;
          googleFormUrl?: string | null;
          id?: number;
          image?: string | null;
          name?: string | null;
          name_ar?: string | null;
          price?: number | null;
          rating?: number | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          address: string | null;
          avatar_url: string | null;
          city: string | null;
          country: string | null;
          created_at: string | null;
          full_name: string | null;
          id: string;
          phone: string | null;
          postal_code: string | null;
          role: string | null;
          updated_at: string | null;
        };
        Insert: {
          address?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string | null;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          postal_code?: string | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Update: {
          address?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string | null;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          postal_code?: string | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role_type: string;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// باقي التايبز نفسها كما في النسخة السابقة بدون تعديل

export type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      user_role_type: "user_role_type",
    },
  },
} as const;
