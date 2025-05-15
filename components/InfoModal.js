import React from 'react';
import { motion } from 'framer-motion';

const InfoModal = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-md w-full"
      >
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Privacidade e Armazenamento
        </h3>
        <div className="text-gray-600 dark:text-gray-300 space-y-3">
          <p>
            <strong>Dados locais:</strong> Todas as suas conversas e memórias são armazenadas 
            apenas no seu navegador utilizando o localStorage.
          </p>
          <p>
            <strong>Sem banco de dados externo:</strong> Não armazenamos seus dados em 
            servidores externos ou bancos de dados na nuvem.
          </p>
          <p>
            <strong>Autenticação Google:</strong> Usamos apenas para identificar seu 
            dispositivo. Não temos acesso à sua senha ou outros dados da sua conta Google.
          </p>
          <p>
            <strong>Sincronização:</strong> Se você entrar com o Google, seus dados serão 
            associados ao seu ID de usuário, mas ainda armazenados localmente.
          </p>
        </div>
        <div className="mt-6 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Entendi
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default React.memo(InfoModal);