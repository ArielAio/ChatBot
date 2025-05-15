import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle, FaSignOutAlt, FaUser, FaCog, FaDownload, FaDatabase, FaTools } from 'react-icons/fa';
import AuthService from '../utils/authService';
import DataManagement from './DataManagement';
import ManagementPanel from './ManagementPanel';

const UserMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDataManager, setShowDataManager] = useState(false);
  const [showManagementPanel, setShowManagementPanel] = useState(false);
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair? Suas conversas e memórias continuarão disponíveis neste dispositivo.')) {
      AuthService.logout();
      onLogout();
      setIsOpen(false);
    }
  };
  
  const handleDataManagerComplete = (needsRefresh) => {
    setShowDataManager(false);
    setIsOpen(false);
    
    if (needsRefresh) {
      // Recarregar a página para atualizar os dados
      window.location.reload();
    }
  };
  
  const handleManagementPanelClose = (needsRefresh) => {
    setShowManagementPanel(false);
    setIsOpen(false);
    
    if (needsRefresh) {
      // Recarregar a página para atualizar os dados
      window.location.reload();
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMenu}
        className="p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Menu do usuário"
      >
        {user?.picture ? (
          <img 
            src={user.picture} 
            alt={user.name || 'Usuário'} 
            className="h-9 w-9 rounded-full border-2 border-blue-400 dark:border-blue-500 hover:border-blue-600 transition-colors"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 flex items-center justify-center">
            <FaUserCircle className="text-white" size={20} />
          </div>
        )}
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                {user?.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.name || 'Usuário'} 
                    className="h-10 w-10 rounded-full mr-3"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 flex items-center justify-center mr-3">
                    <FaUserCircle className="text-white" size={22} />
                  </div>
                )}
                <div>
                  <div className="font-semibold text-gray-800 dark:text-white truncate">
                    {user?.name || 'Usuário Anônimo'}
                  </div>
                  {user?.email && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-2 space-y-1">
              {!user && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Não é possível redirecionar para login aqui diretamente
                    // A lógica para isso precisaria estar no componente principal
                    alert('Para usar uma conta, faça logout e entre novamente.');
                  }}
                  className="flex items-center w-full p-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <FaUser className="mr-2 text-blue-500" />
                  Entrar com conta Google
                </button>
              )}
              
              <button
                onClick={() => {
                  setShowDataManager(true);
                  setIsOpen(false);
                }}
                className="flex items-center w-full p-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <FaDatabase className="mr-2 text-blue-500" />
                Importar/Exportar Dados
              </button>
              
              <button
                onClick={() => {
                  setShowManagementPanel(true);
                  setIsOpen(false);
                }}
                className="flex items-center w-full p-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <FaTools className="mr-2 text-blue-500" />
                Gerenciar Chats e Memórias
              </button>
              
              <div className="py-1 border-t border-gray-200 dark:border-gray-700 my-1"></div>
              
              <button
                onClick={handleLogout}
                className="flex items-center w-full p-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <FaSignOutAlt className="mr-2" />
                {user ? 'Sair da conta' : 'Reiniciar aplicativo'}
              </button>
            </div>
            
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span>Usuário {user ? 'conectado' : 'não conectado'}</span>
                <span>Dados armazenados localmente</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Modal de gerenciamento de dados */}
      <AnimatePresence>
        {showDataManager && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <DataManagement onComplete={handleDataManagerComplete} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Painel de gerenciamento de chats e memórias */}
      <AnimatePresence>
        {showManagementPanel && (
          <ManagementPanel onClose={handleManagementPanelClose} user={user} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
