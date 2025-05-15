import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaMicrophone } from 'react-icons/fa';

const ChatInput = ({
  pergunta,
  setPergunta,
  enviarPergunta,
  handleKeyDown,
  iniciarOuPararReconhecimentoVoz,
  ouvindo,
  suportaReconhecimento,
  loading,
  isMobile
}) => {
  const inputRef = useRef(null);

  // Focar no input sempre que o componente montar ou pergunta mudar
  useEffect(() => {
    if (inputRef.current && !isMobile) {
      inputRef.current.focus();
    }
  }, [isMobile]);

  return (
    <div className="p-2 sm:p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 input-container">
      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1 sm:p-2">
        <input
          ref={inputRef}
          type="text"
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder={loading ? "Aguarde..." : "Digite sua mensagem..."}
          className="flex-1 bg-transparent border-none outline-none px-2 py-1 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 input-field"
          aria-label="Digite sua mensagem"
        />
        
        <div className="flex space-x-1 sm:space-x-2">
          {suportaReconhecimento && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={iniciarOuPararReconhecimentoVoz}
              className={`p-2 rounded-full ${
                ouvindo 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
              } transition-colors touch-target mobile-touch-feedback`}
              aria-label={ouvindo ? 'Parar gravação' : 'Iniciar gravação de voz'}
              disabled={loading}
            >
              <FaMicrophone size={18} />
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={enviarPergunta}
            disabled={!pergunta.trim() || loading}
            className={`p-2 rounded-full ${
              !pergunta.trim() || loading
                ? 'bg-blue-300 text-white cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            } transition-colors touch-target mobile-touch-feedback`}
            aria-label="Enviar mensagem"
          >
            <FaPaperPlane size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
