import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Paper,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  ThemeProvider,
  createTheme,
  CssBaseline,
  alpha,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import Tab from '@mui/material/Tab';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { SyntheticEvent } from 'react';

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
  category: string;
  dueDate: string | null;
  order: number;
  createdAt: string;
  deletedAt: string;
}

const categories = ['未分類', '仕事', 'プライベート', '買い物', 'その他'];

interface CategoryColor {
  main: string;
  light: string;
  text: string;
}

interface CategoryConfig {
  [key: string]: CategoryColor;
}

const categoryColors: CategoryConfig = {
  '未分類': {
    main: '#6f7782',
    light: '#f6f8f9',
    text: '#6f7782',
  },
  '仕事': {
    main: '#ff642e',
    light: '#fff1ec',
    text: '#ff642e',
  },
  'プライベート': {
    main: '#796eff',
    light: '#f4f3ff',
    text: '#796eff',
  },
  '買い物': {
    main: '#00c875',
    light: '#e6fff5',
    text: '#00c875',
  },
  'その他': {
    main: '#fdab3d',
    light: '#fff5e6',
    text: '#fdab3d',
  },
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#14aaf5', // Asanaのブルー
      light: '#4fc3f7',
      dark: '#0d8ecf',
    },
    secondary: {
      main: '#796eff', // Asanaのパープル
      light: '#9d97ff',
      dark: '#5b4ccc',
    },
    error: {
      main: '#ff5263', // Asanaのレッド
    },
    background: {
      default: '#f6f8f9', // Asanaの背景色
      paper: '#ffffff',
    },
    text: {
      primary: '#1e1f21', // Asanaのテキストカラー
      secondary: '#6f7782',
    },
    divider: '#e8ecee', // Asanaの区切り線
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h4: {
      fontWeight: 500,
      color: '#1e1f21',
      fontSize: '1.5rem',
    },
    body1: {
      fontSize: '0.875rem',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(21,27,38,.15)',
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.875rem',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          height: 24,
          backgroundColor: alpha('#796eff', 0.08),
          color: '#796eff',
          border: 'none',
          '& .MuiChip-label': {
            padding: '0 8px',
            fontSize: '0.75rem',
            fontWeight: 500,
          },
        },
        outlined: {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginBottom: 4,
          padding: '8px 12px',
          '&:hover': {
            backgroundColor: '#f6f8f9',
            '& .MuiListItemSecondaryAction-root': {
              visibility: 'visible',
            },
            '& .drag-handle': {
              visibility: 'visible',
            },
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: 8,
          color: '#cbd4db',
          '&.Mui-checked': {
            color: '#14aaf5',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [deletedTodos, setDeletedTodos] = useState<Todo[]>([]);
  const [activeTab, setActiveTab] = useState('active');
  const [newTodo, setNewTodo] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('未分類');
  const [dueDate, setDueDate] = useState('');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  useEffect(() => {
    fetchTodos();
    fetchDeletedTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/todos');
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const fetchDeletedTodos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/todos/trash');
      setDeletedTodos(response.data);
    } catch (error) {
      console.error('Error fetching deleted todos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await axios.post('http://localhost:3001/api/todos', {
        title: newTodo,
        category: selectedCategory,
        dueDate: dueDate || null,
      });
      setTodos([response.data, ...todos]);
      setNewTodo('');
      setSelectedCategory('未分類');
      setDueDate('');
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const todo = todos.find((t) => t._id === id);
      if (!todo) return;

      await axios.patch(`http://localhost:3001/api/todos/${id}`, {
        completed: !todo.completed,
      });
      setTodos(
        todos.map((todo) =>
          todo._id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3001/api/todos/${id}`);
      const deletedTodo = todos.find(todo => todo._id === id);
      if (deletedTodo) {
        setDeletedTodos([deletedTodo, ...deletedTodos]);
      }
      setTodos(todos.filter((todo) => todo._id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const response = await axios.post(`http://localhost:3001/api/todos/${id}/restore`);
      setTodos([response.data, ...todos]);
      setDeletedTodos(deletedTodos.filter(todo => todo._id !== id));
    } catch (error) {
      console.error('Error restoring todo:', error);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3001/api/todos/${id}/permanent`);
      setDeletedTodos(deletedTodos.filter(todo => todo._id !== id));
    } catch (error) {
      console.error('Error permanently deleting todo:', error);
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setEditTitle(todo.title);
    setEditCategory(todo.category);
    setEditDueDate(todo.dueDate || '');
    setOpenDialog(true);
  };

  const handleUpdate = async () => {
    if (!editingTodo) return;

    try {
      const response = await axios.patch(`http://localhost:3001/api/todos/${editingTodo._id}`, {
        title: editTitle,
        category: editCategory,
        dueDate: editDueDate || null,
      });
      setTodos(
        todos.map((todo) =>
          todo._id === editingTodo._id ? response.data : todo
        )
      );
      setOpenDialog(false);
      setEditingTodo(null);
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
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
      console.error('Error reordering todos:', error);
    }
  };

  const handleTabChange = (_: SyntheticEvent, value: string) => {
    setActiveTab(value);
  };

  const handleDeleteCompleted = async () => {
    try {
      await axios.delete('http://localhost:3001/api/todos/completed/all');
      const completedTodos = todos.filter(todo => todo.completed);
      setDeletedTodos([...completedTodos, ...deletedTodos]);
      setTodos(todos.filter(todo => !todo.completed));
    } catch (error) {
      console.error('Error deleting completed todos:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={0} sx={{ p: 4, bgcolor: 'background.paper' }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
            タスク管理
          </Typography>

          <TabContext value={activeTab}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <TabList onChange={handleTabChange}>
                <Tab label="アクティブ" value="active" />
                <Tab 
                  label={`ゴミ箱 (${deletedTodos.length})`} 
                  value="trash"
                  sx={{
                    color: 'error.main',
                    '&.Mui-selected': {
                      color: 'error.main',
                    },
                  }}
                />
              </TabList>
            </Box>

            <TabPanel value="active" sx={{ p: 0 }}>
              <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="新しいタスクを入力してEnterを押してください"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: categoryColors[selectedCategory].main,
                      },
                      '&:hover fieldset': {
                        borderColor: categoryColors[selectedCategory].main,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: categoryColors[selectedCategory].main,
                    },
                  }}
                />
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <FormControl 
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: categoryColors[selectedCategory].main,
                        },
                        '&:hover fieldset': {
                          borderColor: categoryColors[selectedCategory].main,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: categoryColors[selectedCategory].main,
                      },
                    }}
                  >
                    <InputLabel>カテゴリー</InputLabel>
                    <Select
                      value={selectedCategory}
                      label="カテゴリー"
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      {categories.map((category) => (
                        <MenuItem 
                          key={category} 
                          value={category}
                          sx={{
                            color: categoryColors[category].text,
                            '&:hover': {
                              backgroundColor: categoryColors[category].light,
                            },
                            '&.Mui-selected': {
                              backgroundColor: categoryColors[category].light,
                              '&:hover': {
                                backgroundColor: categoryColors[category].light,
                              },
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: categoryColors[category].main,
                              mr: 1,
                              display: 'inline-block',
                            }}
                          />
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    type="date"
                    label="期限"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: categoryColors[selectedCategory].main,
                        },
                        '&:hover fieldset': {
                          borderColor: categoryColors[selectedCategory].main,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: categoryColors[selectedCategory].main,
                      },
                    }}
                  />
                </Stack>
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={!newTodo.trim()}
                  sx={{ 
                    py: 1.5,
                    bgcolor: categoryColors[selectedCategory].main,
                    '&:hover': {
                      bgcolor: categoryColors[selectedCategory].main,
                      opacity: 0.9,
                    },
                    '&.Mui-disabled': {
                      bgcolor: alpha(categoryColors[selectedCategory].main, 0.3),
                    },
                  }}
                >
                  タスクを追加
                </Button>
              </Box>

              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteSweepIcon />}
                  onClick={handleDeleteCompleted}
                  disabled={!todos.some((todo) => todo.completed)}
                  sx={{
                    borderColor: 'error.main',
                    '&:hover': {
                      backgroundColor: alpha('#ff5263', 0.04),
                      borderColor: 'error.dark',
                    },
                  }}
                >
                  完了したタスクを削除
                </Button>
              </Box>

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
                              sx={{
                                bgcolor: 'background.paper',
                                mb: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderLeft: `4px solid ${categoryColors[todo.category].main}`,
                                '&:hover': {
                                  borderColor: categoryColors[todo.category].main,
                                  borderLeftWidth: '4px',
                                  bgcolor: categoryColors[todo.category].light,
                                },
                                position: 'relative',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <Box
                                {...provided.dragHandleProps}
                                className="drag-handle"
                                sx={{
                                  visibility: 'hidden',
                                  color: 'text.secondary',
                                  display: 'flex',
                                  alignItems: 'center',
                                  mr: 1,
                                }}
                              >
                                <DragIndicatorIcon />
                              </Box>
                              <Checkbox
                                checked={todo.completed}
                                onChange={() => handleToggle(todo._id)}
                                color="primary"
                                size="small"
                                sx={{
                                  color: todo.completed ? '#cbd4db' : categoryColors[todo.category].main,
                                  '&.Mui-checked': {
                                    color: categoryColors[todo.category].main,
                                  },
                                }}
                              />
                              <ListItemText
                                primary={
                                  <Box>
                                    <Typography
                                      variant="body1"
                                      sx={{
                                        textDecoration: todo.completed ? 'line-through' : 'none',
                                        color: todo.completed ? 'text.secondary' : 'text.primary',
                                        mb: 0.5,
                                      }}
                                    >
                                      {todo.title}
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                      <Chip
                                        label={todo.category}
                                        size="small"
                                        sx={{
                                          backgroundColor: categoryColors[todo.category].light,
                                          color: categoryColors[todo.category].text,
                                          borderColor: 'transparent',
                                          '& .MuiChip-label': {
                                            fontWeight: 500,
                                          },
                                        }}
                                      />
                                      {todo.dueDate && (
                                        <Chip
                                          label={`期限: ${new Date(
                                            todo.dueDate
                                          ).toLocaleDateString()}`}
                                          size="small"
                                          variant="outlined"
                                          sx={{
                                            borderColor: categoryColors[todo.category].main,
                                            color: categoryColors[todo.category].text,
                                            '& .MuiChip-label': {
                                              fontWeight: 500,
                                            },
                                          }}
                                        />
                                      )}
                                    </Stack>
                                  </Box>
                                }
                              />
                              <ListItemSecondaryAction
                                sx={{
                                  visibility: 'hidden',
                                  right: 8,
                                }}
                              >
                                <IconButton
                                  edge="end"
                                  aria-label="edit"
                                  onClick={() => handleEdit(todo)}
                                  sx={{ 
                                    mr: 1, 
                                    color: 'text.secondary',
                                    '&:hover': {
                                      color: categoryColors[todo.category].main,
                                    },
                                  }}
                                  size="small"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  edge="end"
                                  aria-label="delete"
                                  onClick={() => handleDelete(todo._id)}
                                  sx={{ 
                                    color: 'error.main',
                                    '&:hover': {
                                      color: 'error.dark',
                                    },
                                  }}
                                  size="small"
                                >
                                  <DeleteIcon fontSize="small" />
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
            </TabPanel>

            <TabPanel value="trash" sx={{ p: 0 }}>
              <List>
                {deletedTodos.map((todo) => (
                  <ListItem
                    key={todo._id}
                    sx={{
                      bgcolor: 'background.paper',
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderLeft: `4px solid ${categoryColors[todo.category].main}`,
                      opacity: 0.7,
                      '&:hover': {
                        opacity: 1,
                        borderColor: categoryColors[todo.category].main,
                        borderLeftWidth: '4px',
                        bgcolor: categoryColors[todo.category].light,
                      },
                      position: 'relative',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box>
                          <Typography
                            variant="body1"
                            sx={{
                              color: 'text.secondary',
                              mb: 0.5,
                            }}
                          >
                            {todo.title}
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            <Chip
                              label={todo.category}
                              size="small"
                              sx={{
                                backgroundColor: categoryColors[todo.category].light,
                                color: categoryColors[todo.category].text,
                                borderColor: 'transparent',
                                opacity: 0.7,
                                '& .MuiChip-label': {
                                  fontWeight: 500,
                                },
                              }}
                            />
                            {todo.dueDate && (
                              <Chip
                                label={`期限: ${new Date(todo.dueDate).toLocaleDateString()}`}
                                size="small"
                                variant="outlined"
                                sx={{
                                  borderColor: categoryColors[todo.category].main,
                                  color: categoryColors[todo.category].text,
                                  opacity: 0.7,
                                  '& .MuiChip-label': {
                                    fontWeight: 500,
                                  },
                                }}
                              />
                            )}
                            <Chip
                              label={`削除: ${new Date(todo.deletedAt).toLocaleDateString()}`}
                              size="small"
                              color="error"
                              variant="outlined"
                              sx={{
                                opacity: 0.7,
                                '& .MuiChip-label': {
                                  fontWeight: 500,
                                },
                              }}
                            />
                          </Stack>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="restore"
                        onClick={() => handleRestore(todo._id)}
                        sx={{ 
                          mr: 1,
                          color: categoryColors[todo.category].main,
                        }}
                        size="small"
                      >
                        <RestoreFromTrashIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete permanently"
                        onClick={() => handlePermanentDelete(todo._id)}
                        sx={{ 
                          color: 'error.main',
                          '&:hover': {
                            color: 'error.dark',
                          },
                        }}
                        size="small"
                      >
                        <DeleteForeverIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </TabPanel>
          </TabContext>
        </Paper>

        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 2,
              minWidth: 400,
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>タスクを編集</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="タイトル"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              sx={{ mb: 2, mt: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>カテゴリー</InputLabel>
              <Select
                value={editCategory}
                label="カテゴリー"
                onChange={(e) => setEditCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem 
                    key={category} 
                    value={category}
                    sx={{
                      color: categoryColors[category].text,
                      '&:hover': {
                        backgroundColor: categoryColors[category].light,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: categoryColors[category].main,
                        mr: 1,
                        display: 'inline-block',
                      }}
                    />
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="date"
              label="期限"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setOpenDialog(false)}>キャンセル</Button>
            <Button onClick={handleUpdate} variant="contained">
              保存
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}

export default App;
