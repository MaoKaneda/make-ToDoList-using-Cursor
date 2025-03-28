import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import todoRoutes from './routes/todos';

// 環境変数を読み込みます
// .envファイルから設定を読み込んで、アプリケーションで使えるようにします
dotenv.config();

// Expressアプリケーションを作成します
// これは、Webサーバーの基本的な機能を提供するものです
const app = express();

// ミドルウェアを設定します
// これらは、リクエストが来たときに実行される処理です

// CORSを有効にします
// これにより、フロントエンドからバックエンドへのアクセスが可能になります
app.use(cors());

// JSONデータを解析できるようにします
// フロントエンドから送られてくるJSONデータを読み取れるようになります
app.use(express.json());

// ルートを設定します
// /api/todos というURLでタスク関連のAPIにアクセスできるようになります
app.use('/api/todos', todoRoutes);

// MongoDBに接続します
// データベースに接続して、タスクのデータを保存できるようにします
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app')
  .then(() => {
    console.log('MongoDBに接続しました');
  })
  .catch((error) => {
    console.error('MongoDBへの接続に失敗しました:', error);
  });

// サーバーを起動します
// ポート3001でリクエストを受け付けるようになります
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
}); 