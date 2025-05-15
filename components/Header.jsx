import React from 'react';
import { motion } from 'framer-motion';
import { FaBrain, FaSun, FaMoon, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import UserMenu from './UserMenu';

const Header = ({
  toggleSidebar,
  sidebarOpen,
  chatTitle,
  user,
  onLogout,
  toggleMemoryPanel,
  toggleTheme,
  theme,
  toggleMute,
  mute
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 sm:p-4 flex items-center justify-between shadow-sm header-container">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 sm:p-2 mr-1 sm:mr-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors header-button"
          aria-label={sidebarOpen ? "Fechar barra lateral" : "Abrir barra lateral"}
        >
          <span className="block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 mb-1.5 hamburger-line"></span>
          <span className="block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 mb-1.5 hamburger-line"></span>
          <span className="block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 hamburger-line"></span>
        </button>
        <h1 className="text-base sm:text-xl font-semibold text-gray-800 dark:text-gray-100 truncate max-w-[150px] sm:max-w-[250px] md:max-w-full header-title">
          {chatTitle || "Chatbot"}
        </h1>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2">
        <UserMenu 
          user={user} 
          onLogout={onLogout} 
        />
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleMemoryPanel}
          className="p-1 sm:p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label="Memórias"
        >
          <FaBrain className="text-purple-500 dark:text-purple-400" size={16} />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-1 sm:p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? 
            <FaSun className="text-yellow-400" size={16} /> : 
            <FaMoon className="text-gray-700" size={16} />
          }
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleMute}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label={mute ? 'Ativar som' : 'Desativar som'}
        >
          {mute ? 
            <FaVolumeMute className="text-gray-600 dark:text-gray-300" size={18} /> : 
            <FaVolumeUp className="text-gray-600 dark:text-gray-300" size={18} />
          }
        </motion.button>
      </div>
    </div>
  );
};

export default Header;
