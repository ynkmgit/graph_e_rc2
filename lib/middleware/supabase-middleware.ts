import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // リクエストのレスポンスを作成
  const response = NextResponse.next();
  
  // ミドルウェアクライアントを作成
  const supabase = createMiddlewareClient({ req: request, res: response });
  
  // セッションを更新（必要に応じて）
  await supabase.auth.getSession();
  
  return response;
}

// 該当するパス（URL）にのみミドルウェアを適用
export const config = {
  matcher: [
    // 認証ページと認証コールバックを除く全ページに適用
    // ※ 静的アセット (images, fonts等) やAPIルートには適用されません
    '/((?!_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
};
