import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { FaBrain, FaTimes } from 'react-icons/fa';
import useClickOutside from '../hooks/useClickOutside';

const MemoryPanel = ({ memories, toggleMemoryPanel, deleteMemory }) => {
  // Adicionar referência para detectar cliques fora do painel
  const panelRef = useClickOutside(() => {
    toggleMemoryPanel();
  });

  if (!memories || memories.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed top-0 right-0 h-full w-[85%] sm:w-80 bg-white dark:bg-gray-800 shadow-xl z-50 border-l border-gray-200 dark:border-gray-700 overflow-y-auto"
      >
        <div className="p-3 sm:p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
              <FaBrain className="text-purple-500 dark:text-purple-400 mr-2" size={16} />
              Memórias
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMemoryPanel}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Fechar painel de memórias"
            >
              <FaTimes className="text-gray-500 dark:text-gray-400" size={16} />
            </motion.button>
          </div>
          
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <FaBrain size={40} className="text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-sm">Nenhuma memória armazenada ainda</p>
            <p className="text-xs mt-2 text-center px-4">
              As memórias serão criadas automaticamente a partir das suas conversas.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed top-0 right-0 h-full w-[85%] sm:w-80 bg-white dark:bg-gray-800 shadow-xl z-50 border-l border-gray-200 dark:border-gray-700 overflow-y-auto"
      ref={panelRef}
    >
      <div className="p-3 sm:p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            <FaBrain className="text-purple-500 dark:text-purple-400 mr-2" size={16} />
            Memórias
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMemoryPanel}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Fechar painel de memórias"
          >
            <FaTimes className="text-gray-500 dark:text-gray-400" size={16} />
          </motion.button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3 sm:space-y-4">
            {/* Agrupar memórias por tópico */}
            {Object.entries(
              memories.reduce((acc, memory) => {
                if (!acc[memory.topic]) acc[memory.topic] = [];
                acc[memory.topic].push(memory);
                return acc;
              }, {})
            ).map(([topic, topicMemories]) => (
              <div key={topic} className="mb-3 sm:mb-4">
                <h3 className="text-sm sm:text-md font-semibold text-gray-800 dark:text-gray-200 mb-1 sm:mb-2">
                  {topic}
                </h3>
                <div className="space-y-1 sm:space-y-2">
                  {topicMemories.map(memory => (
                    <motion.div
                      key={memory.id}
                      whileHover={{ scale: 1.01 }}
                      className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs sm:text-sm"
                    >
                      <div className="text-gray-800 dark:text-gray-200 break-words text-wrap-anywhere">
                        {memory.data}
                      </div>
                      <div className="mt-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex flex-wrap justify-between">
                        <span className="mr-1">Relevância: {memory.occurrences}x</span>
                        <span>
                          {new Date(memory.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MemoryPanel;
