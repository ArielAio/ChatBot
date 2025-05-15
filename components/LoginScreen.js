import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { FaRobot, FaGoogle, FaInfoCircle } from 'react-icons/fa';
import AuthService from '../utils/authService';

const LoginScreen = ({ onLoginSuccess }) => {
  const [showInfoModal, setShowInfoModal] = useState(false);

  const handleGoogleSuccess = (credentialResponse) => {
    const userData = AuthService.processGoogleLogin(credentialResponse);
    if (userData) {
      onLoginSuccess(userData);
    }
  };

  const handleGoogleError = () => {
    console.error('Login com Google falhou');
  };

  const toggleInfoModal = () => {
    setShowInfoModal(!showInfoModal);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900"
    >
      <motion.div 
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="mb-8 text-center"
      >
        <div className="mb-4 flex justify-center">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 flex items-center justify-center shadow-xl">
            <FaRobot className="text-white" size={48} />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Bem-vindo ao ChatBot</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
          Acesse com sua conta do Google para sincronizar suas conversas e memórias.
        </p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl"
      >
        <h2 className="text-xl font-semibold text-center mb-6 text-gray-800 dark:text-white">
          Entrar com
        </h2>
        
        <div className="flex justify-center mb-4">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="filled_blue"
            shape="pill"
            locale="pt-BR"
            text="continue_with"
            logo_alignment="center"
          />
        </div>
        
        <div className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400 flex items-center justify-center">
          <FaInfoCircle className="mr-2 text-blue-500" />
          <button 
            onClick={toggleInfoModal}
            className="text-blue-500 hover:underline"
          >
            Como seus dados são armazenados?
          </button>
        </div>
      </motion.div>
      
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onLoginSuccess(null)} // Permite pular o login
        className="mt-8 text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        Continuar sem login
      </motion.button>

      {/* Modal de informações sobre armazenamento de dados */}
      {showInfoModal && (
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
                onClick={toggleInfoModal}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Entendi
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default LoginScreen;
