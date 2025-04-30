'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Todo } from '@/lib/database.types';
import { getTodos, addTodo, updateTodo, deleteTodo } from '@/lib/supabase-utils';

export default function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          return;
        }
        setUser(session.user);
        fetchTodos(session.user.id);
      } catch (error: any) {
        console.error('ユーザー情報取得エラー:', error);
        setError('認証情報の取得に失敗しました。再ログインしてください。');
        setLoading(false);
      }
    };

    checkUser();
  }, [supabase]);

  const fetchTodos = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const todoList = await getTodos(userId);
      setTodos(todoList);

      // 統計情報の計算
      const completed = todoList.filter(todo => todo.completed).length;
      setStats({
        total: todoList.length,
        completed: completed,
        pending: todoList.length - completed
      });

    } catch (error: any) {
      console.error('Todoの取得中にエラーが発生しました:', error);
      setError(`Todoの取得に失敗しました: ${error.message}`);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim() || !user) return;

    try {
      const newTodo = await addTodo({
        title: newTodoTitle,
        completed: false,
        user_id: user.id
      });

      setTodos(prev => [newTodo, ...prev]);
      setNewTodoTitle('');

      // 統計情報の更新
      setStats(prev => ({
        total: prev.total + 1,
        completed: prev.completed,
        pending: prev.pending + 1
      }));

    } catch (error: any) {
      console.error('Todoの追加中にエラーが発生しました:', error);
      setError(`Todoの追加に失敗しました: ${error.message}`);
    }
  };

  const handleToggleTodo = async (id: number, currentCompleted: boolean) => {
    try {
      setError(null);

      const updatedTodo = await updateTodo(id, {
        completed: !currentCompleted
      });

      setTodos(prev => prev.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));

      // 統計情報の更新
      setStats(prev => {
        if (updatedTodo.completed) {
          return {
            total: prev.total,
            completed: prev.completed + 1,
            pending: prev.pending - 1
          };
        } else {
          return {
            total: prev.total,
            completed: prev.completed - 1,
            pending: prev.pending + 1
          };
        }
      });

    } catch (error: any) {
      console.error('Todoの更新中にエラーが発生しました:', error);
      setError(`Todoの更新に失敗しました: ${error.message}`);
    }
  };

  const handleDeleteTodo = async (id: number, isCompleted: boolean) => {
    try {
      setError(null);

      await deleteTodo(id);

      setTodos(prev => prev.filter(todo => todo.id !== id));

      // 統計情報の更新
      setStats(prev => ({
        total: prev.total - 1,
        completed: isCompleted ? prev.completed - 1 : prev.completed,
        pending: isCompleted ? prev.pending : prev.pending - 1
      }));

    } catch (error: any) {
      console.error('Todoの削除中にエラーが発生しました:', error);
      setError(`Todoの削除に失敗しました: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">総タスク数</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">完了タスク</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">未完了タスク</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded shadow-md">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>{error}</p>
          </div>
          <button
            onClick={() => user && fetchTodos(user.id)}
            className="mt-2 text-sm underline flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            再試行
          </button>
        </div>
      )}

      {/* Todoリスト */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">タスク一覧</h2>

          {/* タスク追加フォーム */}
          <form onSubmit={handleAddTodo} className="mb-6 flex gap-2">
            <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              placeholder="新しいタスクを追加"
              className="flex-grow px-4 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              追加
            </button>
          </form>

          {/* タスクリスト */}
          <div className="space-y-2">
            {todos.length === 0 && !error ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-md">
                <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
                <p className="text-gray-500 dark:text-gray-400">タスクはまだありません</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">新しいタスクを追加してください！</p>
              </div>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center justify-between p-4 border dark:border-gray-700 rounded-md ${
                    todo.completed ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-750'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo.id!, todo.completed)}
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span
                      className={`ml-3 ${
                        todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {todo.title}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-4">
                      {new Date(todo.created_at!).toLocaleDateString('ja-JP')}
                    </span>
                    <button
                      onClick={() => handleDeleteTodo(todo.id!, todo.completed)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 最近の活動（サンプル） */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">最近の活動</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="bg-green-100 dark:bg-green-900 rounded-full p-2">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900 dark:text-white">タスク「プロフィール機能のテスト」を完了しました</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">数分前</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900 dark:text-white">タスク「プロフィール機能のテスト」を作成しました</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">30分前</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-2">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900 dark:text-white">プロフィール情報を更新しました</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">1時間前</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
