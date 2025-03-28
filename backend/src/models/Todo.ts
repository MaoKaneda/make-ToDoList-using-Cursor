import mongoose, { Schema, Document } from 'mongoose';

// タスクのデータ型を定義します
// これは、タスクがどんな情報を持っているかを表す「設計図」のようなものです
export interface ITodo extends Document {
  title: string;           // タスクのタイトル（例：「宿題をやる」）
  completed: boolean;      // タスクが完了したかどうか（true: 完了、false: 未完了）
  category: string;        // タスクの種類（例：「勉強」「遊び」など）
  dueDate: Date | null;    // タスクの期限（いつまでにやるか）
  order: number;          // タスクの表示順番（上から何番目に表示するか）
  isDeleted: boolean;     // タスクが削除されたかどうか（ゴミ箱に入れたかどうか）
  deletedAt: Date | null; // タスクを削除した日時
  createdAt: Date;        // タスクを作成した日時
  updatedAt: Date;        // タスクを最後に更新した日時
}

// MongoDBのスキーマを定義します
// これは、データベースにタスクを保存するときの「保存方法」を決めるものです
const TodoSchema: Schema = new Schema({
  title: { 
    type: String, 
    required: true,  // タイトルは必ず入力する必要があります
    trim: true      // 前後の余分な空白を自動で削除します
  },
  completed: { 
    type: Boolean, 
    default: false  // 新しく作ったタスクは自動で「未完了」になります
  },
  category: { 
    type: String, 
    default: '未分類',  // カテゴリーを指定しないと「未分類」になります
    trim: true
  },
  dueDate: { 
    type: Date, 
    default: null  // 期限は指定しなくてもOKです
  },
  order: { 
    type: Number, 
    default: 0  // 表示順番の初期値は0です
  },
  isDeleted: { 
    type: Boolean, 
    default: false  // 新しく作ったタスクは自動で「削除されていない」状態になります
  },
  deletedAt: { 
    type: Date, 
    default: null  // 削除日時は、タスクを削除するまでnullのままです
  }
}, {
  timestamps: true  // 作成日時と更新日時を自動で記録します
});

// タスクのモデルを作成して、他のファイルから使えるようにします
export default mongoose.model<ITodo>('Todo', TodoSchema); 