import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  category: {
    type: String,
    default: '未分類',
  },
  dueDate: {
    type: Date,
    default: null,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Todo', todoSchema); 