import { createContext, useState, useEffect, useContext } from 'react';

// 1. Create the Context (The empty box)
const ThemeContext = createContext();

// 2. Create the Provider (The box filler)
export function ThemeProvider({ children }) {
  // Load preference from storage, default to false (Light Mode)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('app-theme');
    return saved === 'dark';
  });

  // Save to storage whenever it changes
  useEffect(() => {
    localStorage.setItem('app-theme', isDarkMode ? 'dark' : 'light');
    
    // Optional: Add a class to the <body> for global CSS styling
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Create a Custom Hook for easy access
export function useTheme() {
  return useContext(ThemeContext);
}