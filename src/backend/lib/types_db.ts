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
      chat_embeddings: {
        Row: {
          chat_id: number
          content: Json
          embedding: string
          id: number
          inserted_at: string
          updated_at: string | null
        }
        Insert: {
          chat_id: number
          content: Json
          embedding: string
          id?: number
          inserted_at?: string
          updated_at?: string | null
        }
        Update: {
          chat_id?: number
          content?: Json
          embedding?: string
          id?: number
          inserted_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_embeddings_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          }
        ]
      }
      chats: {
        Row: {
          companion_id: number
          id: number
          inserted_at: string
          metadata: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          companion_id: number
          id?: number
          inserted_at?: string
          metadata: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          companion_id?: number
          id?: number
          inserted_at?: string
          metadata?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_companion_id_fkey"
            columns: ["companion_id"]
            isOneToOne: false
            referencedRelation: "companions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      companions: {
        Row: {
          avatar_url: string
          display_name: string
          id: number
          inserted_at: string
          metadata: Json
          sys_prompt: string
          updated_at: string | null
        }
        Insert: {
          avatar_url: string
          display_name: string
          id?: number
          inserted_at?: string
          metadata: Json
          sys_prompt?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string
          display_name?: string
          id?: number
          inserted_at?: string
          metadata?: Json
          sys_prompt?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          id: string
          stripe_customer_id: string | null
        }
        Insert: {
          id: string
          stripe_customer_id?: string | null
        }
        Update: {
          id?: string
          stripe_customer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          chat_id: number
          content: string | null
          id: number
          inserted_at: string
          is_embedded: boolean
          sender_type: Database["public"]["Enums"]["sender_type_enum"]
          token_count: number
          updated_at: string | null
        }
        Insert: {
          chat_id: number
          content?: string | null
          id?: number
          inserted_at?: string
          is_embedded?: boolean
          sender_type: Database["public"]["Enums"]["sender_type_enum"]
          token_count: number
          updated_at?: string | null
        }
        Update: {
          chat_id?: number
          content?: string | null
          id?: number
          inserted_at?: string
          is_embedded?: boolean
          sender_type?: Database["public"]["Enums"]["sender_type_enum"]
          token_count?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          }
        ]
      }
      prices: {
        Row: {
          active: boolean | null
          currency: string | null
          description: string | null
          id: string
          interval: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count: number | null
          metadata: Json | null
          product_id: string | null
          trial_period_days: number | null
          type: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount: number | null
        }
        Insert: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Update: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id?: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          active: boolean | null
          description: string | null
          id: string
          image: string | null
          metadata: Json | null
          name: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created: string
          current_period_end: string
          current_period_start: string
          ended_at: string | null
          id: string
          metadata: Json | null
          price_id: string | null
          quantity: number | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          trial_end: string | null
          trial_start: string | null
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "prices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          billing_address: Json | null
          id: string
          payment_method: Json | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          billing_address?: Json | null
          id: string
          payment_method?: Json | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          billing_address?: Json | null
          id?: string
          payment_method?: Json | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      __plpgsql_show_dependency_tb:
        | {
            Args: {
              funcoid: unknown
              relid?: unknown
            }
            Returns: {
              type: string
              oid: unknown
              schema: string
              name: string
              params: string
            }[]
          }
        | {
            Args: {
              name: string
              relid?: unknown
            }
            Returns: {
              type: string
              oid: unknown
              schema: string
              name: string
              params: string
            }[]
          }
      get_unembedded_chunk: {
        Args: {
          p_context_limit: number
          p_chunk_limit: number
          p_chat_id: number
        }
        Returns: {
          chat_id: number
          content: string | null
          id: number
          inserted_at: string
          is_embedded: boolean
          sender_type: Database["public"]["Enums"]["sender_type_enum"]
          token_count: number
          updated_at: string | null
        }[]
      }
      insert_chat_embedding: {
        Args: {
          p_chat_id: number
          p_embedding: string
          p_content: Json
          p_messages_id: number[]
        }
        Returns: undefined
      }
      insert_user_and_companion_message: {
        Args: {
          p_chat_id: number
          p_user_msg_content: string
          p_user_msg_token_count: number
          p_companion_msg_content: string
          p_companion_msg_token_count: number
        }
        Returns: undefined
      }
      latest_messages_within_limit: {
        Args: {
          token_limit: number
          m_chat_id: number
        }
        Returns: {
          chat_id: number
          content: string | null
          id: number
          inserted_at: string
          is_embedded: boolean
          sender_type: Database["public"]["Enums"]["sender_type_enum"]
          token_count: number
          updated_at: string | null
        }[]
      }
      plpgsql_check_function:
        | {
            Args: {
              funcoid: unknown
              relid?: unknown
              format?: string
              fatal_errors?: boolean
              other_warnings?: boolean
              performance_warnings?: boolean
              extra_warnings?: boolean
              security_warnings?: boolean
              oldtable?: unknown
              newtable?: unknown
              anyelememttype?: unknown
              anyenumtype?: unknown
              anyrangetype?: unknown
              anycompatibletype?: unknown
              anycompatiblerangetype?: unknown
              without_warnings?: boolean
              all_warnings?: boolean
              use_incomment_options?: boolean
              incomment_options_usage_warning?: boolean
            }
            Returns: string[]
          }
        | {
            Args: {
              name: string
              relid?: unknown
              format?: string
              fatal_errors?: boolean
              other_warnings?: boolean
              performance_warnings?: boolean
              extra_warnings?: boolean
              security_warnings?: boolean
              oldtable?: unknown
              newtable?: unknown
              anyelememttype?: unknown
              anyenumtype?: unknown
              anyrangetype?: unknown
              anycompatibletype?: unknown
              anycompatiblerangetype?: unknown
              without_warnings?: boolean
              all_warnings?: boolean
              use_incomment_options?: boolean
              incomment_options_usage_warning?: boolean
            }
            Returns: string[]
          }
      plpgsql_check_function_tb:
        | {
            Args: {
              funcoid: unknown
              relid?: unknown
              fatal_errors?: boolean
              other_warnings?: boolean
              performance_warnings?: boolean
              extra_warnings?: boolean
              security_warnings?: boolean
              oldtable?: unknown
              newtable?: unknown
              anyelememttype?: unknown
              anyenumtype?: unknown
              anyrangetype?: unknown
              anycompatibletype?: unknown
              anycompatiblerangetype?: unknown
              without_warnings?: boolean
              all_warnings?: boolean
              use_incomment_options?: boolean
              incomment_options_usage_warning?: boolean
            }
            Returns: {
              functionid: unknown
              lineno: number
              statement: string
              sqlstate: string
              message: string
              detail: string
              hint: string
              level: string
              position: number
              query: string
              context: string
            }[]
          }
        | {
            Args: {
              name: string
              relid?: unknown
              fatal_errors?: boolean
              other_warnings?: boolean
              performance_warnings?: boolean
              extra_warnings?: boolean
              security_warnings?: boolean
              oldtable?: unknown
              newtable?: unknown
              anyelememttype?: unknown
              anyenumtype?: unknown
              anyrangetype?: unknown
              anycompatibletype?: unknown
              anycompatiblerangetype?: unknown
              without_warnings?: boolean
              all_warnings?: boolean
              use_incomment_options?: boolean
              incomment_options_usage_warning?: boolean
            }
            Returns: {
              functionid: unknown
              lineno: number
              statement: string
              sqlstate: string
              message: string
              detail: string
              hint: string
              level: string
              position: number
              query: string
              context: string
            }[]
          }
      plpgsql_check_pragma: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      plpgsql_coverage_branches:
        | {
            Args: {
              funcoid: unknown
            }
            Returns: number
          }
        | {
            Args: {
              name: string
            }
            Returns: number
          }
      plpgsql_coverage_statements:
        | {
            Args: {
              funcoid: unknown
            }
            Returns: number
          }
        | {
            Args: {
              name: string
            }
            Returns: number
          }
      plpgsql_profiler_function_statements_tb:
        | {
            Args: {
              funcoid: unknown
            }
            Returns: {
              stmtid: number
              parent_stmtid: number
              parent_note: string
              block_num: number
              lineno: number
              queryid: number
              exec_stmts: number
              exec_stmts_err: number
              total_time: number
              avg_time: number
              max_time: number
              processed_rows: number
              stmtname: string
            }[]
          }
        | {
            Args: {
              name: string
            }
            Returns: {
              stmtid: number
              parent_stmtid: number
              parent_note: string
              block_num: number
              lineno: number
              queryid: number
              exec_stmts: number
              exec_stmts_err: number
              total_time: number
              avg_time: number
              max_time: number
              processed_rows: number
              stmtname: string
            }[]
          }
      plpgsql_profiler_function_tb:
        | {
            Args: {
              funcoid: unknown
            }
            Returns: {
              lineno: number
              stmt_lineno: number
              queryids: number[]
              cmds_on_row: number
              exec_stmts: number
              exec_stmts_err: number
              total_time: number
              avg_time: number
              max_time: number[]
              processed_rows: number[]
              source: string
            }[]
          }
        | {
            Args: {
              name: string
            }
            Returns: {
              lineno: number
              stmt_lineno: number
              queryids: number[]
              cmds_on_row: number
              exec_stmts: number
              exec_stmts_err: number
              total_time: number
              avg_time: number
              max_time: number[]
              processed_rows: number[]
              source: string
            }[]
          }
      plpgsql_profiler_functions_all: {
        Args: Record<PropertyKey, never>
        Returns: {
          funcoid: unknown
          exec_count: number
          exec_stmts_err: number
          total_time: number
          avg_time: number
          stddev_time: number
          min_time: number
          max_time: number
        }[]
      }
      plpgsql_profiler_install_fake_queryid_hook: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      plpgsql_profiler_remove_fake_queryid_hook: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      plpgsql_profiler_reset: {
        Args: {
          funcoid: unknown
        }
        Returns: undefined
      }
      plpgsql_profiler_reset_all: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      plpgsql_show_dependency_tb:
        | {
            Args: {
              fnname: string
              relid?: unknown
            }
            Returns: {
              type: string
              oid: unknown
              schema: string
              name: string
              params: string
            }[]
          }
        | {
            Args: {
              funcoid: unknown
              relid?: unknown
            }
            Returns: {
              type: string
              oid: unknown
              schema: string
              name: string
              params: string
            }[]
          }
      vector_similarity_search: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: number
          content: string
          similarity: number
        }[]
      }
    }
    Enums: {
      pricing_plan_interval: "day" | "week" | "month" | "year"
      pricing_type: "one_time" | "recurring"
      sender_type_enum: "user" | "assistant"
      sender_type_enum_old: "user" | "companion"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
        | "paused"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

