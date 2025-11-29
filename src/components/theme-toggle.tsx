'use client';

import { Moon, Sun } from 'lucide-react';
import { useContext } from 'react';
import { ThemeContext } from './theme-provider';

export function ThemeToggle() {
  const context = useContext(ThemeContext);
  
  // Return a placeholder if context is not available (during SSR or outside provider)
  if (!context) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card">
        <Sun className="h-4 w-4 text-foreground" />
      </div>
    );
  }

  const { theme, toggleTheme } = context;

  return (
    <button
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted transition-colors"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-foreground" />
      ) : (
        <Moon className="h-4 w-4 text-foreground" />
      )}
    </button>
  );
}
