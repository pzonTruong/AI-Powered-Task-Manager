import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
// 1. IMPORT DND-KIT HOOKS
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function TaskItem({ task, onToggle, onDelete, onAddSubtask, onEdit }) {
  const { isDarkMode } = useTheme();
  
  // 2. SETUP SORTABLE HOOK
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  // 3. DEFINE DRAG STYLE
  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1, // Fade out while dragging
    zIndex: isDragging ? 999 : 'auto',
    position: 'relative',
    touchAction: 'none' // Important for mobile dragging
  };

  const [isEditing, setIsEditing] = useState(task.text === "");
  const [editText, setEditText] = useState(task.text);

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(task.id, editText);
      setIsEditing(false);
    } else {
      onDelete(task.id);
    }
  };

  const handleCancel = () => {
    if (!task.text) {
      onDelete(task.id);
    } else {
      setEditText(task.text);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    else if (e.key === 'Escape') handleCancel();
  };

  const handleAddSubClick = () => {
    onAddSubtask(task.id);
  };

  const handleDelete = () => {
    if (task.isSubtask) {
      onDelete(task.id);
    } else {
      if (window.confirm('Delete this task and all its subtasks?')) {
        onDelete(task.id);
      }
    }
  };

  const itemStyle = {
    display: 'flex', 
    alignItems: 'center', 
    margin: '8px 0', 
    gap: '10px',
    padding: '12px',
    borderRadius: '8px',
    // Logic: Indent if subtask
    marginLeft: task.isSubtask ? '40px' : '0px',
    borderLeft: task.isSubtask ? '4px solid #646cff' : 'none',
    backgroundColor: isDarkMode 
      ? (task.isSubtask ? '#2a2a2a' : '#333') 
      : (task.isSubtask ? '#f8f9fa' : '#fff'),
    boxShadow: isDarkMode ? 'none' : '0 2px 4px rgba(0,0,0,0.05)',
    ...dndStyle // <--- MERGE DND STYLES
  };

  const btnBase = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '4px 8px',
    borderRadius: '4px'
  };

  return (
    // 4. ATTACH REF
    <div ref={setNodeRef} style={itemStyle}>
      
      {/* 5. DRAG HANDLE (Only show if not editing) */}
      {!isEditing && (
        <div 
          {...attributes} 
          {...listeners} 
          style={{ cursor: 'grab', fontSize: '1.2rem', color: '#888', marginRight: '5px' }}
          title="Drag to reorder"
        >
          ⠿
        </div>
      )}

      {task.isSubtask && <span style={{color: '#646cff', fontWeight: 'bold'}}>{">>"}</span>}

      <input 
        type="checkbox" 
        checked={task.completed} 
        onChange={() => onToggle(task.id)} 
        style={{ cursor: 'pointer', width: '18px', height: '18px' }}
      />
      
      <div style={{ flexGrow: 1 }}>
        {isEditing ? (
          <div style={{ display: 'flex', gap: '5px' }}>
            <input 
              type="text" 
              value={editText} 
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown} 
              placeholder="Type task here..."
              style={{ flexGrow: 1, padding: '5px', borderRadius: '4px', border: '1px solid #646cff', outline: 'none' }}
              autoFocus 
            />
            <button onClick={handleSave} style={{ ...btnBase, background: '#4caf50', color: '#fff' }}>Save</button>
            <button onClick={handleCancel} style={{ ...btnBase, background: '#999', color: '#fff' }}>Cancel</button>
          </div>
        ) : (
          <span 
            onDoubleClick={() => setIsEditing(true)}
            style={{ 
              textDecoration: task.completed ? 'line-through' : 'none',
              color: task.completed ? '#888' : 'inherit',
              fontSize: task.isSubtask ? '0.95rem' : '1rem',
              cursor: 'text',
              display: 'block',
              width: '100%'
            }}
          >
            {task.text}
          </span>
        )}
      </div>

      {!isEditing && (
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => setIsEditing(true)} style={{ ...btnBase, color: '#646cff', border: '1px solid #646cff' }}>Edit</button>
          {!task.isSubtask && <button onClick={handleAddSubClick} style={{ ...btnBase, color: '#646cff', fontWeight: 'bold' }}>+ Sub</button>}
          <button onClick={handleDelete} style={{ ...btnBase, color: '#ff4d4f' }}>Delete</button>
        </div>
      )}

      {!task.isSubtask && !isEditing && (
        <Link to={`/task/${task.id}`} style={{ fontSize: '0.8rem', textDecoration: 'none', color: '#888', marginLeft: '5px' }}>Details</Link>
      )}
    </div>
  );
}