import express, { Request, Response } from 'express';
import Todo from '../models/Todo';

const router = express.Router();

// すべてのTodoを取得
router.get('/', async (req: Request, res: Response) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// 新しいTodoを作成
router.post('/', async (req: Request, res: Response) => {
  try {
    const todo = new Todo({
      title: req.body.title,
    });
    const newTodo = await todo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(400).json({ message: '無効なデータです' });
  }
});

// Todoを更新
router.patch('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'Todoが見つかりません' });
    }
    todo.completed = !todo.completed;
    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (error) {
    res.status(400).json({ message: '無効なデータです' });
  }
});

// Todoを削除
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'Todoが見つかりません' });
    }
    await todo.deleteOne();
    res.json({ message: 'Todoが削除されました' });
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

export default router; 