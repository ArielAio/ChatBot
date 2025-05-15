import { useState, useEffect } from 'react';

// Hook personalizado para gerenciar o tema
function useTheme() {
  const [theme, setTheme] = useState('dark'); // Default theme without accessing localStorage yet
  const [mounted, setMounted] = useState(false);
  
  // Apenas executa após o componente montar no cliente
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }
  }, []);
  
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);
  
  const toggleTheme = () => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };
  
  return [theme, toggleTheme, mounted];
}

export default useTheme;
