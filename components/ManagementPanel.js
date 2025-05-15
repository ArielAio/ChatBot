import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaTrash, FaEdit, FaSave, FaChevronLeft, FaChevronRight, FaRegSave, FaMicrochip, FaRobot, FaComments, FaBrain } from 'react-icons/fa';
import ChatService from '../utils/chatService';
import MemoryService from '../utils/memoryService';
import useClickOutside from '../hooks/useClickOutside';

const ManagementPanel = ({ onClose, user }) => {
  const [activeTab, setActiveTab] = useState('chats');
  const [chats, setChats] = useState([]);
  const [memories, setMemories] = useState([]);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  
  // Referência para fechar o painel quando clicar fora dele
  const panelRef = useClickOutside(() => {
    if (onClose) onClose(false);
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedChats = ChatService.getChats();
    const loadedMemories = MemoryService.getMemories();
    setChats(loadedChats);
    setMemories(loadedMemories);
  };

  const startEditingChat = (chat) => {
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const saveChatTitle = (chatId) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat && editingTitle.trim()) {
      chat.title = editingTitle.trim();
      ChatService.saveChat(chat);
      loadData();
      setEditingChatId(null);
    }
  };

  const cancelEditingChat = () => {
    setEditingChatId(null);
  };

  const deleteChat = (chatId) => {
    ChatService.deleteChat(chatId);
    loadData();
    setConfirmAction(null);
  };

  const deleteMemory = (memoryId) => {
    MemoryService.deleteMemory(memoryId);
    loadData();
    setConfirmAction(null);
  };

  const deleteAllChats = () => {
    ChatService.deleteAllChats();
    loadData();
    setConfirmAction(null);
  };

  const deleteAllMemories = () => {
    MemoryService.deleteAllMemories();
    loadData();
    setConfirmAction(null);
  };

  const showConfirmation = (action, itemName = null) => {
    setConfirmAction({ action, itemName });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderConfirmationDialog = () => {
    if (!confirmAction) return null;

    // Cria uma ref para a caixa de confirmação
    const confirmDialogRef = useClickOutside(() => {
      setConfirmAction(null);
    });

    let message, confirmFunc;
    const { action, itemName } = confirmAction;

    switch (action) {
      case 'deleteChat':
        message = `Tem certeza que deseja apagar a conversa "${itemName}"?`;
        confirmFunc = () => deleteChat(itemName);
        break;
      case 'deleteMemory':
        message = `Tem certeza que deseja apagar a memória "${itemName}"?`;
        confirmFunc = () => deleteMemory(itemName);
        break;
      case 'deleteAllChats':
        message = 'Tem certeza que deseja apagar TODAS as conversas? Esta ação não pode ser desfeita.';
        confirmFunc = deleteAllChats;
        break;
      case 'deleteAllMemories':
        message = 'Tem certeza que deseja apagar TODAS as memórias? Esta ação não pode ser desfeita.';
        confirmFunc = deleteAllMemories;
        break;
      default:
        return null;
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl w-[90%] max-w-sm shadow-xl mobile-modal"
          ref={confirmDialogRef}
        >
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800 dark:text-white">Confirmar ação</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">{message}</p>
          <div className="flex flex-row justify-between sm:justify-end gap-2 sm:space-x-3">
            <button
              onClick={() => setConfirmAction(null)}
              className="flex-1 sm:flex-initial px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={confirmFunc}
              className="flex-1 sm:flex-initial px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
              Apagar
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderChatsTab = () => (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
          <span className="hidden sm:inline">Gerenciar Conversas</span>
          <span className="sm:hidden">Conversas</span>
        </h2>
        <button
          onClick={() => showConfirmation('deleteAllChats')}
          className="text-sm px-2 sm:px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-1 min-w-[80px] justify-center touch-manipulation"
        >
          <FaTrash size={12} /> <span className="hidden xs:inline">Apagar todas</span><span className="xs:hidden">Limpar</span>
        </button>
      </div>
      <div className="overflow-y-auto max-h-[calc(100vh-220px)] md:max-h-[calc(100vh-250px)] max-h-[50vh] pr-2 space-y-3 pb-safe">
        {chats.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-6">
            Nenhuma conversa encontrada
          </p>
        ) : (
          chats.map((chat) => (
            <div 
              key={chat.id} 
              className="bg-white dark:bg-gray-700 rounded-lg p-2 sm:p-3 shadow-sm border border-gray-200 dark:border-gray-600"
            >
              {editingChatId === chat.id ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white w-full sm:w-auto"
                    autoFocus
                  />
                  <div className="flex space-x-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => saveChatTitle(chat.id)}
                      className="p-1 text-green-500 hover:text-green-600 flex items-center gap-1"
                      title="Salvar"
                    >
                      <FaSave size={16} /> <span className="text-xs sm:hidden">Salvar</span>
                    </button>
                    <button
                      onClick={cancelEditingChat}
                      className="p-1 text-gray-500 hover:text-gray-600 flex items-center gap-1"
                      title="Cancelar"
                    >
                      <FaTimes size={16} /> <span className="text-xs sm:hidden">Cancelar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                  <div className="flex-1 mb-2 sm:mb-0">
                    <div className="font-medium text-gray-800 dark:text-white mb-1 break-words text-sm sm:text-base">{chat.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-1">
                      <div className="flex items-center gap-1">
                        <FaComments size={10} /> {chat.messages.length} {chat.messages.length === 1 ? "msg" : "msgs"}
                      </div>
                      <span className="mx-1 hidden sm:inline">•</span>
                      <span className="text-[10px] sm:text-xs whitespace-nowrap text-ellipsis overflow-hidden">{formatDate(chat.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1 sm:gap-2 mt-1 sm:mt-0">
                    <button
                      onClick={() => startEditingChat(chat)}
                      className="p-1 text-blue-500 hover:text-blue-600 flex items-center gap-1"
                      title="Editar título"
                    >
                      <FaEdit size={16} /> <span className="text-xs sm:hidden">Editar</span>
                    </button>
                    <button
                      onClick={() => showConfirmation('deleteChat', chat.id)}
                      className="p-1 text-red-500 hover:text-red-600 flex items-center gap-1"
                      title="Apagar conversa"
                    >
                      <FaTrash size={16} /> <span className="text-xs sm:hidden">Apagar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );

  const renderMemoriesTab = () => (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
          <span className="hidden sm:inline">Gerenciar Memórias</span>
          <span className="sm:hidden">Memórias</span>
        </h2>          <button
            onClick={() => showConfirmation('deleteAllMemories')}
            className="text-sm px-2 sm:px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-1 min-w-[80px] justify-center touch-manipulation"
          >
            <FaTrash size={12} /> <span className="hidden xs:inline">Apagar todas</span><span className="xs:hidden">Limpar</span>
          </button>
      </div>
      <div className="overflow-y-auto max-h-[calc(100vh-220px)] md:max-h-[calc(100vh-250px)] max-h-[50vh] pr-2 space-y-3 pb-safe">
        {memories.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-6">
            Nenhuma memória encontrada
          </p>
        ) : (
          memories.map((memory) => (
            <div 
              key={memory.id} 
              className="bg-white dark:bg-gray-700 rounded-lg p-2 sm:p-3 shadow-sm border border-gray-200 dark:border-gray-600"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                <div className="flex-1 mb-2 sm:mb-0">
                  <div className="font-medium text-gray-800 dark:text-white mb-1 break-words text-sm sm:text-base">
                    {memory.topic}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 break-words max-h-[100px] overflow-y-auto">
                    {memory.data}
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-1">
                      <FaMicrochip size={10} /> Conf: {(memory.confidence * 100).toFixed(0)}%
                    </div>
                    <span className="mx-1 hidden sm:inline">•</span>
                    <div className="flex items-center gap-1">
                      <FaBrain size={10} /> Oco: {memory.occurrences}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-1 sm:mt-0">
                  <button
                    onClick={() => showConfirmation('deleteMemory', memory.id)}
                    className="p-1 text-red-500 hover:text-red-600 flex items-center gap-1"
                    title="Apagar memória"
                  >
                    <FaTrash size={16} /> <span className="text-xs sm:hidden">Apagar</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-1 sm:p-4"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        ref={panelRef}
      >
        <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 safe-top">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FaRobot className="text-blue-500" />
            <span className="hidden sm:inline">Gerenciador de Conteúdo</span>
            <span className="sm:hidden">Gerenciador</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Fechar"
          >
            <FaTimes size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 py-2 sm:py-3 px-3 sm:px-6 text-center font-medium text-sm sm:text-base ${
              activeTab === 'chats'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <span className="flex items-center justify-center gap-1">
              <FaComments className="block sm:hidden" size={16} />
              <span>Conversas</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('memories')}
            className={`flex-1 py-2 sm:py-3 px-3 sm:px-6 text-center font-medium text-sm sm:text-base ${
              activeTab === 'memories'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <span className="flex items-center justify-center gap-1">
              <FaBrain className="block sm:hidden" size={16} />
              <span>Memórias</span>
            </span>
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'chats' ? renderChatsTab() : renderMemoriesTab()}
        </div>

        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1">
            <span>
              {activeTab === 'chats' 
                ? `${chats.length} conversa${chats.length !== 1 ? 's' : ''}` 
                : `${memories.length} memória${memories.length !== 1 ? 's' : ''}`}
            </span>
            <span className="text-xs truncate">
              {user ? `Usuário: ${user.name || 'Conectado'}` : 'Modo local'}
            </span>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {confirmAction && renderConfirmationDialog()}
      </AnimatePresence>
    </motion.div>
  );
};

export default ManagementPanel;
