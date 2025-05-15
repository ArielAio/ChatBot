import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaRobot, FaUser } from 'react-icons/fa';

// Componente de mensagem individual otimizado com memoização
const ChatMessage = React.memo(({ conversa, index }) => {
  const { ref, inView } = useInView({ 
    triggerOnce: true, 
    rootMargin: '100px',
    threshold: 0.1
  });
  
  const isBot = conversa.tipo === 'bot';
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.3) }}
      className={`mb-3 sm:mb-4 flex ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      <div className={`flex w-[90%] sm:w-[85%] ${isBot ? 'order-2' : 'order-1'}`}>
        <div 
          className={`p-2.5 sm:p-3 rounded-xl text-sm sm:text-base break-words text-wrap-anywhere w-full ${
            isBot 
              ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-600 bot-message' 
              : 'bg-blue-500 text-white user-message'
          }`}
        >
          {conversa.texto}
        </div>
      </div>
      <div className={`flex items-end mb-1 sm:mb-2 ${isBot ? 'order-1 mr-1 sm:mr-2' : 'order-2 ml-1 sm:ml-2'}`}>
        {isBot ? (
          <div className="p-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900">
            <FaRobot className="text-indigo-500 dark:text-indigo-400" size={14} />
          </div>
        ) : (
          <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900">
            <FaUser className="text-blue-500 dark:text-blue-400" size={14} />
          </div>
        )}
      </div>
    </motion.div>
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
