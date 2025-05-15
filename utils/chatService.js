// Serviço para gerenciar o armazenamento de chats
import AuthService from './authService';

// Cache para evitar leituras repetidas do localStorage
let chatsCache = null;
let lastUserId = null;

const ChatService = {
  // Limpar cache quando necessário
  clearCache: () => {
    chatsCache = null;
  },
  
  // Obtém todos os chats salvos com cache
  getChats: () => {
    if (typeof window === 'undefined') return [];
    
    // Se houver um usuário logado, tenta buscar chats específicos dele
    const user = AuthService.getCurrentUser();
    const userId = user?.id || 'anonymous';
    const storageKey = user?.id ? `chats_${user.id}` : 'chats';
    
    // Usar cache se disponível e o usuário não mudou
    if (chatsCache && lastUserId === userId) {
      return chatsCache;
    }
    
    // Atualizar cache
    const chats = localStorage.getItem(storageKey);
    chatsCache = chats ? JSON.parse(chats) : [];
    lastUserId = userId;
    
    return chatsCache;
  },

  // Obtém um chat específico por ID
  getChat: (id) => {
    const chats = ChatService.getChats();
    return chats.find(chat => chat.id === id) || null;
  },

  // Salva um novo chat ou atualiza um existente
  saveChat: (chat) => {
    if (!chat || !chat.id) {
      console.error('Tentativa de salvar chat inválido:', chat);
      return null;
    }
    
    const chats = ChatService.getChats();
    const existingIndex = chats.findIndex(c => c.id === chat.id);
    
    if (existingIndex >= 0) {
      console.log(`Atualizando chat existente: ${chat.id}`);
      chats[existingIndex] = chat;
    } else {
      console.log(`Adicionando novo chat: ${chat.id}, título: ${chat.title}`);
      chats.push(chat);
    }
    
    // Se houver um usuário logado, usa uma chave específica para ele
    const user = AuthService.getCurrentUser();
    const storageKey = user?.id ? `chats_${user.id}` : 'chats';
    
    // Atualizar cache
    chatsCache = chats;
    lastUserId = user?.id || 'anonymous';
    
    // Verificar se há chats duplicados (com mesmo ID)
    const uniqueIds = new Set();
    const hasDuplicates = chats.some(c => {
      if (uniqueIds.has(c.id)) {
        console.error(`Detectado chat duplicado com ID: ${c.id}`);
        return true;
      }
      uniqueIds.add(c.id);
      return false;
    });
    
    if (hasDuplicates) {
      console.warn('Removendo chats duplicados antes de salvar');
      const uniqueChats = Array.from(chats.reduce((map, chat) => map.set(chat.id, chat), new Map()).values());
      chatsCache = uniqueChats;
      
      // Usar requestAnimationFrame para operações de escrita no localStorage
      requestAnimationFrame(() => {
        localStorage.setItem(storageKey, JSON.stringify(uniqueChats));
      });
    } else {
      // Usar requestAnimationFrame para operações de escrita no localStorage
      requestAnimationFrame(() => {
        localStorage.setItem(storageKey, JSON.stringify(chats));
      });
    }
    
    return chat;
  },

  // Deleta um chat por ID
  deleteChat: (id) => {
    if (!id) {
      console.error('ID de chat não fornecido para exclusão');
      return false;
    }

    try {
      let chats = ChatService.getChats();
      const chatExistsBeforeDelete = chats.some(chat => chat.id === id);
      
      if (!chatExistsBeforeDelete) {
        console.warn(`Chat com ID ${id} não encontrado para exclusão`);
        return false;
      }
      
      chats = chats.filter(chat => chat.id !== id);
      
      // Se houver um usuário logado, usa uma chave específica para ele
      const user = AuthService.getCurrentUser();
      const storageKey = user?.id ? `chats_${user.id}` : 'chats';
      
      // Atualizar cache
      chatsCache = chats;
      
      // Usar requestAnimationFrame para operações de escrita no localStorage
      localStorage.setItem(storageKey, JSON.stringify(chats));
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir chat:', error);
      return false;
    }
  },

  // Deleta todos os chats
  deleteAllChats: () => {
    if (typeof window === 'undefined') return false;
    
    try {
      // Se houver um usuário logado, usa uma chave específica para ele
      const user = AuthService.getCurrentUser();
      const storageKey = user?.id ? `chats_${user.id}` : 'chats';
      
      // Limpar cache
      chatsCache = [];
      
      // Remover os chats do localStorage imediatamente
      localStorage.setItem(storageKey, JSON.stringify([]));
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir todos os chats:', error);
      return false;
    }
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
    // Garantir um ID único com prefixo e timestamp
    const timestamp = Date.now();
    const id = `chat_${timestamp}`;
    
    // Verificar se já existe um chat com este ID (proteção contra duplicação)
    const existingChat = ChatService.getChat(id);
    if (existingChat) {
      console.warn('Tentativa de criar chat com ID já existente, retornando o existente');
      return existingChat;
    }
    
    // Usar o título diretamente se for uma string, ou definir um padrão
    const title = typeof firstMessage === 'string' ? 
      (firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage) : 
      "Nova Conversa";
    
    // Garantir que o chat sempre tenha um array de mensagens válido
    const newChat = {
      id,
      title,
      messages: [
        { tipo: 'bot', texto: 'Olá! Como posso ajudar você hoje?' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Verificar se já existem chats com este ID antes de salvar (dupla verificação)
    const chats = ChatService.getChats();
    if (chats.some(chat => chat.id === id)) {
      console.warn('Chat com mesmo ID já existe na lista, evitando duplicação');
      return chats.find(chat => chat.id === id);
    }
    
    // Verificar se houve alguma criação recente nos últimos 2 segundos
    const recentChats = chats.filter(chat => {
      const createTime = new Date(chat.createdAt).getTime();
      return Date.now() - createTime < 2000;
    });
    
    if (recentChats.length > 0) {
      console.warn('Chat criado recentemente, evitando duplicação');
      return recentChats[0]; // Retorna o chat mais recente
    }
    
    console.log('Criando novo chat:', id, title);
    ChatService.saveChat(newChat);
    return newChat;
  },

  // Adiciona uma mensagem a um chat existente
  addMessage: (chatId, message) => {
    const chat = ChatService.getChat(chatId);
    if (!chat) return null;
    
    // Garantir que o chat tenha um array de mensagens válido
    if (!chat.messages) {
      console.warn(`Chat ${chatId} não tem array de mensagens. Inicializando array vazio.`);
      chat.messages = [];
    }
    
    chat.messages.push(message);
    // Atualizar a data de modificação do chat
    chat.updatedAt = new Date().toISOString();
    ChatService.saveChat(chat);
    return chat;
  }
};

export default ChatService;