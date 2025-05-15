// Serviço para gerenciar o armazenamento de chats
import AuthService from './authService';

const ChatService = {
  // Obtém todos os chats salvos
  getChats: () => {
    if (typeof window === 'undefined') return [];
    
    // Se houver um usuário logado, tenta buscar chats específicos dele
    const user = AuthService.getCurrentUser();
    const storageKey = user?.id ? `chats_${user.id}` : 'chats';
    
    const chats = localStorage.getItem(storageKey);
    return chats ? JSON.parse(chats) : [];
  },

  // Obtém um chat específico por ID
  getChat: (id) => {
    const chats = ChatService.getChats();
    return chats.find(chat => chat.id === id) || null;
  },

  // Salva um novo chat ou atualiza um existente
  saveChat: (chat) => {
    const chats = ChatService.getChats();
    const existingIndex = chats.findIndex(c => c.id === chat.id);
    
    if (existingIndex >= 0) {
      chats[existingIndex] = chat;
    } else {
      chats.push(chat);
    }
    
    // Se houver um usuário logado, usa uma chave específica para ele
    const user = AuthService.getCurrentUser();
    const storageKey = user?.id ? `chats_${user.id}` : 'chats';
    
    localStorage.setItem(storageKey, JSON.stringify(chats));
    return chat;
  },

  // Deleta um chat por ID
  deleteChat: (id) => {
    let chats = ChatService.getChats();
    chats = chats.filter(chat => chat.id !== id);
    
    // Se houver um usuário logado, usa uma chave específica para ele
    const user = AuthService.getCurrentUser();
    const storageKey = user?.id ? `chats_${user.id}` : 'chats';
    
    localStorage.setItem(storageKey, JSON.stringify(chats));
    return true;
  },

  // Deleta todos os chats
  deleteAllChats: () => {
    if (typeof window === 'undefined') return false;
    
    // Se houver um usuário logado, usa uma chave específica para ele
    const user = AuthService.getCurrentUser();
    const storageKey = user?.id ? `chats_${user.id}` : 'chats';
    
    // Remover os chats do localStorage
    localStorage.removeItem(storageKey);
    return true;
  },

  // Atualiza o título de um chat
  updateChatTitle: (chatId, newTitle) => {
    const chat = ChatService.getChat(chatId);
    if (!chat) return null;
    
    chat.title = newTitle.trim();
    ChatService.saveChat(chat);
    return chat;
  },

  // Cria um novo chat
  createChat: (firstMessage = "Nova Conversa") => {
    const id = Date.now().toString();
    
    // Usar o título diretamente se for uma string, ou definir um padrão
    const title = typeof firstMessage === 'string' ? 
      (firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage) : 
      "Nova Conversa";
    
    const newChat = {
      id,
      title,
      messages: [
        { tipo: 'bot', texto: 'Olá! Como posso ajudar você hoje?' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    ChatService.saveChat(newChat);
    return newChat;
  },

  // Adiciona uma mensagem a um chat existente
  addMessage: (chatId, message) => {
    const chat = ChatService.getChat(chatId);
    if (!chat) return null;
    
    chat.messages.push(message);
    // Atualizar a data de modificação do chat
    chat.updatedAt = new Date().toISOString();
    ChatService.saveChat(chat);
    return chat;
  }
};

export default ChatService;