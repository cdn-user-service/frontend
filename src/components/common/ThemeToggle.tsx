import React from 'react';
import { useLayout } from '@/context/LayoutContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { state, changeLayoutTheme } = useLayout();
  const isDark = state.layoutTheme.themeMode === 'dark';

  const toggleTheme = () => {
    const currentTheme = isDark ? 'light' : 'dark';
    changeLayoutTheme({ themeMode: currentTheme });
    document.documentElement.classList.remove('theme-dark', 'theme-light');
    document.documentElement.classList.add(`theme-${currentTheme}`);
  };

  return (
    <button onClick={toggleTheme} className="flex justify-center items-center" >
      {isDark ? <Moon size={20} strokeWidth={1.2} /> : <Sun size={20} strokeWidth={1.2} />}
    </button>
  );
};

export default ThemeToggle;