import { useTheme } from '../context/ThemeContext';

export default function About() {
  const { isDarkMode } = useTheme();

  const containerStyle = {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    lineHeight: '1.6'
  };

  const codeBlockStyle = {
    background: isDarkMode ? '#333' : '#f4f4f4',
    padding: '15px',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    overflowX: 'auto'
  };

  return (
    <div style={containerStyle}>
      <h1>About This Project</h1>
      <p>
        This Smart To-Do App was built to demonstrate advanced React patterns, 
        including <strong>Custom Hooks</strong>, <strong>Context API</strong>, and <strong>AI Integration</strong>.
      </p>
    </div>
  );
}