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
  const [showDeleted, setShowDeleted] = useState(false);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<string | null>(null);
  const [confirmPermanentDeleteUser, setConfirmPermanentDeleteUser] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'logical' | 'physical' | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [showDeleted]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('user_profiles')
        .select(`
          id, 
          display_name, 
          role, 
          plan_type, 
          plan_expires_at, 
          created_at, 
          updated_at,
          deleted_at
        `)
        .order('created_at', { ascending: false });

      // 表示モードに応じて、削除済み/アクティブユーザーをフィルタリング
      if (!showDeleted) {
        query = query.is('deleted_at', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setUsers(data || []);
    } catch (error: any) {
      console.error('ユーザー一覧の取得に失敗しました:', error);
      setError(error.message || 'ユーザー情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

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

  // 論理削除を実行
  const softDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          deleted_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // 成功したら削除モードに応じて一覧を更新
      if (showDeleted) {
        // 削除済み表示モードの場合は、ユーザーを更新
        setUsers(
          users.map(user => 
            user.id === userId ? { ...user, deleted_at: new Date().toISOString() } : user
          )
        );
      } else {
        // 通常表示モードの場合は、ユーザーをリストから除外
        setUsers(users.filter(user => user.id !== userId));
      }
      
      alert('ユーザーを論理削除しました');
    } catch (error: any) {
      console.error('ユーザーの論理削除に失敗しました:', error);
      alert('ユーザーの論理削除に失敗しました');
    } finally {
      setConfirmDeleteUser(null);
      setDeleteType(null);
    }
  };

  // 物理削除を実行
  const permanentDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // 成功したらユーザーをリストから除外
      setUsers(users.filter(user => user.id !== userId));
      
      alert('ユーザーを完全に削除しました');
    } catch (error: any) {
      console.error('ユーザーの物理削除に失敗しました:', error);
      alert('ユーザーの物理削除に失敗しました');
    } finally {
      setConfirmPermanentDeleteUser(null);
      setDeleteType(null);
    }
  };

  // 論理削除を元に戻す
  const restoreUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          deleted_at: null 
        })
        .eq('id', userId);

      if (error) throw error;

      // 成功したら表示モードに応じて一覧を更新
      if (showDeleted) {
        // 削除済み表示モードの場合は、ユーザーを更新
        setUsers(
          users.map(user => 
            user.id === userId ? { ...user, deleted_at: null } : user
          )
        );
      } else {
        // 通常表示モードの場合は一覧を再取得
        fetchUsers();
      }
      
      alert('ユーザーを復元しました');
    } catch (error: any) {
      console.error('ユーザーの復元に失敗しました:', error);
      alert('ユーザーの復元に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">ユーザー管理</h1>
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">ユーザー管理</h1>
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">ユーザー管理</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showDeleted"
              checked={showDeleted}
              onChange={() => setShowDeleted(!showDeleted)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="showDeleted" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              削除済みユーザーを表示
            </label>
          </div>
          <Link 
            href="/admin" 
            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm"
          >
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
      
      {users.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {showDeleted ? '削除済みユーザーが見つかりませんでした' : 'ユーザーが見つかりませんでした'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ユーザー
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ロール
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  プラン
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  登録日
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className={user.deleted_at ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.display_name || '(名前未設定)'}
                          {user.deleted_at && <span className="ml-2 text-xs text-red-500 dark:text-red-400">(削除済み)</span>}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{user.id}</div>
                        {user.deleted_at && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            削除日: {new Date(user.deleted_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      disabled={user.deleted_at !== null}
                      className="text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:opacity-50"
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
                      disabled={user.deleted_at !== null}
                      className="text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:opacity-50"
                    >
                      <option value="free">無料プラン</option>
                      <option value="pro">Proプラン</option>
                      <option value="enterprise">法人プラン</option>
                    </select>
                    {user.plan_expires_at && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        有効期限: {new Date(user.plan_expires_at).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex space-x-2">
                      {user.deleted_at ? (
                        // 削除済みユーザーの場合の操作
                        <>
                          <button
                            onClick={() => restoreUser(user.id)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                          >
                            復元
                          </button>
                          <button
                            onClick={() => {
                              setConfirmPermanentDeleteUser(user.id);
                              setDeleteType('physical');
                            }}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            完全削除
                          </button>
                        </>
                      ) : (
                        // 通常ユーザーの場合の操作
                        <button
                          onClick={() => {
                            setConfirmDeleteUser(user.id);
                            setDeleteType('logical');
                          }}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          削除
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 論理削除確認モーダル */}
      {confirmDeleteUser && deleteType === 'logical' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4 dark:text-white">ユーザーを削除しますか？</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              このユーザーを論理削除します。この操作はあとで元に戻すことができます。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setConfirmDeleteUser(null);
                  setDeleteType(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                キャンセル
              </button>
              <button
                onClick={() => softDeleteUser(confirmDeleteUser)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 物理削除確認モーダル */}
      {confirmPermanentDeleteUser && deleteType === 'physical' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4 text-red-600 dark:text-red-400">⚠️ 警告: ユーザーを完全に削除しますか？</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              このユーザーを完全に削除します。この操作は取り消すことができません。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setConfirmPermanentDeleteUser(null);
                  setDeleteType(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                キャンセル
              </button>
              <button
                onClick={() => permanentDeleteUser(confirmPermanentDeleteUser)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                完全に削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
