import express, { Request, Response } from 'express';
import Todo from '../models/Todo';

// ルーターを作成します
// これは、タスクに関するいろいろな操作（追加、削除など）をまとめたものです
const router = express.Router();

// 1. すべてのタスクを取得する
// GET /api/todos
router.get('/', async (req, res) => {
  try {
    // データベースから、削除されていないタスクをすべて取得します
    // order（表示順番）とcreatedAt（作成日時）で並び替えます
    const todos = await Todo.find({ isDeleted: false })
      .sort({ order: 1, createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'タスクの取得に失敗しました' });
  }
});

// 2. 削除されたタスクを取得する
// GET /api/todos/trash
router.get('/trash', async (req, res) => {
  try {
    // ゴミ箱に入れられたタスクをすべて取得します
    const deletedTodos = await Todo.find({ isDeleted: true })
      .sort({ deletedAt: -1 });
    res.json(deletedTodos);
  } catch (error) {
    res.status(500).json({ message: '削除されたタスクの取得に失敗しました' });
  }
});

// 3. 新しいタスクを作成する
// POST /api/todos
router.post('/', async (req, res) => {
  try {
    // 新しいタスクのデータを受け取ります
    const { title, category, dueDate } = req.body;

    // 現在のタスクの数を数えて、新しいタスクの表示順番を決めます
    const count = await Todo.countDocuments({ isDeleted: false });
    const order = count;

    // 新しいタスクを作成します
    const todo = new Todo({
      title,
      category,
      dueDate,
      order
    });

    // データベースに保存します
    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: 'タスクの作成に失敗しました' });
  }
});

// 4. タスクを更新する
// PATCH /api/todos/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // タスクを探して更新します
    const todo = await Todo.findByIdAndUpdate(
      id,
      updates,
      { new: true }  // 更新後のタスクを返します
    );

    if (!todo) {
      return res.status(404).json({ message: 'タスクが見つかりません' });
    }

    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: 'タスクの更新に失敗しました' });
  }
});

// 5. タスクを削除する（ゴミ箱に入れる）
// DELETE /api/todos/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // タスクを探して、削除済みとしてマークします
    const todo = await Todo.findByIdAndUpdate(
      id,
      { 
        isDeleted: true,
        deletedAt: new Date()
      },
      { new: true }
    );

    if (!todo) {
      return res.status(404).json({ message: 'タスクが見つかりません' });
    }

    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: 'タスクの削除に失敗しました' });
  }
});

// 6. タスクを完全に削除する
// DELETE /api/todos/:id/permanent
router.delete('/:id/permanent', async (req, res) => {
  try {
    const { id } = req.params;

    // タスクを完全に削除します
    const todo = await Todo.findByIdAndDelete(id);

    if (!todo) {
      return res.status(404).json({ message: 'タスクが見つかりません' });
    }

    res.json({ message: 'タスクを完全に削除しました' });
  } catch (error) {
    res.status(500).json({ message: 'タスクの完全削除に失敗しました' });
  }
});

// 7. タスクを復元する
// POST /api/todos/:id/restore
router.post('/:id/restore', async (req, res) => {
  try {
    const { id } = req.params;

    // タスクを探して、削除状態を解除します
    const todo = await Todo.findByIdAndUpdate(
      id,
      { 
        isDeleted: false,
        deletedAt: null
      },
      { new: true }
    );

    if (!todo) {
      return res.status(404).json({ message: 'タスクが見つかりません' });
    }

    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: 'タスクの復元に失敗しました' });
  }
});

// 8. 完了したタスクを一括削除する
// DELETE /api/todos/completed
router.delete('/completed', async (req, res) => {
  try {
    // 完了済みのタスクをすべて削除状態にします
    await Todo.updateMany(
      { completed: true, isDeleted: false },
      { 
        isDeleted: true,
        deletedAt: new Date()
      }
    );

    res.json({ message: '完了したタスクを削除しました' });
  } catch (error) {
    res.status(500).json({ message: '完了タスクの削除に失敗しました' });
  }
});

// 9. タスクの順番を変更する
// PATCH /api/todos/reorder
router.patch('/reorder', async (req, res) => {
  try {
    const { todos } = req.body;

    // 複数のタスクの順番を一度に更新します
    await Todo.bulkWrite(
      todos.map((todo: any) => ({
        updateOne: {
          filter: { _id: todo._id },
          update: { $set: { order: todo.order } }
        }
      }))
    );

    res.json({ message: 'タスクの順番を更新しました' });
  } catch (error) {
    res.status(500).json({ message: 'タスクの順番の更新に失敗しました' });
  }
});

export default router; 