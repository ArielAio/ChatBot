import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaTrash } from 'react-icons/fa';

// Componente ChatItem (item da barra lateral)
const ChatItem = React.memo(({ chat, isActive, onClick, onDelete }) => {
  const confirmDeleteChat = useCallback((e) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir esta conversa?")) {
      onDelete(chat.id);
    }
  }, [chat.id, onDelete]);
  
  const isOnMobileDevice = useMemo(() => {
    return typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(chat)}
      className={`mb-2 p-2.5 sm:p-3 rounded-lg cursor-pointer transition-colors border ${
        isActive
          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 border-transparent'
      } ${isOnMobileDevice ? 'mobile-chat-item' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <p className={`font-medium text-sm sm:text-base leading-tight mb-1 text-wrap-anywhere ${isOnMobileDevice ? 'mobile-chat-title' : ''} ${
            isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'
          }`}>
            {chat.title || 'Nova conversa'}
          </p>
          <p className={`text-xs text-gray-500 dark:text-gray-400 mt-0.5 ${isOnMobileDevice ? 'mobile-chat-subtitle' : ''}`}>
            {chat.messages.length > 0 
              ? `${chat.messages.length} mensagens` 
              : 'Sem mensagens'
            }
          </p>
        </div>
        
        <button
          onClick={confirmDeleteChat}
          className={`ml-1 p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors touch-target ${isOnMobileDevice ? 'mobile-chat-delete' : ''}`}
          aria-label="Excluir conversa"
        >
          <FaTrash size={isOnMobileDevice ? 14 : 12} />
        </button>
      </div>
    </motion.div>
  );
});

ChatItem.displayName = 'ChatItem';

export default ChatItem;
