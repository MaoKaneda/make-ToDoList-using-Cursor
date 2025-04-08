import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Chip,
  MenuItem,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Delete as DeleteIcon, Edit as EditIcon, Restore as RestoreIcon } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';

// タスクの型を定義します
// これは、タスクがどんな情報を持っているかを表す「設計図」のようなものです
interface Todo {
  _id: string;           // タスクのID（データベースで使う番号）
  title: string;         // タスクのタイトル
  completed: boolean;    // タスクが完了したかどうか
  category: string;      // タスクの種類
  dueDate: string | null; // タスクの期限
  order: number;         // タスクの表示順番
  isDeleted: boolean;    // タスクが削除されたかどうか
  deletedAt: string | null; // タスクを削除した日時
}

// カテゴリーごとの色を定義します
// これは、タスクの種類によって表示する色を決めるものです
interface CategoryColors {
  [key: string]: {
    main: string;    // メインの色
    light: string;   // 明るい色
    dark: string;    // 暗い色
  };
}

// カテゴリーごとの色を設定します
const categoryColors: CategoryColors = {
  '未分類': { main: '#78909c', light: '#eceff1', dark: '#546e7a' },  // ブルーグレー
  '仕事': { main: '#455a64', light: '#cfd8dc', dark: '#263238' },    // ダークブルーグレー
  'プライベート': { main: '#5d4037', light: '#d7ccc8', dark: '#3e2723' },  // ブラウン
  '買い物': { main: '#616161', light: '#e0e0e0', dark: '#424242' },   // グレー
  'その他': { main: '#37474f', light: '#cfd8dc', dark: '#263238' },   // ダークグレー
};

// アプリケーションのメインコンポーネントです
function App() {
  // タスクの状態を管理します
  const [todos, setTodos] = useState<Todo[]>([]);        // 通常のタスク一覧
  const [deletedTodos, setDeletedTodos] = useState<Todo[]>([]); // 削除されたタスク一覧
  const [newTodo, setNewTodo] = useState('');           // 新しいタスクの入力
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null); // 編集中のタスク
  const [selectedCategory, setSelectedCategory] = useState('未分類'); // 選択中のカテゴリー
  const [dueDate, setDueDate] = useState<string>('');   // 期限の設定
  const [tabValue, setTabValue] = useState('0');        // タブの選択状態

  // アプリケーションが起動したときに実行されます
  useEffect(() => {
    fetchTodos();      // 通常のタスクを取得
    fetchDeletedTodos(); // 削除されたタスクを取得
  }, []);

  // 通常のタスクを取得する関数
  const fetchTodos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/todos');
      setTodos(response.data);
    } catch (error) {
      console.error('タスクの取得に失敗しました:', error);
    }
  };

  // 削除されたタスクを取得する関数
  const fetchDeletedTodos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/todos/trash');
      setDeletedTodos(response.data);
    } catch (error) {
      console.error('削除されたタスクの取得に失敗しました:', error);
    }
  };

  // 新しいタスクを追加する関数
  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      const response = await axios.post('http://localhost:3001/api/todos', {
        title: newTodo,
        category: selectedCategory,
        dueDate: dueDate || null,
      });

      setTodos([...todos, response.data]);
      setNewTodo('');
      setDueDate('');
    } catch (error) {
      console.error('タスクの追加に失敗しました:', error);
    }
  };

  // タスクを更新する関数
  const handleUpdateTodo = async (todo: Todo) => {
    try {
      await axios.patch(`http://localhost:3001/api/todos/${todo._id}`, {
        title: todo.title,
        completed: todo.completed,
        category: todo.category,
        dueDate: todo.dueDate,
      });
      fetchTodos();
    } catch (error) {
      console.error('タスクの更新に失敗しました:', error);
    }
  };

  // タスクを削除する関数（ゴミ箱に入れる）
  const handleDeleteTodo = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3001/api/todos/${id}`);
      fetchTodos();
      fetchDeletedTodos();
    } catch (error) {
      console.error('タスクの削除に失敗しました:', error);
    }
  };

  // タスクを完全に削除する関数
  const handlePermanentDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3001/api/todos/${id}/permanent`);
      fetchDeletedTodos();
    } catch (error) {
      console.error('タスクの完全削除に失敗しました:', error);
    }
  };

  // タスクを復元する関数
  const handleRestoreTodo = async (id: string) => {
    try {
      await axios.post(`http://localhost:3001/api/todos/${id}/restore`);
      fetchTodos();
      fetchDeletedTodos();
    } catch (error) {
      console.error('タスクの復元に失敗しました:', error);
    }
  };

  // 完了したタスクを一括削除する関数
  const handleDeleteCompleted = async () => {
    try {
      await axios.delete('http://localhost:3001/api/todos/completed');
      fetchTodos();
      fetchDeletedTodos();
    } catch (error) {
      console.error('完了タスクの削除に失敗しました:', error);
    }
  };

  // タスクの順番を変更する関数
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTodos(items);

    try {
      await axios.patch('http://localhost:3001/api/todos/reorder', {
        todos: items.map((todo, index) => ({
          _id: todo._id,
          order: index,
        })),
      });
    } catch (error) {
      console.error('タスクの順番の更新に失敗しました:', error);
    }
  };

  // タブの切り替えを処理する関数
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  // タスクの編集ダイアログを開く関数
  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
  };

  // タスクの編集を保存する関数
  const handleSaveEdit = async () => {
    if (!editingTodo) return;

    try {
      await handleUpdateTodo(editingTodo);
      setEditingTodo(null);
    } catch (error) {
      console.error('タスクの編集に失敗しました:', error);
    }
  };

  // タスクの編集をキャンセルする関数
  const handleCancelEdit = () => {
    setEditingTodo(null);
  };

  // タスクの編集ダイアログを表示するコンポーネント
  const EditDialog = () => (
    <Dialog open={!!editingTodo} onClose={handleCancelEdit}>
      <DialogTitle>タスクを編集</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="タスク"
          fullWidth
          value={editingTodo?.title || ''}
          onChange={(e) => setEditingTodo({ ...editingTodo!, title: e.target.value })}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>カテゴリー</InputLabel>
          <Select
            value={editingTodo?.category || '未分類'}
            onChange={(e) => setEditingTodo({ ...editingTodo!, category: e.target.value })}
            label="カテゴリー"
          >
            {Object.keys(categoryColors).map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          label="期限"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={editingTodo?.dueDate || ''}
          onChange={(e) => setEditingTodo({ ...editingTodo!, dueDate: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelEdit}>キャンセル</Button>
        <Button onClick={handleSaveEdit} variant="contained" color="primary">
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );

  // アプリケーションのメイン画面を表示するコンポーネント
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          タスク管理アプリ
        </Typography>

        {/* タスク入力フォーム */}
        <Box sx={{ 
          mb: 4, 
          display: 'flex', 
          gap: 2,
          flexWrap: { xs: 'wrap', md: 'nowrap' }, // モバイルでは折り返し、デスクトップでは一列に
          alignItems: 'flex-start'
        }}>
          <TextField
            fullWidth
            label="新しいタスク"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
            sx={{
              flexGrow: 1,
              minWidth: { xs: '100%', md: '200px' }, // モバイルでは100%、デスクトップでは最小200px
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: categoryColors[selectedCategory].main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: categoryColors[selectedCategory].main,
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: categoryColors[selectedCategory].main,
              },
            }}
          />
          <FormControl sx={{ 
            minWidth: { xs: '100%', md: '200px' }, // モバイルでは100%、デスクトップでは最小200px
            flexShrink: 0 
          }}>
            <InputLabel>カテゴリー</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="カテゴリー"
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: categoryColors[selectedCategory].main,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: categoryColors[selectedCategory].main,
                },
              }}
            >
              {Object.keys(categoryColors).map((category) => (
                <MenuItem 
                  key={category} 
                  value={category}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: categoryColors[category].main,
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flexGrow: 1,
                  }}>
                    {category}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="期限"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              minWidth: { xs: '100%', md: '160px' }, // モバイルでは100%、デスクトップでは最小160px
              flexShrink: 0,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: categoryColors[selectedCategory].main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: categoryColors[selectedCategory].main,
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: categoryColors[selectedCategory].main,
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleAddTodo}
            disabled={!newTodo.trim()}
            sx={{
              minWidth: { xs: '100%', md: 'auto' }, // モバイルでは100%、デスクトップでは自動
              height: '56px', // 他のフォーム要素と同じ高さに
              bgcolor: categoryColors[selectedCategory].main,
              '&:hover': {
                bgcolor: categoryColors[selectedCategory].dark,
              },
              '&.Mui-disabled': {
                bgcolor: categoryColors[selectedCategory].light,
              },
            }}
          >
            追加
          </Button>
        </Box>

        {/* タブ切り替え */}
        <TabContext value={tabValue}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleTabChange} aria-label="タスク一覧">
              <Tab label="通常のタスク" value="0" />
              <Tab label="ゴミ箱" value="1" />
            </TabList>
          </Box>

          {/* 通常のタスク一覧 */}
          <TabPanel value="0">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="todos">
                {(provided) => (
                  <List {...provided.droppableProps} ref={provided.innerRef}>
                    {todos.map((todo, index) => (
                      <Draggable key={todo._id} draggableId={todo._id} index={index}>
                        {(provided) => (
                          <ListItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              bgcolor: todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed
                                ? '#fff5f5'  // 期限切れは薄い赤色の背景
                                : 'background.paper',
                              mb: 1,
                              borderRadius: 1,
                              border: 1,
                              borderColor: todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed
                                ? '#ff1744'  // 期限切れは赤色のボーダー
                                : categoryColors[todo.category].light,
                              '&:hover': {
                                bgcolor: todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed
                                  ? '#ffe5e5'  // 期限切れはホバー時に少し濃い赤色
                                  : categoryColors[todo.category].light,
                              },
                              pr: 12,
                              position: 'relative',
                            }}
                          >
                            <Checkbox
                              checked={todo.completed}
                              onChange={() => handleUpdateTodo({ ...todo, completed: !todo.completed })}
                              sx={{
                                color: categoryColors[todo.category].main,
                                '&.Mui-checked': {
                                  color: categoryColors[todo.category].main,
                                },
                              }}
                            />
                            <ListItemText
                              primary={todo.title}
                              sx={{
                                textDecoration: todo.completed ? 'line-through' : 'none',
                                color: todo.completed ? 'text.secondary' : 'text.primary',
                                flex: '1 1 auto',
                                minWidth: 0,
                              }}
                            />
                            {todo.dueDate && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mr: 6 }}>
                                <Chip
                                  label={new Date(todo.dueDate).toLocaleDateString()}
                                  size="small"
                                  sx={{
                                    borderColor: new Date(todo.dueDate) < new Date() && !todo.completed
                                      ? '#ff1744'  // 期限切れは赤色
                                      : categoryColors[todo.category].main,
                                    color: new Date(todo.dueDate) < new Date() && !todo.completed
                                      ? '#ff1744'  // 期限切れは赤色
                                      : categoryColors[todo.category].main,
                                    backgroundColor: new Date(todo.dueDate) < new Date() && !todo.completed
                                      ? '#ffebee'  // 期限切れは薄い赤色の背景
                                      : 'transparent',
                                    fontWeight: new Date(todo.dueDate) < new Date() && !todo.completed
                                      ? 'bold'
                                      : 'normal',
                                  }}
                                />
                              </Box>
                            )}
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                onClick={() => handleEditClick(todo)}
                                sx={{ mr: 1 }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                edge="end"
                                onClick={() => handleDeleteTodo(todo._id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </DragDropContext>
            {todos.some((todo) => todo.completed) && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleDeleteCompleted}
                sx={{ mt: 2 }}
              >
                完了したタスクを削除
              </Button>
            )}
          </TabPanel>

          {/* ゴミ箱のタスク一覧 */}
          <TabPanel value="1">
            <List>
              {deletedTodos.map((todo) => (
                <ListItem
                  key={todo._id}
                  sx={{
                    bgcolor: 'background.paper',
                    mb: 1,
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'grey.300',
                  }}
                >
                  <ListItemText
                    primary={todo.title}
                    secondary={`削除日時: ${new Date(todo.deletedAt!).toLocaleString()}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRestoreTodo(todo._id)}
                      sx={{ mr: 1 }}
                    >
                      <RestoreIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handlePermanentDelete(todo._id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </TabPanel>
        </TabContext>
      </Box>

      {/* 編集ダイアログ */}
      <EditDialog />
    </Container>
  );
}

export default App;