import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// この関数はSuperbaseの認証リダイレクトをハンドリングします
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    // サーバーサイドでSupabaseクライアントを作成
    const supabase = createServerSupabaseClient();
    
    // 認証コードを使ってセッションを交換
    await supabase.auth.exchangeCodeForSession(code);
  }

  // ログイン後のリダイレクト先
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
