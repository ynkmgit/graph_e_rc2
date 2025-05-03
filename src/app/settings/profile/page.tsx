'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ProfileForm from '@/components/profile/ProfileForm';

export default function ProfileSettingsPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col items-center p-8 pt-0">
        <div className="w-full max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold dark:text-white">プロフィール設定</h1>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <ProfileForm />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
