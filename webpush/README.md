# Random Pomodoro Web Push Server

Node.js/TypeScript/ExpressベースのWeb Push通知サーバー

## 機能

- Web Push通知の送信
- サブスクリプション管理（登録/解除）
- 個別通知とブロードキャスト通知
- VAPID認証

## 技術スタック

- Node.js
- TypeScript
- Express
- web-push

## セットアップ

### 1. 依存関係のインストール

```bash
cd webpush
npm install
```

### 2. VAPID鍵の生成

```bash
npm run generate-keys
```

生成された公開鍵と秘密鍵をコピーします。

### 3. 環境変数の設定

`.env.example`を`.env`にコピーして編集：

```bash
cp .env.example .env
```

`.env`ファイルに生成したVAPID鍵を設定：

```
PORT=3001
VAPID_PUBLIC_KEY=your_generated_public_key
VAPID_PRIVATE_KEY=your_generated_private_key
VAPID_SUBJECT=mailto:your-email@example.com
```

### 4. ビルドと起動

開発モード：
```bash
npm run dev
```

本番モード：
```bash
npm run build
npm start
```

## API エンドポイント

### ヘルスチェック
```
GET /health
```

### VAPID公開鍵の取得
```
GET /vapid-public-key
```

### サブスクリプションの登録
```
POST /subscribe
Content-Type: application/json

{
  "endpoint": "...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

### サブスクリプションの解除
```
POST /unsubscribe
Content-Type: application/json

{
  "endpoint": "..."
}
```

### 通知のスケジュール予約（タイマー終了時刻を指定）★推奨
ブラウザから通知を予約し、指定時刻にサーバーが自動的に通知を送信します。
```
POST /schedule
Content-Type: application/json

{
  "endpoint": "自分のサブスクリプションのエンドポイント（必須）",
  "scheduledTime": 1735564800000,  // Unix timestamp (ミリ秒) または ISO 8601形式
  "title": "ポモドーロ終了！（必須）",
  "body": "タイマーが終了しました",
  "icon": "/icon.png",
  "data": {
    "todoId": "123"
  }
}
```

レスポンス例：
```json
{
  "message": "Notification scheduled successfully",
  "id": "https://fcm.googleapis.com/...-1735564800000",
  "scheduledTime": 1735564800000,
  "scheduledDate": "2024-12-30T12:00:00.000Z"
}
```

### スケジュール済み通知のキャンセル
```
DELETE /schedule/:id
```

### スケジュール済み通知の一覧取得
```
GET /schedule?endpoint=your-endpoint
```

### 通知の即時送信（ブラウザからのトリガー）
ブラウザから通知内容を送信し、自分自身のサブスクリプションに即座に通知を配信します。
```
POST /notify
Content-Type: application/json

{
  "endpoint": "自分のサブスクリプションのエンドポイント（必須）",
  "title": "通知タイトル（必須）",
  "body": "通知本文",
  "icon": "/icon.png",
  "data": {
    "url": "https://example.com",
    "customField": "任意のデータ"
  }
}
```

レスポンス例：
```json
{
  "message": "Notification sent successfully"
}
```

### 個別通知の送信
```
POST /send-notification
Content-Type: application/json

{
  "endpoint": "...",
  "payload": {
    "title": "通知タイトル",
    "body": "通知本文",
    "icon": "/icon.png"
  }
}
```

### ブロードキャスト通知（レガシー）
```
POST /broadcast
Content-Type: application/json

{
  "payload": {
    "title": "通知タイトル",
    "body": "通知本文",
    "icon": "/icon.png"
  }
}
```

### サブスクリプション数の取得
```
GET /subscriptions/count
```

### サブスクリプション一覧
```
GET /subscriptions
```

## さくらのVPSへのデプロイ

### 1. サーバーの準備

```bash
# Node.jsのインストール（Node.js 20.x）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# プロジェクトディレクトリの作成
sudo mkdir -p /var/www/random-pomodoro-webpush
sudo chown $USER:$USER /var/www/random-pomodoro-webpush
```

### 2. ファイルのアップロード

```bash
# ローカルマシンから
cd webpush
npm run build

# サーバーに必要なファイルをアップロード
scp -r package.json package-lock.json dist/ .env user@your-server-ip:/var/www/random-pomodoro-webpush/
```

### 3. サーバーでの設定

```bash
# サーバーにSSH接続
ssh user@your-server-ip

cd /var/www/random-pomodoro-webpush
npm install --production
```

### 4. PM2でのプロセス管理

```bash
# PM2のインストール
sudo npm install -g pm2

# アプリケーションの起動
pm2 start dist/server.js --name webpush-server

# 自動起動の設定
pm2 startup
pm2 save

# ログの確認
pm2 logs webpush-server
```

### 5. Nginxリバースプロキシの設定（オプション）

```bash
sudo apt-get install nginx

# Nginx設定ファイルの作成
sudo nano /etc/nginx/sites-available/webpush
```

設定例：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 設定を有効化
sudo ln -s /etc/nginx/sites-available/webpush /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. ファイアウォールの設定

```bash
sudo ufw allow 3001/tcp  # 直接アクセスの場合
sudo ufw allow 'Nginx Full'  # Nginxを使う場合
```

## デプロイスクリプト

自動デプロイ用のスクリプト `deploy.sh` を作成できます：

```bash
#!/bin/bash

SERVER_USER="your-user"
SERVER_IP="your-server-ip"
SERVER_PATH="/var/www/random-pomodoro-webpush"

echo "Building project..."
npm run build

echo "Uploading files..."
scp -r package.json package-lock.json dist/ .env $SERVER_USER@$SERVER_IP:$SERVER_PATH/

echo "Installing dependencies and restarting..."
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && npm install --production && pm2 restart webpush-server"

echo "Deployment complete!"
```

## 注意事項

- **デバイスごとの通知**: 各デバイスは独立したサブスクリプションを持ち、それぞれのデバイスにのみ通知が送信されます。複数デバイス間での同期はありません。
- **データベース不使用**: 現在の実装はメモリ内にサブスクリプションを保存します。サーバー再起動時にサブスクリプションは失われます。
- **本番環境**: 永続化が必要な場合は、ファイルストレージまたは外部データベースの追加を検討してください。
- **HTTPS必須**: Web Push通知はHTTPS環境でのみ動作します（localhost除く）。
- **VAPID鍵の管理**: .envファイルは絶対にバージョン管理に含めないでください。

## トラブルシューティング

### ポートが既に使用されている
```bash
# ポート使用状況の確認
sudo lsof -i :3001

# プロセスの停止
pm2 stop webpush-server
```

### ログの確認
```bash
# PM2ログ
pm2 logs webpush-server

# Nginxログ
sudo tail -f /var/log/nginx/error.log
```

## ライセンス

ISC
