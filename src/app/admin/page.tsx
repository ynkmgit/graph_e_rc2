'use client';

import { AdminOnly } from '@/components/auth/role';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <AdminOnly redirect={true}>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">管理者ダッシュボード</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AdminDashboardCard
            title="ユーザー管理"
            description="ユーザーの役割とプラン情報を管理します"
            link="/admin/users"
            icon="👥"
          />
          
          <AdminDashboardCard
            title="コンテンツ管理"
            description="プラットフォーム上のコンテンツを管理します"
            link="/admin/content"
            icon="📄"
          />
          
          <AdminDashboardCard
            title="システム設定"
            description="システム全体の設定を変更します"
            link="/admin/settings"
            icon="⚙️"
          />
          
          <AdminDashboardCard
            title="統計情報"
            description="利用統計とアナリティクスを表示します"
            link="/admin/stats"
            icon="📊"
          />
        </div>
        
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">最近の活動</h2>
          <AdminRecentActivities />
        </div>
      </div>
    </AdminOnly>
  );
}

function AdminDashboardCard({ 
  title, 
  description, 
  link, 
  icon 
}: { 
  title: string; 
  description: string; 
  link: string; 
  icon: string;
}) {
  return (
    <Link 
      href={link}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">{description}</p>
    </Link>
  );
}

function AdminRecentActivities() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // ここでは簡易的なデモデータを使用
        // 実際の実装では、Supabaseからデータを取得する
        setTimeout(() => {
          setActivities([
            { id: 1, type: 'user_signup', message: '新規ユーザー登録', timestamp: new Date().toISOString() },
            { id: 2, type: 'plan_upgrade', message: 'ユーザーがProプランに更新', timestamp: new Date().toISOString() },
            { id: 3, type: 'content_created', message: '新しいコンテンツが作成されました', timestamp: new Date().toISOString() },
          ]);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('アクティビティの取得に失敗しました:', error);
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, []);
  
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }
  
  if (activities.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">最近の活動はありません</p>;
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {activities.map(activity => (
          <li key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="flex justify-between">
              <p className="dark:text-white">{activity.message}</p>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(activity.timestamp).toLocaleString()}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
