import express, { Request, Response } from 'express';
import Todo from '../models/Todo';

const router = express.Router();

// 通常のタスク一覧を取得（削除されていないもの）
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find({ isDeleted: false }).sort({ order: 1, createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching todos' });
  }
});

// 削除済みタスク一覧を取得
router.get('/trash', async (req, res) => {
  try {
    const deletedTodos = await Todo.find({ isDeleted: true }).sort({ deletedAt: -1 });
    res.json(deletedTodos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching deleted todos' });
  }
});

// 新しいタスクを作成
router.post('/', async (req, res) => {
  try {
    const { title, category, dueDate } = req.body;
    const lastTodo = await Todo.findOne({ isDeleted: false }).sort({ order: -1 });
    const order = lastTodo ? lastTodo.order + 1 : 0;
    
    const todo = new Todo({
      title,
      category,
      dueDate,
      order,
    });
    
    const savedTodo = await todo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(500).json({ message: 'Error creating todo' });
  }
});

// タスクを更新
router.patch('/:id', async (req, res) => {
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({ message: 'Error updating todo' });
  }
});

// タスクを削除（ソフトデリート）
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          isDeleted: true,
          deletedAt: new Date(),
        }
      },
      { new: true }
    );
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting todo' });
  }
});

// タスクを完全に削除
router.delete('/:id/permanent', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.json({ message: 'Todo permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting todo permanently' });
  }
});

// 削除済みタスクを復元
router.post('/:id/restore', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          isDeleted: false,
          deletedAt: null,
        }
      },
      { new: true }
    );
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Error restoring todo' });
  }
});

// 完了したタスクを一括削除（ソフトデリート）
router.delete('/completed/all', async (req, res) => {
  try {
    const result = await Todo.updateMany(
      { completed: true, isDeleted: false },
      { 
        $set: { 
          isDeleted: true,
          deletedAt: new Date(),
        }
      }
    );
    res.json({ message: `${result.modifiedCount} todos moved to trash` });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting completed todos' });
  }
});

// タスクの順序を更新
router.patch('/reorder', async (req, res) => {
  try {
    const { todos } = req.body;
    const updates = todos.map((todo: { _id: string; order: number }) => ({
      updateOne: {
        filter: { _id: todo._id },
        update: { $set: { order: todo.order } },
      },
    }));
    
    await Todo.bulkWrite(updates);
    res.json({ message: 'Orders updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating orders' });
  }
});

export default router; 