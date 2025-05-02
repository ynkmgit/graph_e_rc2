'use client';

import { useState, useEffect } from 'react';
import { AdminOnly } from '@/components/auth/role';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminUsersPage() {
  return (
    <AdminOnly redirect={true}>
      <UserManagementContent />
    </AdminOnly>
  );
}

function UserManagementContent() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('user_profiles')
          .select(`
            id, 
            display_name, 
            role, 
            plan_type, 
            plan_expires_at, 
            created_at, 
            updated_at
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setUsers(data || []);
      } catch (error: any) {
        console.error('ユーザー一覧の取得に失敗しました:', error);
        setError(error.message || 'ユーザー情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      // 成功したら一覧を更新
      setUsers(
        users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error: any) {
      console.error('ユーザーロールの更新に失敗しました:', error);
      alert('ユーザーロールの更新に失敗しました');
    }
  };

  const updateUserPlan = async (userId: string, newPlan: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          plan_type: newPlan,
          plan_started_at: new Date().toISOString(),
          plan_expires_at: newPlan === 'free' 
            ? null 
            : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1年後
        })
        .eq('id', userId);

      if (error) throw error;

      // 成功したら一覧を更新
      setUsers(
        users.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                plan_type: newPlan,
                plan_expires_at: newPlan === 'free' 
                  ? null 
                  : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
              } 
            : user
        )
      );
    } catch (error: any) {
      console.error('ユーザープランの更新に失敗しました:', error);
      alert('ユーザープランの更新に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">ユーザー管理</h1>
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">ユーザー管理</h1>
        <div className="bg-red-50 p-4 rounded-md text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ユーザー管理</h1>
        <Link 
          href="/admin" 
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm"
        >
          ダッシュボードに戻る
        </Link>
      </div>
      
      {users.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">ユーザーが見つかりませんでした</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ユーザー
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ロール
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  プラン
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  登録日
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.display_name || '(名前未設定)'}
                        </div>
                        <div className="text-xs text-gray-500">{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                      <option value="admin">管理者</option>
                      <option value="developer">開発者</option>
                      <option value="free_user">無料ユーザー</option>
                      <option value="pro_user">Proユーザー</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.plan_type}
                      onChange={(e) => updateUserPlan(user.id, e.target.value)}
                      className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                      <option value="free">無料プラン</option>
                      <option value="pro">Proプラン</option>
                      <option value="enterprise">法人プラン</option>
                    </select>
                    {user.plan_expires_at && (
                      <div className="text-xs text-gray-500 mt-1">
                        有効期限: {new Date(user.plan_expires_at).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
