import React from 'react';
import { AnimatePresence } from 'framer-motion';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

const ChatContainer = ({ chatAtual, loading, endOfMessagesRef, chatContainerRef }) => {
  return (
    <div 
      ref={chatContainerRef}
      className="flex-1 p-2 sm:p-4 overflow-y-auto chat-container"
    >
      {chatAtual && chatAtual.messages && chatAtual.messages.length > 0 ? (
        <>
          {chatAtual.messages.map((conversa, index) => (
            <ChatMessage 
              key={`${chatAtual.id}-${index}`} 
              conversa={conversa} 
              index={index} 
            />
          ))}
          
          <AnimatePresence>
            {loading && <TypingIndicator />}
          </AnimatePresence>
          
          <div ref={endOfMessagesRef} className="h-4" />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p className="text-lg sm:text-xl mb-2">Bem-vindo ao ChatBot</p>
          <p className="text-sm text-center max-w-md">
            Comece uma conversa digitando uma mensagem abaixo.
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
