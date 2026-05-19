import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="btn-icon"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-surface-hover)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {theme === 'light' ? (
        <Moon size={18} color="var(--text-secondary)" />
      ) : (
        <Sun size={18} color="var(--accent)" />
      )}
    </button>
  );
};
