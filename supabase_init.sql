-- Supabaseデータベース初期化スクリプト
-- Graph E RC2アプリケーション用

-- ユーザープロフィールテーブル
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- RLSポリシーを設定（Row Level Security）
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のプロフィールのみ更新可能 (管理者は例外)
CREATE POLICY "ユーザーは自分のプロフィールを更新可能" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- 誰でもユーザープロフィールを閲覧可能
CREATE POLICY "誰でもユーザープロフィールを閲覧可能" ON public.user_profiles
  FOR SELECT USING (true);

-- ユーザー自身のみ自分のプロフィールを作成可能
CREATE POLICY "ユーザー自身のみプロフィール作成可能" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーロールテーブル
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')) DEFAULT 'user'
);

-- RLSポリシーを設定
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 誰でもロール情報を閲覧可能
CREATE POLICY "誰でもロール情報を閲覧可能" ON public.user_roles
  FOR SELECT USING (true);

-- 管理者のみロール情報を更新可能
CREATE POLICY "管理者のみロール情報を更新可能" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Todosテーブル
CREATE TABLE IF NOT EXISTS public.todos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- RLSポリシーを設定
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のTodosのみ参照可能
CREATE POLICY "ユーザーは自分のTodosのみ参照可能" ON public.todos
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分のTodosのみ作成可能
CREATE POLICY "ユーザーは自分のTodosのみ作成可能" ON public.todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のTodosのみ更新可能
CREATE POLICY "ユーザーは自分のTodosのみ更新可能" ON public.todos
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分のTodosのみ削除可能
CREATE POLICY "ユーザーは自分のTodosのみ削除可能" ON public.todos
  FOR DELETE USING (auth.uid() = user_id);

-- チャットルームテーブル
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_private BOOLEAN NOT NULL DEFAULT false
);

-- RLSポリシーを設定
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

-- 公開ルームは誰でも閲覧可能
CREATE POLICY "公開ルームは誰でも閲覧可能" ON public.chat_rooms
  FOR SELECT USING (
    NOT is_private OR 
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM chat_room_members 
      WHERE room_id = id AND user_id = auth.uid()
    )
  );

-- ログインユーザーのみルーム作成可能
CREATE POLICY "ログインユーザーのみルーム作成可能" ON public.chat_rooms
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- ルーム作成者のみ更新可能
CREATE POLICY "ルーム作成者のみ更新可能" ON public.chat_rooms
  FOR UPDATE USING (auth.uid() = created_by);

-- ルーム作成者のみ削除可能
CREATE POLICY "ルーム作成者のみ削除可能" ON public.chat_rooms
  FOR DELETE USING (auth.uid() = created_by);

-- チャットルームメンバーテーブル
CREATE TABLE IF NOT EXISTS public.chat_room_members (
  room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

-- RLSポリシーを設定
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;

-- メンバー情報は誰でも閲覧可能
CREATE POLICY "メンバー情報は誰でも閲覧可能" ON public.chat_room_members
  FOR SELECT USING (true);

-- 自分自身をメンバーに追加可能（公開ルームのみ）
CREATE POLICY "自分自身をメンバーに追加可能" ON public.chat_room_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE id = room_id AND NOT is_private
    )
  );

-- ルーム作成者は他のユーザーもメンバーに追加可能
CREATE POLICY "ルーム作成者は他のユーザーもメンバーに追加可能" ON public.chat_room_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE id = room_id AND created_by = auth.uid()
    )
  );

-- 自分自身をメンバーから削除可能
CREATE POLICY "自分自身をメンバーから削除可能" ON public.chat_room_members
  FOR DELETE USING (auth.uid() = user_id);

-- ルーム作成者は他のメンバーも削除可能
CREATE POLICY "ルーム作成者は他のメンバーも削除可能" ON public.chat_room_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE id = room_id AND created_by = auth.uid()
    )
  );

-- チャットメッセージテーブル
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_edited BOOLEAN NOT NULL DEFAULT false
);

-- RLSポリシーを設定
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- メッセージはルームのメンバーのみ閲覧可能
CREATE POLICY "メッセージはルームのメンバーのみ閲覧可能" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE id = room_id AND NOT is_private
    ) OR
    EXISTS (
      SELECT 1 FROM chat_room_members 
      WHERE room_id = room_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE id = room_id AND created_by = auth.uid()
    )
  );

-- ルームメンバーのみメッセージ投稿可能
CREATE POLICY "ルームメンバーのみメッセージ投稿可能" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (
      EXISTS (
        SELECT 1 FROM chat_room_members 
        WHERE room_id = room_id AND user_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM chat_rooms 
        WHERE id = room_id AND created_by = auth.uid()
      )
    )
  );

-- 自分のメッセージのみ更新可能
CREATE POLICY "自分のメッセージのみ更新可能" ON public.chat_messages
  FOR UPDATE USING (auth.uid() = user_id);

-- 自分のメッセージのみ削除可能（またはルーム作成者）
CREATE POLICY "自分のメッセージのみ削除可能" ON public.chat_messages
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE id = room_id AND created_by = auth.uid()
    )
  );

-- 便利な関数の作成

-- ルーム情報とメンバー数、参加状態を取得する関数
CREATE OR REPLACE FUNCTION get_chat_rooms_with_member_info(p_user_id UUID)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  is_private BOOLEAN,
  member_count BIGINT,
  is_member BOOLEAN
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.description,
    r.created_by,
    r.created_at,
    r.updated_at,
    r.is_private,
    COUNT(DISTINCT m.user_id)::BIGINT AS member_count,
    CASE WHEN EXISTS (
      SELECT 1 FROM chat_room_members 
      WHERE room_id = r.id AND user_id = p_user_id
    ) THEN TRUE ELSE FALSE END AS is_member
  FROM chat_rooms r
  LEFT JOIN chat_room_members m ON r.id = m.room_id
  WHERE 
    NOT r.is_private 
    OR r.created_by = p_user_id 
    OR EXISTS (
      SELECT 1 FROM chat_room_members 
      WHERE room_id = r.id AND user_id = p_user_id
    )
  GROUP BY r.id
  ORDER BY r.created_at DESC;
END;
$$;

-- 特定のルーム情報とメンバー数、参加状態を取得する関数
CREATE OR REPLACE FUNCTION get_chat_room_with_member_info(p_room_id INTEGER, p_user_id UUID)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  is_private BOOLEAN,
  member_count BIGINT,
  is_member BOOLEAN
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.description,
    r.created_by,
    r.created_at,
    r.updated_at,
    r.is_private,
    COUNT(DISTINCT m.user_id)::BIGINT AS member_count,
    CASE WHEN EXISTS (
      SELECT 1 FROM chat_room_members 
      WHERE room_id = r.id AND user_id = p_user_id
    ) THEN TRUE ELSE FALSE END AS is_member
  FROM chat_rooms r
  LEFT JOIN chat_room_members m ON r.id = m.room_id
  WHERE r.id = p_room_id
  GROUP BY r.id;
END;
$$;

-- ルームとその関連データを削除する関数（トランザクションで実行）
CREATE OR REPLACE FUNCTION delete_chat_room_with_related_data(p_room_id INTEGER)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  -- 関連メッセージの削除
  DELETE FROM chat_messages WHERE room_id = p_room_id;
  
  -- メンバーの削除
  DELETE FROM chat_room_members WHERE room_id = p_room_id;
  
  -- ルーム自体の削除
  DELETE FROM chat_rooms WHERE id = p_room_id;
END;
$$;

-- テーブルのカラム情報を取得する関数（管理画面用）
CREATE OR REPLACE FUNCTION get_table_columns(table_name TEXT)
RETURNS TABLE (
  column_name TEXT,
  data_type TEXT,
  is_nullable BOOLEAN,
  column_default TEXT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::TEXT,
    c.data_type::TEXT,
    (c.is_nullable = 'YES')::BOOLEAN,
    c.column_default::TEXT
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = table_name
  ORDER BY c.ordinal_position;
END;
$$;

-- リアルタイム更新の設定
ALTER publication supabase_realtime ADD TABLE chat_rooms;
ALTER publication supabase_realtime ADD TABLE chat_messages;
ALTER publication supabase_realtime ADD TABLE chat_room_members;

-- デフォルト管理者ユーザーの作成（最初のユーザーを管理者にする）
CREATE OR REPLACE FUNCTION create_admin_for_first_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM user_roles) THEN
    INSERT INTO user_roles (user_id, role) VALUES (NEW.user_id, 'admin');
  ELSE
    INSERT INTO user_roles (user_id, role) VALUES (NEW.user_id, 'user');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_admin_user_trigger
AFTER INSERT ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION create_admin_for_first_user();
