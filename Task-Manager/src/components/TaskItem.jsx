import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// 1. IMPORT MOTION
import { motion } from 'framer-motion';

export default function TaskItem({ task, onToggle, onDelete, onAddSubtask, onEdit }) {
  const { isDarkMode } = useTheme();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  // 2. MERGE DND STYLES WITH ANIMATION STYLES
  // We apply the DND transform here, but we let Framer handle the entry/exit
  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition, // Keep DND transition for dragging
    zIndex: isDragging ? 999 : 'auto',
    position: 'relative',
    touchAction: 'none'
  };

  const [isEditing, setIsEditing] = useState(task.text === "");
  const [editText, setEditText] = useState(task.text);

  // ... (Keep your existing Logic handlers: handleSave, handleCancel, handleKeyDown, etc.) ...
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

  const handleAddSubClick = () => onAddSubtask(task.id);

  const handleDelete = () => {
    if (task.isSubtask) {
      onDelete(task.id);
    } else {
      if (window.confirm('Delete this task and all its subtasks?')) onDelete(task.id);
    }
  };

  // 3. DEFINE VISUAL STYLES (Colors, Borders)
  const visualStyle = {
    display: 'flex', 
    alignItems: 'center', 
    margin: '8px 0', 
    gap: '10px',
    padding: '12px',
    borderRadius: '8px',
    marginLeft: task.isSubtask ? '40px' : '0px',
    borderLeft: task.isSubtask ? '4px solid #646cff' : 'none',
    backgroundColor: isDarkMode 
      ? (task.isSubtask ? '#2a2a2a' : '#333') 
      : (task.isSubtask ? '#f8f9fa' : '#fff'),
    boxShadow: isDarkMode ? 'none' : '0 2px 4px rgba(0,0,0,0.05)',
    opacity: isDragging ? 0.5 : 1, // Fade while dragging
    ...dndStyle // Apply DND transforms
  };

  const btnBase = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '4px 8px',
    borderRadius: '4px'
  };

  // 4. THE ANIMATED RENDER
  return (
    <motion.div
      ref={setNodeRef}
      style={visualStyle}
      
      // ANIMATION CONFIGURATION
      layout // Smoothly slide other items around when this one moves/deletes
      initial={{ opacity: 0, y: -20, scale: 0.95 }} // Start slightly above and transparent
      animate={{ opacity: 1, y: 0, scale: 1 }}      // Animate to normal
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }} // Shrink on delete
      
      {...attributes} // DND Accessibility
    >
      
      {/* Drag Handle */}
      {!isEditing && (
        <div 
          {...listeners} // Only the handle triggers drag
          style={{ cursor: 'grab', fontSize: '1.2rem', color: '#888', marginRight: '5px' }}
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
    </motion.div>
  );
}