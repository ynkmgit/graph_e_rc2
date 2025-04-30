'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { 
  getChatRoomById, 
  getChatMessages, 
  addChatMessage, 
  deleteChatMessage,
  getChatRoomMembers,
  addChatRoomMember,
  removeChatRoomMember,
  subscribeToRoomMessages
} from '@/lib/supabase-utils';
import { 
  ChatRoom, 
  ChatMessage, 
  ChatMessageWithUser,
  UserWithRole 
} from '@/lib/database.types';

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = parseInt(params.id as string);
  
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessageWithUser[]>([]);
  const [members, setMembers] = useState<UserWithRole[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isMember, setIsMember] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  
  const messageEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();
  
  // 現在のユーザー情報を取得
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      } else {
        router.push('/auth');
      }
    };
    
    checkUser();
  }, [supabase, router]);
  
  // ルーム情報を取得
  useEffect(() => {
    if (!user) return;
    
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        
        // ルーム情報を取得
        const roomData = await getChatRoomById(roomId, user.id);
        if (!roomData) {
          setError('チャットルームが見つかりません');
          setLoading(false);
          return;
        }
        
        setRoom(roomData);
        setIsMember(roomData.is_member);
        
        // メンバー一覧を取得
        const membersData = await getChatRoomMembers(roomId);
        setMembers(membersData);
        
        // メッセージを取得
        const messagesData = await getChatMessages(roomId);
        setMessages(messagesData.reverse()); // 古い順に並べ替え
        
        setLoading(false);
        
        // 最新メッセージにスクロール
        scrollToBottom();
      } catch (error: any) {
        console.error('ルームデータ取得エラー:', error);
        setError(`データの取得に失敗しました: ${error.message}`);
        setLoading(false);
      }
    };
    
    fetchRoomData();
  }, [roomId, user]);
  
  // リアルタイムサブスクリプション
  useEffect(() => {
    if (!user || !room) return;
    
    // メッセージのリアルタイム更新をサブスクライブ
    const subscription = subscribeToRoomMessages(roomId, (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
      
      // 少し遅延させて最新メッセージにスクロール
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    });
    
    return () => {
      // クリーンアップ時にサブスクリプションを解除
      supabase.removeChannel(subscription);
    };
  }, [roomId, user, room, supabase]);
  
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user || !isMember) return;
    
    try {
      await addChatMessage({
        room_id: roomId,
        user_id: user.id,
        content: newMessage
      });
      
      setNewMessage('');
    } catch (error: any) {
      console.error('メッセージ送信エラー:', error);
      setError(`メッセージの送信に失敗しました: ${error.message}`);
    }
  };
  
  const handleDeleteMessage = async (messageId: number) => {
    try {
      await deleteChatMessage(messageId);
      
      // 削除したメッセージを画面から除去
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error: any) {
      console.error('メッセージ削除エラー:', error);
      setError(`メッセージの削除に失敗しました: ${error.message}`);
    }
  };
  
  const handleJoinRoom = async () => {
    if (!user) return;
    
    try {
      await addChatRoomMember({
        room_id: roomId,
        user_id: user.id
      });
      
      setIsMember(true);
      
      // メンバー一覧を更新
      const membersData = await getChatRoomMembers(roomId);
      setMembers(membersData);
    } catch (error: any) {
      console.error('ルーム参加エラー:', error);
      setError(`ルームへの参加に失敗しました: ${error.message}`);
    }
  };
  
  const handleLeaveRoom = async () => {
    if (!user) return;
    
    try {
      await removeChatRoomMember(roomId, user.id);
      
      // ルーム一覧ページにリダイレクト
      router.push('/chat');
    } catch (error: any) {
      console.error('ルーム退出エラー:', error);
      setError(`ルームからの退出に失敗しました: ${error.message}`);
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>;
  }
  
  if (error && !room) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-4">エラー</h2>
          <p className="mb-4">{error}</p>
          <Link href="/chat" className="btn-primary">
            チャット一覧に戻る
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      {/* ヘッダー */}
      <div className="bg-white dark:bg-gray-800 rounded-t-lg shadow p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/chat" className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              {room?.name}
              {room?.is_private && (
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                  プライベート
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {members.length} メンバー
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowMembers(!showMembers)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          </button>
          {isMember && (
            <button 
              onClick={handleLeaveRoom}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
            >
              退出
            </button>
          )}
        </div>
      </div>
      
      {/* メインエリア */}
      <div className="flex flex-grow overflow-hidden">
        {/* メッセージエリア */}
        <div className="flex-grow flex flex-col bg-white dark:bg-gray-800">
          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 m-4 rounded shadow-md">
              <p>{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mt-2 text-sm underline"
              >
                閉じる
              </button>
            </div>
          )}
          
          {/* メッセージリスト */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <p>まだメッセージはありません</p>
                {isMember ? (
                  <p>最初のメッセージを送信してみましょう</p>
                ) : (
                  <button 
                    onClick={handleJoinRoom}
                    className="mt-4 btn-primary"
                  >
                    ルームに参加する
                  </button>
                )}
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = user && message.user_id === user.id;
                
                return (
                  <div 
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isOwnMessage ? 'order-1' : 'order-2'}`}>
                      {!isOwnMessage && (
                        <div className="flex items-center mb-1">
                          <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs mr-2">
                            {message.user_profile.display_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {message.user_profile.display_name}
                          </span>
                        </div>
                      )}
                      <div className={`relative ${isOwnMessage ? 'ml-auto' : 'mr-auto'}`}>
                        <div className={`p-3 rounded-lg ${
                          isOwnMessage 
                            ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}>
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        </div>
                        <div className={`flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400 ${
                          isOwnMessage ? 'justify-end' : 'justify-start'
                        }`}>
                          <span>
                            {new Date(message.created_at).toLocaleTimeString('ja-JP', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {message.is_edited && (
                            <span className="ml-1">(編集済み)</span>
                          )}
                          {isOwnMessage && (
                            <button 
                              onClick={() => handleDeleteMessage(message.id!)}
                              className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messageEndRef} />
          </div>
          
          {/* メッセージ入力フォーム */}
          <div className="p-4 border-t dark:border-gray-700">
            {isMember ? (
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="メッセージを入力..."
                  className="flex-grow px-4 py-2 border dark:border-gray-700 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 rounded-full bg-indigo-600 text-white disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </button>
              </form>
            ) : (
              <div className="text-center">
                <button 
                  onClick={handleJoinRoom}
                  className="btn-primary"
                >
                  ルームに参加してメッセージを送信
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* メンバー一覧サイドバー */}
        {showMembers && (
          <div className="w-64 bg-gray-50 dark:bg-gray-750 overflow-y-auto border-l dark:border-gray-700">
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="font-medium text-gray-900 dark:text-white">メンバー一覧</h2>
            </div>
            <div className="p-2">
              {members.map((member) => (
                <div 
                  key={member.user_id}
                  className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white mr-3">
                    {member.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {member.display_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {member.user_id === room?.created_by ? '作成者' : member.role === 'admin' ? '管理者' : 'メンバー'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
