# タスク管理アプリケーション

シンプルで使いやすいタスク管理アプリケーションです。タスクの作成、編集、削除、並び替えなどの機能を備えています。

## 目次
1. [機能一覧](#機能一覧)
2. [技術スタック](#技術スタック)
3. [開発環境のセットアップ](#開発環境のセットアップ)
4. [アプリケーションの使用方法](#アプリケーションの使用方法)
5. [トラブルシューティング](#トラブルシューティング)
6. [開発者向け情報](#開発者向け情報)

## 機能一覧 🚀

- ✅ タスクの追加・編集・削除
- 📋 ドラッグ＆ドロップでの並び替え
- 🏷 カテゴリー分類（未分類・仕事・プライベート・買い物・その他）
- 📅 期限の設定
- 🗑 ゴミ箱機能（削除したタスクの復元が可能）
- ✨ カテゴリーごとの色分け表示
- ⚡️ 完了タスクの一括削除

## 技術スタック 🛠

### フロントエンド
- TypeScript: 型安全なJavaScript
- React: UIライブラリ
- Material-UI: モダンなUIコンポーネント
- @hello-pangea/dnd: ドラッグ＆ドロップ機能
- Axios: API通信クライアント

### バックエンド
- Node.js: サーバーサイドJavaScript実行環境
- Express: Webアプリケーションフレームワーク
- MongoDB: NoSQLデータベース
- TypeScript: 型システム

## 開発環境のセットアップ 💻

### 必要な環境
- Node.js: 最新のLTS版
- npm または yarn: パッケージマネージャー
- MongoDB: データベース

### インストール手順

1. **リポジトリのクローン**
\`\`\`bash
git clone [リポジトリURL]
cd [プロジェクト名]
\`\`\`

2. **バックエンドのセットアップ**
\`\`\`bash
cd backend
npm install
\`\`\`

3. **フロントエンドのセットアップ**
\`\`\`bash
cd frontend
npm install
\`\`\`

## アプリケーションの使用方法 📱

### サーバーの起動

1. **バックエンドサーバー起動（ポート3001）**
\`\`\`bash
cd backend
npm run dev
\`\`\`

2. **フロントエンドサーバー起動（ポート3000）**
\`\`\`bash
cd frontend
npm start
\`\`\`

### アクセス方法
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:3001

### 基本的な使い方
1. タスクの追加
   - テキスト入力欄にタスクを入力
   - カテゴリーと期限を設定（任意）
   - 「タスクを追加」ボタンをクリック

2. タスクの管理
   - ✓ チェックボックス: タスク完了のトグル
   - ✎ 鉛筆アイコン: タスク編集
   - 🗑 ゴミ箱アイコン: タスク削除
   - ドラッグ＆ドロップ: 順序の変更

3. その他の機能
   - カテゴリーによる色分け表示
   - 期限の設定と表示
   - 完了タスクの一括削除
   - 削除したタスクのゴミ箱保管

### アプリケーションの終了方法
1. 各ターミナルで`Ctrl + C`（MacOSの場合は`Command + C`）
2. または以下のコマンドで強制終了：
\`\`\`bash
lsof -i :3000,3001      # プロセス確認
kill -9 [確認したPID]   # プロセス終了
\`\`\`

## トラブルシューティング 🔧

### よくある問題と解決方法

1. **ポートが使用中の場合**
\`\`\`bash
lsof -i :3000,3001      # 使用中のポート確認
kill -9 [PID]           # プロセス終了
\`\`\`

2. **データベース接続エラー**
- MongoDBサービスの起動確認
- 環境変数（.env）の設定確認

3. **アプリケーションが応答しない**
- 両サーバーの再起動
- 開発者ツール（F12）でのエラー確認

### 開発時の注意点
- ✅ バックエンドを先に起動
- ✅ 環境変数の設定確認
- ✅ コード変更時は自動リロード
- ✅ エラーはコンソールで確認

## 開発者向け情報 👩‍💻

### プロジェクト構造
```
project/
├── backend/              # バックエンドアプリケーション
│   ├── src/             # ソースコード
│   │   ├── models/      # データモデル（MongoDB）
│   │   ├── routes/      # APIエンドポイント
│   │   └── index.ts     # メインサーバーファイル
│   └── package.json     # 依存関係管理
│
└── frontend/            # フロントエンドアプリケーション
    ├── src/            # ソースコード
    │   ├── components/ # UIコンポーネント
    │   └── App.tsx    # メインアプリケーション
    └── package.json   # 依存関係管理
```

### 主要ファイルの説明

#### バックエンド
- `backend/src/index.ts`
  - サーバー設定
  - データベース接続
  - ミドルウェア設定

- `backend/src/models/Todo.ts`
  - タスクスキーマ定義
  - MongoDBモデル
  - TypeScript型定義

- `backend/src/routes/todos.ts`
  - RESTful API実装
  - CRUD操作の定義
  - ルーティング設定

#### フロントエンド
- `frontend/src/App.tsx`
  - UIレイアウト
  - 状態管理
  - APIとの通信
  - イベントハンドリング

## ライセンス 📄
MIT License

## 作者 👤
兼田麻央
