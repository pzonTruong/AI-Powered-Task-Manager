import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function TaskDetail() {
  const { id } = useParams();      // 1. Get the ID from the URL
  const navigate = useNavigate();  // 2. Hook to move between pages
  const { isDarkMode } = useTheme(); 
  
  const [task, setTask] = useState(null);

  useEffect(() => {
    // 3. Fetch data from LocalStorage
    const savedTasks = JSON.parse(localStorage.getItem('my-tasks')) || [];
    
    // 4. Find the specific task (Convert URL ID to number!)
    const foundTask = savedTasks.find(t => t.id === Number(id));
    
    if (foundTask) {
      setTask(foundTask);
    } else {
      // If ID doesn't exist, go back home automatically
      navigate('/');
    }
  }, [id, navigate]);

  if (!task) return <p>Loading...</p>;

  // Styles
  const containerStyle = {
    maxWidth: '600px',
    margin: '40px auto',
    padding: '20px',
    borderRadius: '10px',
    background: isDarkMode ? '#333' : '#fff',
    boxShadow: isDarkMode ? 'none' : '0 4px 12px rgba(0,0,0,0.1)',
    color: isDarkMode ? '#fff' : '#000',
    border: isDarkMode ? '1px solid #555' : '1px solid #eee'
  };

  return (
    <div style={containerStyle}>
      {/* HEADER: Back Button & ID */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/')}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#646cff' }}
        >
          ← Back to Dashboard
        </button>
        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>ID: {task.id}</span>
      </div>

      {/* BODY: The Task Content */}
      <h1 style={{ 
        textDecoration: task.completed ? 'line-through' : 'none',
        color: task.completed ? '#888' : 'inherit' 
      }}>
        {task.text}
      </h1>

      <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
        <h3>Task Metadata</h3>
        
        {/* Shows "Status" */}
        <p>
          <strong>Status: </strong> 
          <span style={{ 
            padding: '4px 8px', 
            borderRadius: '4px', 
            background: task.completed ? '#4caf50' : '#ff9800', // Green if done, Orange if pending
            color: 'white',
            fontSize: '0.9rem'
          }}>
            {task.completed ? 'Completed' : 'Pending'}
          </span>
        </p>

        {/* Shows "Created At" - This proves you handle Dates well */}
        <p>
          <strong>Created At: </strong> 
          {new Date(task.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}