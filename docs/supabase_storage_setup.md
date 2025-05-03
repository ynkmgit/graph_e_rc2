# Supabaseストレージセットアップ手順

このドキュメントでは、ユーザープロフィール画像保存用のSupabaseストレージバケットを設定する手順を説明します。

## 1. アバター用バケットの作成

1. Supabaseダッシュボードにログイン
2. 左側のメニューから「Storage」を選択
3. 「New bucket」ボタンをクリック
4. 以下の設定で新しいバケットを作成:
   - Bucket name: `avatars`
   - Public bucket: チェックを外す（非公開）
   - File size limit: `2MB`
5. 「Create bucket」ボタンをクリック

## 2. セキュリティポリシーの設定

### 保存(INSERT)ポリシー

1. 作成した`avatars`バケットを選択
2. 「Policies」タブをクリック
3. 「Add policy from scratch」を選択
4. 以下の内容でポリシーを設定:
   - Policy name: `Avatar Upload Policy`
   - Allowed operations: `INSERT`
   - Policy definition:
   ```sql
   (auth.uid() = (storage.foldername)::uuid) AND 
   (storage.extension() IN ('jpg', 'jpeg', 'png', 'gif')) AND 
   (storage.size() < 2097152)
   ```
   - 説明: ユーザーは自分のUIDと一致するフォルダ名にのみアップロード可能、JPG/PNG/GIF形式のみ、2MB以下

### 読み取り(SELECT)ポリシー

1. 「Add policy from scratch」を選択
2. 以下の内容でポリシーを設定:
   - Policy name: `Avatar View Policy`
   - Allowed operations: `SELECT`
   - Policy definition:
   ```sql
   -- 以下のいずれかの条件が真の場合、アバターの読み取りを許可
   -- 1. 自分のアバター
   -- 2. アバターの所有者のユーザープロファイルが deleted_at が NULL (削除されていない)
   auth.uid() = (storage.foldername)::uuid OR 
   EXISTS (
     SELECT 1 FROM user_profiles 
     WHERE id = (storage.foldername)::uuid 
     AND deleted_at IS NULL
   )
   ```
   - 説明: 自分のアバターは常に見える。他のユーザーのアバターは、そのユーザーが削除されていない場合に見える

### 更新(UPDATE)ポリシー

1. 「Add policy from scratch」を選択
2. 以下の内容でポリシーを設定:
   - Policy name: `Avatar Update Policy`
   - Allowed operations: `UPDATE`
   - Policy definition:
   ```sql
   auth.uid() = (storage.foldername)::uuid
   ```
   - 説明: ユーザーは自分のアバターのみ更新可能

### 削除(DELETE)ポリシー

1. 「Add policy from scratch」を選択
2. 以下の内容でポリシーを設定:
   - Policy name: `Avatar Delete Policy`
   - Allowed operations: `DELETE`
   - Policy definition:
   ```sql
   auth.uid() = (storage.foldername)::uuid
   ```
   - 説明: ユーザーは自分のアバターのみ削除可能

## 3. 管理者向け追加ポリシー

管理者がすべてのアバターを管理できるようにするポリシーを追加します。

1. 「Add policy with wizard」を選択
2. 「For a specific role」を選択
3. 以下の内容でポリシーを設定:
   - Policy name: `Admin Avatar Management Policy`
   - Allowed operations: すべて選択
   - Target roles: custom
   - Using policy: The following custom check
   ```sql
   EXISTS (
     SELECT 1 FROM user_profiles
     WHERE id = auth.uid() AND role = 'admin'
   )
   ```
   - 説明: 管理者ロールを持つユーザーはすべてのアバターを管理可能

## 4. デフォルトアバターの準備

1. `public/avatars/`ディレクトリにデフォルトアバター画像を配置
2. これらの画像はSupabaseストレージではなく、アプリケーションの静的ファイルとして提供
3. アバターIDとファイル名のマッピングをアプリケーションコードで管理

---

# Supabase Storage Setup Guide

This document explains the procedure for setting up Supabase storage buckets for user profile images.

## 1. Creating an Avatar Bucket

1. Log in to Supabase dashboard
2. Select "Storage" from the left menu
3. Click "New bucket" button
4. Create a new bucket with the following settings:
   - Bucket name: `avatars`
   - Public bucket: Unchecked (private)
   - File size limit: `2MB`
5. Click "Create bucket" button

## 2. Security Policy Configuration

### INSERT Policy

1. Select the created `avatars` bucket
2. Click "Policies" tab
3. Select "Add policy from scratch"
4. Configure the policy with the following content:
   - Policy name: `Avatar Upload Policy`
   - Allowed operations: `INSERT`
   - Policy definition:
   ```sql
   (auth.uid() = (storage.foldername)::uuid) AND 
   (storage.extension() IN ('jpg', 'jpeg', 'png', 'gif')) AND 
   (storage.size() < 2097152)
   ```
   - Description: Users can only upload to folder names that match their UID, only JPG/PNG/GIF formats, less than 2MB

### SELECT Policy

1. Select "Add policy from scratch"
2. Configure the policy with the following content:
   - Policy name: `Avatar View Policy`
   - Allowed operations: `SELECT`
   - Policy definition:
   ```sql
   -- Allow reading avatars when any of these conditions are true:
   -- 1. It's your own avatar
   -- 2. The avatar owner's user profile has deleted_at as NULL (not deleted)
   auth.uid() = (storage.foldername)::uuid OR 
   EXISTS (
     SELECT 1 FROM user_profiles 
     WHERE id = (storage.foldername)::uuid 
     AND deleted_at IS NULL
   )
   ```
   - Description: Your own avatar is always visible. Other users' avatars are visible if the user is not deleted

### UPDATE Policy

1. Select "Add policy from scratch"
2. Configure the policy with the following content:
   - Policy name: `Avatar Update Policy`
   - Allowed operations: `UPDATE`
   - Policy definition:
   ```sql
   auth.uid() = (storage.foldername)::uuid
   ```
   - Description: Users can only update their own avatars

### DELETE Policy

1. Select "Add policy from scratch"
2. Configure the policy with the following content:
   - Policy name: `Avatar Delete Policy`
   - Allowed operations: `DELETE`
   - Policy definition:
   ```sql
   auth.uid() = (storage.foldername)::uuid
   ```
   - Description: Users can only delete their own avatars

## 3. Additional Policy for Administrators

Add a policy to allow administrators to manage all avatars:

1. Select "Add policy with wizard"
2. Select "For a specific role"
3. Configure the policy with the following content:
   - Policy name: `Admin Avatar Management Policy`
   - Allowed operations: Select all
   - Target roles: custom
   - Using policy: The following custom check
   ```sql
   EXISTS (
     SELECT 1 FROM user_profiles
     WHERE id = auth.uid() AND role = 'admin'
   )
   ```
   - Description: Users with admin role can manage all avatars

## 4. Preparing Default Avatars

1. Place default avatar images in the `public/avatars/` directory
2. These images are provided as static files of the application, not through Supabase storage
3. Manage the mapping of avatar IDs to file names in application code