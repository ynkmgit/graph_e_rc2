import { supabase } from './supabase';
import { 
  Todo, 
  UserProfile, 
  UserRole, 
  ChatRoom, 
  ChatRoomMember, 
  ChatMessage,
  ChatMessageWithUser,
  ChatRoomWithMemberCount,
  UserWithRole
} from './database.types';
import { v4 as uuidv4 } from 'uuid';

// ------------------------
// Todo関連の操作
// ------------------------
export async function getTodos(userId: string): Promise<Todo[]> {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Todosの取得エラー:', error);
    throw new Error(`Todosの取得に失敗しました: ${error.message}`);
  }
  
  return data || [];
}

export async function addTodo(todo: Omit<Todo, 'id' | 'created_at'>): Promise<Todo> {
  const currentDate = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('todos')
    .insert({
      ...todo,
      created_at: currentDate
    })
    .select()
    .single();
  
  if (error) {
    console.error('Todoの追加エラー:', error);
    throw new Error(`Todoの追加に失敗しました: ${error.message}`);
  }
  
  return data;
}

export async function updateTodo(id: number, updates: Partial<Todo>): Promise<Todo> {
  const { data, error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Todoの更新エラー:', error);
    throw new Error(`Todoの更新に失敗しました: ${error.message}`);
  }
  
  return data;
}

export async function deleteTodo(id: number): Promise<void> {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Todoの削除エラー:', error);
    throw new Error(`Todoの削除に失敗しました: ${error.message}`);
  }
}

// ------------------------
// ユーザープロフィール関連の操作
// ------------------------
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116はデータが見つからないエラー
    console.error('ユーザープロフィール取得エラー:', error);
    throw new Error(`ユーザープロフィールの取得に失敗しました: ${error.message}`);
  }
  
  return data;
}

export async function createUserProfile(profile: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<UserProfile> {
  const currentDate = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      ...profile,
      created_at: currentDate,
      updated_at: currentDate
    })
    .select()
    .single();
  
  if (error) {
    console.error('ユーザープロフィール作成エラー:', error);
    throw new Error(`ユーザープロフィールの作成に失敗しました: ${error.message}`);
  }
  
  return data;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const currentDate = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: currentDate
    })
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('ユーザープロフィール更新エラー:', error);
    throw new Error(`ユーザープロフィールの更新に失敗しました: ${error.message}`);
  }
  
  return data;
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('ユーザーロール取得エラー:', error);
    throw new Error(`ユーザーロールの取得に失敗しました: ${error.message}`);
  }
  
  return data;
}

export async function getUserWithRole(userId: string): Promise<UserWithRole | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      user_roles (
        role
      )
    `)
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('ユーザー情報取得エラー:', error);
    throw new Error(`ユーザー情報の取得に失敗しました: ${error.message}`);
  }
  
  if (!data) return null;
  
  // ネストされた結果を平坦化
  return {
    ...data,
    role: data.user_roles?.role || 'user'
  } as UserWithRole;
}

export async function getAllUsers(): Promise<UserWithRole[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      user_roles (
        role
      )
    `)
    .order('display_name');
  
  if (error) {
    console.error('ユーザー一覧取得エラー:', error);
    throw new Error(`ユーザー一覧の取得に失敗しました: ${error.message}`);
  }
  
  // ネストされた結果を平坦化
  return (data || []).map(user => ({
    ...user,
    role: user.user_roles?.role || 'user'
  })) as UserWithRole[];
}

export async function setUserRole(userId: string, role: string): Promise<UserRole> {
  // UPSERTを使用（存在すれば更新、なければ挿入）
  const { data, error } = await supabase
    .from('user_roles')
    .upsert({
      user_id: userId,
      role
    })
    .select()
    .single();
  
  if (error) {
    console.error('ユーザーロール設定エラー:', error);
    throw new Error(`ユーザーロールの設定に失敗しました: ${error.message}`);
  }
  
  return data;
}

// ------------------------
// チャットルーム関連の操作
// ------------------------
export async function getChatRooms(userId: string): Promise<ChatRoomWithMemberCount[]> {
  // 複雑なクエリでルーム一覧と各ルームのメンバー数、ユーザーが参加しているかを取得
  const { data, error } = await supabase
    .rpc('get_chat_rooms_with_member_info', { p_user_id: userId });
  
  if (error) {
    console.error('チャットルーム一覧取得エラー:', error);
    throw new Error(`チャットルーム一覧の取得に失敗しました: ${error.message}`);
  }
  
  return data || [];
}

export async function getChatRoomById(roomId: number, userId: string): Promise<ChatRoomWithMemberCount | null> {
  const { data, error } = await supabase
    .rpc('get_chat_room_with_member_info', { 
      p_room_id: roomId,
      p_user_id: userId
    });
  
  if (error) {
    console.error('チャットルーム取得エラー:', error);
    throw new Error(`チャットルームの取得に失敗しました: ${error.message}`);
  }
  
  return data && data.length > 0 ? data[0] : null;
}

export async function createChatRoom(room: Omit<ChatRoom, 'id' | 'created_at' | 'updated_at'>): Promise<ChatRoom> {
  const currentDate = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('chat_rooms')
    .insert({
      ...room,
      created_at: currentDate,
      updated_at: currentDate
    })
    .select()
    .single();
  
  if (error) {
    console.error('チャットルーム作成エラー:', error);
    throw new Error(`チャットルームの作成に失敗しました: ${error.message}`);
  }
  
  // 作成者を自動的にメンバーに追加
  await addChatRoomMember({
    room_id: data.id,
    user_id: room.created_by
  });
  
  return data;
}

export async function updateChatRoom(id: number, updates: Partial<ChatRoom>): Promise<ChatRoom> {
  const currentDate = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('chat_rooms')
    .update({
      ...updates,
      updated_at: currentDate
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('チャットルーム更新エラー:', error);
    throw new Error(`チャットルームの更新に失敗しました: ${error.message}`);
  }
  
  return data;
}

export async function deleteChatRoom(id: number): Promise<void> {
  // トランザクション的に削除処理を行う（メンバーとメッセージも削除）
  const { error } = await supabase.rpc('delete_chat_room_with_related_data', { p_room_id: id });
  
  if (error) {
    console.error('チャットルーム削除エラー:', error);
    throw new Error(`チャットルームの削除に失敗しました: ${error.message}`);
  }
}

export async function getChatRoomMembers(roomId: number): Promise<UserWithRole[]> {
  const { data, error } = await supabase
    .from('chat_room_members')
    .select(`
      user_id,
      joined_at,
      user_profiles (
        user_id,
        display_name,
        bio,
        avatar_url,
        created_at,
        updated_at,
        user_roles (
          role
        )
      )
    `)
    .eq('room_id', roomId)
    .order('joined_at');
  
  if (error) {
    console.error('チャットルームメンバー取得エラー:', error);
    throw new Error(`チャットルームメンバーの取得に失敗しました: ${error.message}`);
  }
  
  // ネストされた結果を平坦化
  return (data || []).map(member => ({
    ...member.user_profiles,
    role: member.user_profiles.user_roles?.role || 'user'
  })) as UserWithRole[];
}

export async function addChatRoomMember(member: Omit<ChatRoomMember, 'joined_at'>): Promise<ChatRoomMember> {
  const currentDate = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('chat_room_members')
    .upsert({
      ...member,
      joined_at: currentDate
    })
    .select()
    .single();
  
  if (error) {
    console.error('チャットルームメンバー追加エラー:', error);
    throw new Error(`チャットルームメンバーの追加に失敗しました: ${error.message}`);
  }
  
  return data;
}

export async function removeChatRoomMember(roomId: number, userId: string): Promise<void> {
  const { error } = await supabase
    .from('chat_room_members')
    .delete()
    .eq('room_id', roomId)
    .eq('user_id', userId);
  
  if (error) {
    console.error('チャットルームメンバー削除エラー:', error);
    throw new Error(`チャットルームメンバーの削除に失敗しました: ${error.message}`);
  }
}

export async function getChatMessages(roomId: number, limit: number = 50, offset: number = 0): Promise<ChatMessageWithUser[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      *,
      user_profiles (
        user_id,
        display_name,
        avatar_url
      )
    `)
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error('チャットメッセージ取得エラー:', error);
    throw new Error(`チャットメッセージの取得に失敗しました: ${error.message}`);
  }
  
  // ネストされた結果を平坦化
  return (data || []).map(message => ({
    ...message,
    user_profile: {
      display_name: message.user_profiles.display_name,
      avatar_url: message.user_profiles.avatar_url
    }
  })) as ChatMessageWithUser[];
}

export async function addChatMessage(message: Omit<ChatMessage, 'id' | 'created_at' | 'updated_at' | 'is_edited'>): Promise<ChatMessage> {
  const currentDate = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      ...message,
      created_at: currentDate,
      updated_at: currentDate,
      is_edited: false
    })
    .select()
    .single();
  
  if (error) {
    console.error('チャットメッセージ追加エラー:', error);
    throw new Error(`チャットメッセージの追加に失敗しました: ${error.message}`);
  }
  
  return data;
}

export async function updateChatMessage(id: number, content: string): Promise<ChatMessage> {
  const currentDate = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('chat_messages')
    .update({
      content,
      updated_at: currentDate,
      is_edited: true
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('チャットメッセージ更新エラー:', error);
    throw new Error(`チャットメッセージの更新に失敗しました: ${error.message}`);
  }
  
  return data;
}

export async function deleteChatMessage(id: number): Promise<void> {
  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('チャットメッセージ削除エラー:', error);
    throw new Error(`チャットメッセージの削除に失敗しました: ${error.message}`);
  }
}

// リアルタイムサブスクリプション関数
export function subscribeToRoomMessages(roomId: number, callback: (message: ChatMessageWithUser) => void) {
  return supabase
    .channel(`room-${roomId}`)
    .on('postgres_changes', {
      event: 'INSERT', 
      schema: 'public', 
      table: 'chat_messages',
      filter: `room_id=eq.${roomId}`
    }, async (payload) => {
      // 新しいメッセージを受信したら、ユーザー情報を含めた完全なメッセージを取得
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('display_name, avatar_url')
        .eq('user_id', payload.new.user_id)
        .single();
        
      // コールバックに完全なメッセージを渡す
      callback({
        ...payload.new,
        user_profile: {
          display_name: userProfile?.display_name || 'Unknown User',
          avatar_url: userProfile?.avatar_url
        }
      } as ChatMessageWithUser);
    })
    .subscribe();
}

// データベース情報取得（管理者用）
export async function getTableInfo() {
  // Supabaseの公開テーブル一覧を取得
  const { data: tables, error: tablesError } = await supabase
    .from('pg_tables')
    .select('tablename')
    .eq('schemaname', 'public');

  if (tablesError) {
    console.error('テーブル一覧取得エラー:', tablesError);
    throw new Error(`テーブル一覧の取得に失敗しました: ${tablesError.message}`);
  }

  // 各テーブルのカラム情報を取得
  const tablesWithColumns = await Promise.all(
    (tables || []).map(async (table) => {
      const { data: columns, error: columnsError } = await supabase
        .rpc('get_table_columns', { table_name: table.tablename });

      if (columnsError) {
        console.error(`テーブル ${table.tablename} のカラム情報取得エラー:`, columnsError);
        return {
          name: table.tablename,
          columns: [],
          error: columnsError.message
        };
      }

      return {
        name: table.tablename,
        columns: columns || []
      };
    })
  );

  return { tables: tablesWithColumns };
}
