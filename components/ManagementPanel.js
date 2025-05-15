import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaTrash, FaEdit, FaSave, FaChevronLeft, FaChevronRight, FaRegSave, FaMicrochip, FaRobot, FaComments, FaBrain } from 'react-icons/fa';
import ChatService from '../utils/chatService';
import MemoryService from '../utils/memoryService';

const ManagementPanel = ({ onClose, user }) => {
  const [activeTab, setActiveTab] = useState('chats');
  const [chats, setChats] = useState([]);
  const [memories, setMemories] = useState([]);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

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
          className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-sm w-full shadow-xl"
        >
          <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Confirmar ação</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setConfirmAction(null)}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={confirmFunc}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
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
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Gerenciar Conversas</h2>
        <button
          onClick={() => showConfirmation('deleteAllChats')}
          className="text-sm px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-1"
        >
          <FaTrash size={12} /> Apagar todas
        </button>
      </div>
      <div className="overflow-y-auto max-h-[calc(100vh-220px)] pr-2 space-y-3">
        {chats.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-6">
            Nenhuma conversa encontrada
          </p>
        ) : (
          chats.map((chat) => (
            <div 
              key={chat.id} 
              className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-600"
            >
              {editingChatId === chat.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                    autoFocus
                  />
                  <button
                    onClick={() => saveChatTitle(chat.id)}
                    className="p-1 text-green-500 hover:text-green-600"
                    title="Salvar"
                  >
                    <FaSave size={16} />
                  </button>
                  <button
                    onClick={cancelEditingChat}
                    className="p-1 text-gray-500 hover:text-gray-600"
                    title="Cancelar"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 dark:text-white mb-1">{chat.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <div className="flex items-center gap-1">
                        <FaComments size={10} /> {chat.messages.length} mensagens
                      </div>
                      <span className="mx-1">•</span>
                      <span>{formatDate(chat.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEditingChat(chat)}
                      className="p-1 text-blue-500 hover:text-blue-600"
                      title="Editar título"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => showConfirmation('deleteChat', chat.id)}
                      className="p-1 text-red-500 hover:text-red-600"
                      title="Apagar conversa"
                    >
                      <FaTrash size={16} />
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
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Gerenciar Memórias</h2>
        <button
          onClick={() => showConfirmation('deleteAllMemories')}
          className="text-sm px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-1"
        >
          <FaTrash size={12} /> Apagar todas
        </button>
      </div>
      <div className="overflow-y-auto max-h-[calc(100vh-220px)] pr-2 space-y-3">
        {memories.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-6">
            Nenhuma memória encontrada
          </p>
        ) : (
          memories.map((memory) => (
            <div 
              key={memory.id} 
              className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-600"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-gray-800 dark:text-white mb-1">
                    {memory.topic}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {memory.data}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <FaMicrochip size={10} /> Confiança: {(memory.confidence * 100).toFixed(0)}%
                    </div>
                    <span className="mx-1">•</span>
                    <div className="flex items-center gap-1">
                      <FaBrain size={10} /> Ocorrências: {memory.occurrences}
                    </div>
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => showConfirmation('deleteMemory', memory.id)}
                    className="p-1 text-red-500 hover:text-red-600"
                    title="Apagar memória"
                  >
                    <FaTrash size={16} />
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
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FaRobot className="text-blue-500" />
            Gerenciador de Conteúdo
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            aria-label="Fechar"
          >
            <FaTimes size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 py-3 px-6 text-center font-medium ${
              activeTab === 'chats'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Conversas
          </button>
          <button
            onClick={() => setActiveTab('memories')}
            className={`flex-1 py-3 px-6 text-center font-medium ${
              activeTab === 'memories'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Memórias
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'chats' ? renderChatsTab() : renderMemoriesTab()}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex justify-between items-center">
            <span>
              {activeTab === 'chats' 
                ? `${chats.length} conversa${chats.length !== 1 ? 's' : ''}` 
                : `${memories.length} memória${memories.length !== 1 ? 's' : ''}`}
            </span>
            <span>
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
