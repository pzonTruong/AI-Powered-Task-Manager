import { Link } from 'react-router-dom';

export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0', gap: '10px' }}>
      {/* Checkbox for Toggle */}
      <input 
        type="checkbox" 
        checked={task.completed} 
        onChange={() => onToggle(task.id)} 
      />
      
      {/* Task Text (Strikethrough if completed) */}
      <span style={{ 
        textDecoration: task.completed ? 'line-through' : 'none',
        flexGrow: 1 
      }}>
        {task.text}
      </span>

      {/* Link to Detail Page (Lesson 9) */}
      <Link to={`/task/${task.id}`}>Details</Link>

      {/* Delete Button */}
      <button onClick={() => onDelete(task.id)} style={{ background: 'red', color: 'white' }}>
        X
      </button>
    </div>
  );
}