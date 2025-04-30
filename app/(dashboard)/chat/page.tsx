'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { getChatRooms, createChatRoom } from '@/lib/supabase-utils';
import { ChatRoomWithMemberCount } from '@/lib/database.types';

export default function ChatHomePage() {
  const [rooms, setRooms] = useState<ChatRoomWithMemberCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  // 新規ルーム作成用
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        fetchRooms(session.user.id);
      }
    };
    
    checkUser();
    
    // リアルタイム更新のサブスクリプション
    const channel = supabase
      .channel('chat_rooms_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chat_rooms' }, 
        () => {
          // ルームに変更があれば再取得
          if (user) fetchRooms(user.id);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user]);
  
  const fetchRooms = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const chatRooms = await getChatRooms(userId);
      setRooms(chatRooms);
    } catch (error: any) {
      console.error('チャットルーム取得エラー:', error);
      setError(`チャットルームの取得に失敗しました: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRoomName.trim() || !user) return;
    
    try {
      setCreateLoading(true);
      
      const newRoom = await createChatRoom({
        name: newRoomName,
        description: newRoomDescription,
        created_by: user.id,
        is_private: isPrivate
      });
      
      // フォームをリセット
      setNewRoomName('');
      setNewRoomDescription('');
      setIsPrivate(false);
      setShowCreateForm(false);
      
      // ルーム一覧を更新
      setRooms(prev => [newRoom, ...prev]);
    } catch (error: any) {
      console.error('チャットルーム作成エラー:', error);
      setError(`チャットルームの作成に失敗しました: ${error.message}`);
    } finally {
      setCreateLoading(false);
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">チャットルーム</h1>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          新規ルーム作成
        </button>
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
            onClick={() => user && fetchRooms(user.id)}
            className="mt-2 text-sm underline flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            再試行
          </button>
        </div>
      )}
      
      {/* 新規ルーム作成フォーム */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">新しいチャットルームを作成</h2>
          
          <form onSubmit={handleCreateRoom}>
            <div className="space-y-4">
              <div>
                <label htmlFor="room-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ルーム名 *</label>
                <input
                  id="room-name"
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  required
                  className="mt-1 input-field"
                  placeholder="ルーム名を入力"
                />
              </div>
              
              <div>
                <label htmlFor="room-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">説明</label>
                <textarea
                  id="room-description"
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  rows={3}
                  className="mt-1 input-field"
                  placeholder="ルームの説明を入力（任意）"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  id="is-private"
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is-private" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  プライベートルーム（招待されたユーザーのみ参加可能）
                </label>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary"
                  disabled={createLoading}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={createLoading || !newRoomName.trim()}
                >
                  {createLoading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  作成
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
      
      {/* ルーム一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-lg p-8 shadow text-center">
            <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">チャットルームがありません</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 mb-4">新しいルームを作成して会話を始めましょう</p>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              ルームを作成
            </button>
          </div>
        ) : (
          rooms.map((room) => (
            <Link 
              key={room.id} 
              href={`/chat/${room.id}`}
              className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
            >
              <div className="p-5 flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">{room.name}</h3>
                  {room.is_private && (
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                      プライベート
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                  {room.description || "説明はありません"}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                    {room.member_count} メンバー
                  </div>
                  <span>{new Date(room.created_at).toLocaleDateString('ja-JP')}</span>
                </div>
              </div>
              <div className={`py-3 px-5 text-center ${room.is_member ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'bg-gray-50 dark:bg-gray-750 text-gray-600 dark:text-gray-400'}`}>
                {room.is_member ? '参加中' : '参加する'}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
