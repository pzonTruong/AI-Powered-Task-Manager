import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TaskDetail from './pages/TaskDetail';
import About from './pages/About';
import { useTheme } from './context/ThemeContext'; // <--- Import the hook

export default function App() {
  const { isDarkMode, toggleTheme } = useTheme(); // <--- Use the context

  // Dynamic Styles
  const appStyles = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    color: isDarkMode ? '#ffffff' : '#000000',
    minHeight: '100vh', // Full height
    transition: 'all 0.3s ease'
  };

  const navStyle = {
    padding: '20px', 
    borderBottom: isDarkMode ? '1px solid #333' : '1px solid #ddd', 
    display: 'flex', 
    justifyContent: 'space-between', // Push button to the right
    alignItems: 'center'
  };

  return (
    <div style={appStyles}>
      <nav style={navStyle}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <NavLink 
            to="/" 
            style={({ isActive }) => ({ 
              fontWeight: isActive ? 'bold' : 'normal', 
              color: isDarkMode ? '#fff' : '#000',
              textDecoration: 'none' 
            })}
          >
            Dashboard
          </NavLink>

          <NavLink 
            to="/about" 
            style={({ isActive }) => ({ 
              fontWeight: isActive ? 'bold' : 'normal', 
              color: isDarkMode ? '#fff' : '#000',
              textDecoration: 'none' 
            })}
          >
             About
          </NavLink>
        </div>

        {/* The Toggle Button */}
        <button 
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: '1px solid currentColor',
            padding: '5px 10px',
            borderRadius: '5px',
            cursor: 'pointer',
            color: isDarkMode ? '#fff' : '#000'
          }}
        >
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/task/:id" element={<TaskDetail />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}