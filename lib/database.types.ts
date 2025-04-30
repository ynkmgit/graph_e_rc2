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
      todos: {
        Row: {
          id: number
          title: string
          completed: boolean
          user_id: string
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          completed?: boolean
          user_id: string
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          completed?: boolean
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "todos_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          user_id: string
          display_name: string
          bio: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          display_name: string
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          display_name?: string
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_roles: {
        Row: {
          user_id: string
          role: string
        }
        Insert: {
          user_id: string
          role: string
        }
        Update: {
          user_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      chat_rooms: {
        Row: {
          id: number
          name: string
          description: string | null
          created_by: string
          created_at: string
          updated_at: string
          is_private: boolean
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          is_private?: boolean
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
          is_private?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      chat_room_members: {
        Row: {
          room_id: number
          user_id: string
          joined_at: string
        }
        Insert: {
          room_id: number
          user_id: string
          joined_at?: string
        }
        Update: {
          room_id?: number
          user_id?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_members_room_id_fkey"
            columns: ["room_id"]
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_room_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          id: number
          room_id: number
          user_id: string
          content: string
          created_at: string
          updated_at: string
          is_edited: boolean
        }
        Insert: {
          id?: number
          room_id: number
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
          is_edited?: boolean
        }
        Update: {
          id?: number
          room_id?: number
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
          is_edited?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          }
        ]
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

// 各テーブルの型を簡単に使えるようにエクスポート
export type Todo = Database['public']['Tables']['todos']['Row'];
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type UserRole = Database['public']['Tables']['user_roles']['Row'];
export type ChatRoom = Database['public']['Tables']['chat_rooms']['Row'];
export type ChatRoomMember = Database['public']['Tables']['chat_room_members']['Row'];
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];

// Joinした結果の型も定義
export type ChatMessageWithUser = ChatMessage & {
  user_profile: {
    display_name: string;
    avatar_url: string | null;
  };
};

export type ChatRoomWithMemberCount = ChatRoom & {
  member_count: number;
  is_member: boolean;
};

export type UserWithRole = UserProfile & {
  role: string;
};
