'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // パスワードの確認
    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      // サインアップ成功
      if (data.user?.identities?.length === 0) {
        // すでにユーザーが存在する場合
        setError('このメールアドレスはすでに登録されています');
      } else if (data.user) {
        try {
          // ユーザープロファイルを作成
          const displayName = email.split('@')[0]; // メールアドレスの@前の部分をユーザー名に
          
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              display_name: displayName,
              role: 'free_user', // デフォルトは無料ユーザー
              plan_type: 'free',  // デフォルトは無料プラン
            });
            
          if (profileError) {
            console.error('プロファイル作成エラー:', profileError);
            // プロファイル作成エラーでもサインアップ自体は成功として扱う
          }
        } catch (profileError) {
          console.error('プロファイル作成中に例外が発生:', profileError);
        }
        
        // 成功メッセージを表示して、ログインページにリダイレクト
        alert('登録が完了しました。メールを確認してアカウントを有効化してください。');
        router.push('/login');
      }
    } catch (error: any) {
      setError(error.message || 'サインアップに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-600">
          {error}
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSignup}>
        <div className="-space-y-px rounded-md shadow-sm">
          <div>
            <label htmlFor="email" className="sr-only">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              required
              className="relative block w-full rounded-t-md border-0 p-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              required
              className="relative block w-full border-0 p-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="sr-only">
              パスワード確認
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              className="relative block w-full rounded-b-md border-0 p-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600"
              placeholder="パスワード確認"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
          >
            {loading ? '処理中...' : 'アカウント作成'}
          </button>
        </div>
      </form>
    </>
  );
}
