import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function TaskItem({ task, onToggle, onDelete, onAddSubtask, onEdit }) {
  const { isDarkMode } = useTheme();

  // LOGIC CHANGE: If text is empty, start in Edit Mode automatically
  const [isEditing, setIsEditing] = useState(task.text === "");
  const [editText, setEditText] = useState(task.text);

  // Handle saving
  const handleSave = () => {
    if (editText.trim()) {
      // Valid text: Save it
      onEdit(task.id, editText);
      setIsEditing(false);
    } else {
      // Empty text: Delete the task (don't allow blank tasks)
      onDelete(task.id);
    }
  };

  // Handle cancelling
  const handleCancel = () => {
    if (!task.text) {
      // If it was a new blank task and user cancels -> Delete it
      onDelete(task.id);
    } else {
      // If it was an existing task -> Revert text
      setEditText(task.text);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // LOGIC CHANGE: Just call the parent function, no prompt needed
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
    transition: 'all 0.2s',
    marginLeft: task.isSubtask ? '40px' : '0px',
    borderLeft: task.isSubtask ? '4px solid #646cff' : 'none',
    backgroundColor: isDarkMode
      ? (task.isSubtask ? '#2a2a2a' : '#333')
      : (task.isSubtask ? '#f8f9fa' : '#fff'),
    boxShadow: isDarkMode ? 'none' : '0 2px 4px rgba(0,0,0,0.05)'
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
    <div style={itemStyle}>
      {/* 1. Subtask Indicator */}
      {task.isSubtask && <span style={{ color: '#646cff', fontWeight: 'bold' }}>{">>"}</span>}

      {/* 2. Checkbox */}
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        style={{ cursor: 'pointer', width: '18px', height: '18px' }}
      />

      {/* 3. Content Area */}
      <div style={{ flexGrow: 1 }}>
        {isEditing ? (
          // --- EDIT MODE ---
          <div style={{ display: 'flex', gap: '5px' }}>
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              // Optional: Save on click away (Blur). 
              // Careful: If you click "Cancel" button, this might trigger first.
              // For now, let's strictly use buttons/keys for safety.
              placeholder="Type subtask here..."
              style={{ flexGrow: 1, padding: '5px', borderRadius: '4px', border: '1px solid #646cff', outline: 'none' }}
              autoFocus // <--- Important: Focus immediately
            />
            <button onClick={handleSave} style={{ ...btnBase, background: '#4caf50', color: '#fff' }}>Save</button>
            <button onClick={handleCancel} style={{ ...btnBase, background: '#999', color: '#fff' }}>Cancel</button>
          </div>
        ) : (
          // --- VIEW MODE ---
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

      {/* 4. Action Buttons */}
      {!isEditing && (
        <div style={{ display: 'flex', gap: '4px' }}>

          <button
            onClick={() => setIsEditing(true)}
            title="Edit"
            style={{ ...btnBase, color: '#646cff', border: '1px solid #646cff' }}
          >
            Edit
          </button>

          {!task.isSubtask && (
            <button
              onClick={handleAddSubClick}
              title="Add Subtask"
              style={{ ...btnBase, color: '#646cff', fontWeight: 'bold' }}
            >
              + Sub
            </button>
          )}

          <button
            onClick={handleDelete}
            style={{ ...btnBase, color: '#ff4d4f' }}
            title="Delete"
          >
            Delete
          </button>
        </div>
      )}

      {/* Details Link */}
      {!task.isSubtask && !isEditing && (
        <Link to={`/task/${task.id}`} style={{ fontSize: '0.8rem', textDecoration: 'none', color: '#888', marginLeft: '5px' }}>
          Details
        </Link>
      )}
    </div>
  );
}