# タスク管理アプリケーション

シンプルで使いやすいタスク管理アプリケーションです。タスクの作成、編集、削除、並び替えなどの機能を備えています。

## 機能一覧

- ✅ タスクの追加・編集・削除
- 📋 ドラッグ＆ドロップでの並び替え
- 🏷 カテゴリー分類（未分類・仕事・プライベート・買い物・その他）
- 📅 期限の設定
- 🗑 ゴミ箱機能（削除したタスクの復元が可能）
- ✨ カテゴリーごとの色分け表示
- ⚡️ 完了タスクの一括削除

## 技術スタック

### フロントエンド
- TypeScript
- React
- Material-UI
- @hello-pangea/dnd（ドラッグ＆ドロップ機能）
- Axios（API通信）

### バックエンド
- Node.js
- Express
- MongoDB
- TypeScript

## 開発環境のセットアップ

### 必要な環境
- Node.js
- npm または yarn
- MongoDB

### インストール手順

1. リポジトリのクローン
\`\`\`bash
git clone [リポジトリURL]
cd [プロジェクト名]
\`\`\`

2. バックエンドのセットアップ
\`\`\`bash
cd backend
npm install
\`\`\`

3. フロントエンドのセットアップ
\`\`\`bash
cd frontend
npm install
\`\`\`

## アプリケーションの起動方法

1. バックエンドサーバーの起動（ポート3001）
\`\`\`bash
cd backend
npm run dev
\`\`\`

2. フロントエンドサーバーの起動（ポート3000）
\`\`\`bash
cd frontend
npm start
\`\`\`

## アクセス方法

- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:3001

## アプリケーションの終了方法

1. 各ターミナルで`Ctrl + C`（MacOSの場合は`Command + C`）を押してサーバーを終了
2. または以下のコマンドで強制終了：
\`\`\`bash
# 使用中のポートを確認
lsof -i :3000,3001

# プロセスの強制終了
kill -9 [確認したPID]
\`\`\`

## トラブルシューティング

### ポートが使用中の場合
\`\`\`bash
# 使用中のポートの確認
lsof -i :3000,3001

# プロセスの終了
kill -9 [PID]
\`\`\`

### データベース接続エラーの場合
1. MongoDBが起動していることを確認
2. バックエンドの`.env`ファイルの設定を確認

### その他の注意点
- バックエンドサーバーを先に起動してください
- 開発者ツール（F12）でエラーを確認できます
- コード変更時は自動でリロードされます

## 開発者向け情報

### ディレクトリ構造
\`\`\`
project/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   └── index.ts
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   └── App.tsx
    └── package.json
\`\`\`

### 主要なファイル
- `backend/src/index.ts`: サーバーのメインファイル
- `backend/src/models/Todo.ts`: タスクのデータモデル
- `backend/src/routes/todos.ts`: APIエンドポイント
- `frontend/src/App.tsx`: メインのUIコンポーネント

## ライセンス
MIT License

## 作者
[あなたの名前]
