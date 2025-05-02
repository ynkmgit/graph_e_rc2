'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';

export type UserRole = 'admin' | 'developer' | 'free_user' | 'pro_user';
export type PlanType = 'free' | 'pro' | 'enterprise';

export interface UserRoleData {
  role: UserRole;
  planType: PlanType;
  displayName: string;
  avatarUrl: string | null;
  planExpiresAt: string | null;
  isAdmin: boolean;
  isDeveloper: boolean;
  isPro: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * ユーザーの役割とプラン情報を取得するカスタムフック
 * 
 * @returns ユーザーロール情報
 */
export const useUserRole = (): UserRoleData => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserRoleData>({
    role: 'free_user',
    planType: 'free',
    displayName: '',
    avatarUrl: null,
    planExpiresAt: null,
    isAdmin: false,
    isDeveloper: false,
    isPro: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setUserData(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        // 現在はRLSポリシーでエラーが発生するため、暫定的な対応として
        // ここでは特定のユーザーを管理者として手動で設定します
        // 将来的にはRLSポリシーを修正した後、正式な実装に戻す必要があります
        if (user.email === 'hoge1@example.com') {
          setUserData({
            role: 'admin',
            planType: 'free',
            displayName: user.email?.split('@')[0] || 'User',
            avatarUrl: null,
            planExpiresAt: null,
            isAdmin: true,
            isDeveloper: true,
            isPro: true,
            loading: false,
            error: null
          });
          return;
        }

        // 通常のユーザーはfree_userとして扱う
        setUserData({
          role: 'free_user',
          planType: 'free',
          displayName: user.email?.split('@')[0] || 'User',
          avatarUrl: null,
          planExpiresAt: null,
          isAdmin: false,
          isDeveloper: false,
          isPro: false,
          loading: false,
          error: null
        });

        // 注意: 以下のコードは現在RLSポリシーの無限再帰問題で動作しません
        /*
        // ユーザープロファイルを取得
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role, plan_type, display_name, avatar_url, plan_expires_at')
          .eq('id', user.id)
          .single();

        if (error) {
          // ユーザープロファイルが存在しない場合は作成
          if (error.code === 'PGRST116') { // record not found
            const defaultDisplayName = user.email?.split('@')[0] || 'User';
            
            const { error: insertError } = await supabase
              .from('user_profiles')
              .insert({
                id: user.id,
                display_name: defaultDisplayName,
                role: 'free_user',
                plan_type: 'free'
              });

            if (insertError) throw insertError;
            
            setUserData({
              role: 'free_user',
              planType: 'free',
              displayName: defaultDisplayName,
              avatarUrl: null,
              planExpiresAt: null,
              isAdmin: false,
              isDeveloper: false,
              isPro: false,
              loading: false,
              error: null
            });
            return;
          }
          
          throw error;
        }

        // データがある場合は状態を更新
        if (data) {
          const role = data.role as UserRole;
          const planType = data.plan_type as PlanType;
          
          setUserData({
            role,
            planType,
            displayName: data.display_name || '',
            avatarUrl: data.avatar_url,
            planExpiresAt: data.plan_expires_at,
            isAdmin: role === 'admin',
            isDeveloper: role === 'developer' || role === 'admin',
            isPro: planType === 'pro' || planType === 'enterprise' || role === 'admin' || role === 'developer',
            loading: false,
            error: null
          });
        }
        */
      } catch (error: any) {
        console.error('ユーザーデータの取得に失敗しました:', error);
        
        // エラーが発生した場合でもデフォルト値を設定
        setUserData(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message || 'ユーザーデータの取得に失敗しました'
        }));
      }
    };

    fetchUserData();
  }, [user]);

  return userData;
};
