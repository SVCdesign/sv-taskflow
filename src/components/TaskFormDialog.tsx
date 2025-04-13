import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Stack,
  Autocomplete,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  IconButton,
  Divider,
  Paper,
  Avatar,
  InputAdornment,
  LinearProgress,
  TextFieldProps
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CommentIcon from '@mui/icons-material/Comment';
import ChecklistIcon from '@mui/icons-material/Checklist';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import PersonIcon from '@mui/icons-material/Person';
import { Task, ChecklistItem, Comment } from '../types/types';
import { useKanban } from '../context/KanbanContext';

interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  columnId: string;
}

const TaskFormDialog: React.FC<TaskFormDialogProps> = ({
  open,
  onClose,
  task,
  columnId,
}) => {
  const { state, dispatch } = useKanban();
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'baixa' | 'média' | 'alta' | ''>('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('Usuário');

  const allTags = Array.from(
    new Set(
      Object.values(state.tasks).flatMap(task => task.tags || [])
    )
  ).sort();

  useEffect(() => {
    if (task) {
      setContent(task.content);
      setDescription(task.description || '');
      setPriority(task.priority || '');
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
      setTags(task.tags || []);
      setCoverImage(task.coverImage || '');
      setAssignedTo(task.assignedTo || '');
      setChecklist(task.checklist || []);
      setComments(task.comments || []);
    } else {
      setContent('');
      setDescription('');
      setPriority('');
      setDueDate(null);
      setTags([]);
      setCoverImage('');
      setAssignedTo('');
      setChecklist([]);
      setComments([]);
    }
  }, [task, open]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };
  
  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem: ChecklistItem = {
        id: `temp-${Math.random().toString(36).substring(2, 9)}`,
        text: newChecklistItem.trim(),
        isComplete: false
      };
      setChecklist([...checklist, newItem]);
      setNewChecklistItem('');
    }
  };
  
  const handleToggleChecklistItem = (itemId: string) => {
    setChecklist(
      checklist.map(item => 
        item.id === itemId ? { ...item, isComplete: !item.isComplete } : item
      )
    );
  };
  
  const handleDeleteChecklistItem = (itemId: string) => {
    setChecklist(checklist.filter(item => item.id !== itemId));
  };
  
  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentObj: Comment = {
        id: `temp-${Math.random().toString(36).substring(2, 9)}`,
        text: newComment.trim(),
        author: commentAuthor,
        createdAt: new Date()
      };
      setComments([newCommentObj, ...comments]);
      setNewComment('');
    }
  };
  
  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  const handleSubmit = () => {
    if (!content.trim()) return;

    const taskPayload = {
        content,
        description: description || undefined,
        priority: priority || undefined,
        dueDate: dueDate || undefined,
        tags,
        coverImage: coverImage || undefined,
        assignedTo: assignedTo || undefined,
        checklist: checklist,
        comments: comments,
    };

    if (task) {
        dispatch({
            type: 'UPDATE_TASK',
            payload: { taskId: task.id, ...taskPayload },
        });
    } else {
        dispatch({
            type: 'ADD_TASK',
            payload: { columnId, ...taskPayload },
        });
    }
    onClose();
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('pt-BR');
  };

  const calculateChecklistProgress = () => {
    if (!checklist || checklist.length === 0) return 0;
    const completedItems = checklist.filter(item => item.isComplete).length;
    return Math.round((completedItems / checklist.length) * 100);
  };

  const checklistProgress = calculateChecklistProgress();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{task ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
      <DialogContent dividers>
        <TextField
          autoFocus
          margin="dense"
          label="Título *"
          type="text"
          fullWidth
          variant="outlined"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Descrição"
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Adicione uma descrição mais detalhada..."
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth margin="dense" variant="outlined" sx={{ mb: 2 }}>
          <InputLabel>Prioridade</InputLabel>
          <Select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'baixa' | 'média' | 'alta' | '')}
            label="Prioridade"
          >
            <MenuItem value=""><em>Nenhuma</em></MenuItem>
            <MenuItem value="baixa">Baixa</MenuItem>
            <MenuItem value="média">Média</MenuItem>
            <MenuItem value="alta">Alta</MenuItem>
          </Select>
        </FormControl>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Data de vencimento"
            value={dueDate}
            onChange={(newValue) => setDueDate(newValue)}
            slotProps={{
              textField: (params: TextFieldProps) => ({
                ...params,
                fullWidth: true,
                margin: "dense",
                variant: "outlined",
                sx: { mb: 2 }
              })
            }}
          />
        </LocalizationProvider>
        
        <Autocomplete
          multiple
          freeSolo
          options={allTags}
          value={tags}
          onChange={(event, newValue) => {
            const stringValues = newValue.filter((value): value is string => typeof value === 'string');
            setTags(stringValues);
          }}
          renderTags={(value: readonly string[], getTagProps) =>
            value.map((option: string, index: number) => (
              <Chip variant="outlined" label={option} {...getTagProps({ index })} />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Etiquetas"
              placeholder="Adicionar ou criar etiquetas"
              margin="dense"
              sx={{ mb: 2 }}
            />
          )}
        />
        
        <TextField
          margin="dense"
          label="Atribuir a"
          type="text"
          fullWidth
          variant="outlined"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          placeholder='Nome ou email'
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          margin="dense"
          label="URL da Imagem de Capa"
          type="url"
          fullWidth
          variant="outlined"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder='Cole a URL da imagem aqui'
          sx={{ mb: 2 }}
           InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <ImageIcon />
              </InputAdornment>
            ),
          }}
        />

        <Divider sx={{ my: 3 }} />

        <Box display="flex" alignItems="center" mb={2}>
          <ChecklistIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="h6">Lista de Verificação</Typography>
        </Box>
        {checklist.length > 0 && (
          <Box mb={1}>
            <LinearProgress variant="determinate" value={checklistProgress} sx={{ height: 8, borderRadius: 1 }} />
            <Typography variant="caption" align="right" display="block" sx={{ mt: 0.5 }}>
              {checklistProgress}% concluído
            </Typography>
          </Box>
        )}
        <List dense>
          {checklist.map((item) => (
            <ListItem 
              key={item.id}
              disablePadding
              secondaryAction={
                <IconButton edge="end" aria-label="delete item" onClick={() => handleDeleteChecklistItem(item.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                <Checkbox
                  edge="start"
                  checked={item.isComplete}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': `checkbox-list-label-${item.id}` }}
                  onChange={() => handleToggleChecklistItem(item.id)}
                  size="small"
                />
              </ListItemIcon>
              <ListItemText 
                id={`checkbox-list-label-${item.id}`} 
                primary={item.text} 
                sx={{ textDecoration: item.isComplete ? 'line-through' : 'none', color: item.isComplete ? 'text.disabled' : 'inherit' }}
              />
            </ListItem>
          ))}
        </List>
        <Box display="flex" alignItems="center" mt={1}>
          <TextField
            size="small"
            placeholder="Adicionar item à lista"
            value={newChecklistItem}
            onChange={(e) => setNewChecklistItem(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddChecklistItem();
              }
            }}
            variant="outlined"
            fullWidth
            sx={{ mr: 1 }}
          />
          <Button 
            onClick={handleAddChecklistItem} 
            disabled={!newChecklistItem.trim()}
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
          >
            Adicionar
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" alignItems="center" mb={2}>
          <CommentIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="h6">Comentários</Typography>
        </Box>
        <List dense>
          {comments.map((comment) => (
            <ListItem key={comment.id} alignItems="flex-start" disablePadding sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', width: '100%' }}>
                <Avatar sx={{ width: 32, height: 32, mr: 1.5, mt: 0.5, bgcolor: 'secondary.light' }}>
                  {comment.author.charAt(0)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight="bold">{comment.author}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                    </Typography>
                  </Box>
                  <Paper variant="outlined" sx={{ p: 1.5, mt: 0.5, bgcolor: 'action.hover' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {comment.text}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
        <TextField
          label="Adicionar um comentário"
          multiline
          rows={3}
          fullWidth
          variant="outlined"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          margin="dense"
          sx={{ mb: 1 }}
        />
        <Box display="flex" justifyContent="flex-end">
           <Button 
             onClick={handleAddComment} 
             disabled={!newComment.trim()}
             variant="contained"
             size="small"
            >
             Salvar Comentário
           </Button>
        </Box>

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!content.trim()}> 
          {task ? 'Salvar Alterações' : 'Criar Tarefa'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskFormDialog; 