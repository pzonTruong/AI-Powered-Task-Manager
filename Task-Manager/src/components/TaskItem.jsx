import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext'; // Import theme to handle colors

export default function TaskItem({ task, onToggle, onDelete }) {
  const { isDarkMode } = useTheme();

  // --- DYNAMIC STYLES ---
  const itemStyle = {
    display: 'flex', 
    alignItems: 'center', 
    margin: '8px 0', 
    gap: '10px',
    padding: '10px',
    borderRadius: '8px',
    transition: 'all 0.2s',
    
    // Logic: If it is a subtask, indent it and make it slightly smaller
    marginLeft: task.isSubtask ? '40px' : '0px',
    borderLeft: task.isSubtask ? '4px solid #646cff' : 'none', // Purple line
    backgroundColor: isDarkMode 
      ? (task.isSubtask ? '#2a2a2a' : '#333') // Dark mode colors
      : (task.isSubtask ? '#f8f9fa' : '#fff'), // Light mode colors
    
    // Optional: Add a subtle shadow to main tasks
    boxShadow: task.isSubtask ? 'none' : '0 2px 5px rgba(0,0,0,0.05)'
  };

  return (
    <div style={itemStyle}>
      {/* 1. Visual Icon for Subtasks */}
      {task.isSubtask && <span style={{fontSize: '1.2rem', color: '#646cff'}}>↳</span>}

      {/* 2. Checkbox */}
      <input 
        type="checkbox" 
        checked={task.completed} 
        onChange={() => onToggle(task.id)} 
        style={{ cursor: 'pointer', width: '18px', height: '18px' }}
      />
      
      {/* 3. Task Text */}
      <span style={{ 
        textDecoration: task.completed ? 'line-through' : 'none',
        color: task.completed ? '#888' : 'inherit',
        flexGrow: 1,
        fontSize: task.isSubtask ? '0.95rem' : '1rem' // Slightly smaller text
      }}>
        {task.text}
      </span>

      {/* 4. Details Link (Only show for main tasks to keep UI clean?) */}
      {!task.isSubtask && (
        <Link 
          to={`/task/${task.id}`} 
          style={{ fontSize: '0.8rem', textDecoration: 'none', color: '#646cff' }}
        >
          🔍 Details
        </Link>
      )}

      {/* 5. Delete Button */}
      <button 
        onClick={() => onDelete(task.id)} 
        style={{ 
          background: 'none', 
          border: 'none', 
          color: '#ff4d4f', 
          cursor: 'pointer',
          fontSize: '1.1rem',
          opacity: 0.7 
        }}
        title="Delete"
      >
        ✖
      </button>
    </div>
  );
}