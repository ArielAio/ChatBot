import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus } from 'react-icons/fa';
import ChatItem from './ChatItem';

const Sidebar = ({
  isOpen,
  isMobile,
  toggleSidebar,
  chats,
  activeChatId,
  selecionarChat,
  excluirChat,
  criarNovoChat,
  isCreatingChat,
  loading
}) => {
  // Animações para o sidebar
  const sidebarVariants = {
    open: { 
      // Em dispositivos móveis: tela cheia com largura e altura de 100%
      ...(isMobile 
        ? { 
            width: "100%", 
            height: "100%",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 50,
          } 
        : { 
            width: "350px",
            maxWidth: "350px" 
          }
      ),
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: { 
      width: "0px",
      ...(isMobile ? { height: "0px" } : {}),
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    }
  };

  return (
    <motion.div
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      variants={sidebarVariants}
      className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden h-full sidebar-container"
    >
      <div className="flex flex-col h-full p-3 sm:p-4">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">Conversas</h2>
          <div className="flex items-center gap-2">
            {isMobile && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleSidebar}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                aria-label="Fechar menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                if (!isCreatingChat) {
                  criarNovoChat();
                } else {
                  console.log('Bloqueando clique duplicado no botão de novo chat');
                }
              }}
              disabled={isCreatingChat || loading}
              className={`p-2 rounded-full ${
                isCreatingChat || loading ? 
                'bg-blue-300 text-white cursor-not-allowed' : 
                'bg-blue-500 text-white hover:bg-blue-600'
              } transition-colors`}
              aria-label="Nova conversa"
            >
              <FaPlus size={16} />
            </motion.button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2">
          <AnimatePresence mode="popLayout">
            {chats.map(chat => (
              <ChatItem 
                key={chat.id} 
                chat={chat} 
                isActive={activeChatId === chat.id}
                onClick={() => selecionarChat(chat)}
                onDelete={excluirChat}
              />
            ))}
          </AnimatePresence>
          
          {chats.length === 0 && (
            <div className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">
              Nenhuma conversa encontrada
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
