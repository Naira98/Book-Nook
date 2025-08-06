import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { ThemeConsumer } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  return (
    <ThemeConsumer>
      {({ isDarkMode, toggleTheme }) => (
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      )}
    </ThemeConsumer>
  );
};

export default ThemeToggle;