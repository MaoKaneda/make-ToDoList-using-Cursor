import express, { Request, Response } from 'express';
import Todo from '../models/Todo';

const router = express.Router();

// すべてのタスクを取得
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ order: 1, createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching todos' });
  }
});

// 新しいタスクを作成
router.post('/', async (req, res) => {
  try {
    const { title, category, dueDate } = req.body;
    const maxOrder = await Todo.findOne().sort({ order: -1 });
    const order = maxOrder ? maxOrder.order + 1 : 0;

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
    const { title, completed, category, dueDate, order } = req.body;
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    if (title !== undefined) todo.title = title;
    if (completed !== undefined) todo.completed = completed;
    if (category !== undefined) todo.category = category;
    if (dueDate !== undefined) todo.dueDate = dueDate;
    if (order !== undefined) todo.order = order;

    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({ message: 'Error updating todo' });
  }
});

// タスクを削除
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.json({ message: 'Todo deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting todo' });
  }
});

// 完了したタスクを一括削除
router.delete('/completed/all', async (req, res) => {
  try {
    await Todo.deleteMany({ completed: true });
    res.json({ message: 'Completed todos deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting completed todos' });
  }
});

// タスクの順序を更新
router.patch('/reorder', async (req, res) => {
  try {
    const { todos } = req.body;
    await Promise.all(
      todos.map((todo: { _id: string; order: number }) =>
        Todo.findByIdAndUpdate(todo._id, { order: todo.order })
      )
    );
    res.json({ message: 'Todos reordered' });
  } catch (error) {
    res.status(500).json({ message: 'Error reordering todos' });
  }
});

export default router; 