import React from 'react';
import { motion } from 'framer-motion';
import { FaRobot } from 'react-icons/fa';

// Componente de indicador de digitação otimizado
const TypingIndicator = React.memo(() => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="mb-3 sm:mb-4 flex justify-start"
  >
    <div className="flex w-[90%] sm:w-[85%] order-2">
      <div className="py-2 px-3 sm:py-3 sm:px-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 flex items-center space-x-1.5 w-full">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-400"
        />
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2, ease: "easeInOut" }}
          className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-400"
        />
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4, ease: "easeInOut" }}
          className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-400"
        />
      </div>
    </div>
    <div className="flex items-end mb-1.5 sm:mb-2 order-1 mr-1 sm:mr-2">
      <div className="p-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900">
        <FaRobot className="text-indigo-500 dark:text-indigo-400" size={14} />
      </div>
    </div>
  </motion.div>
));

TypingIndicator.displayName = 'TypingIndicator';

export default TypingIndicator;
