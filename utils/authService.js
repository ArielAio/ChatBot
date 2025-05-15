// Serviço para gerenciar autenticação com Google
import { jwtDecode } from 'jwt-decode';

const AuthService = {
  // Obter usuário atual
  getCurrentUser: () => {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  // Salvar dados do usuário no localStorage
  saveUser: (userData) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user_data', JSON.stringify(userData));
    return userData;
  },

  // Processar resposta de login do Google
  processGoogleLogin: (credentialResponse) => {
    try {
      // Decodificar token JWT retornado pelo Google
      const decodedUser = jwtDecode(credentialResponse.credential);
      
      // Extrair informações relevantes
      const userData = {
        id: decodedUser.sub,
        name: decodedUser.name,
        email: decodedUser.email,
        picture: decodedUser.picture,
        firstName: decodedUser.given_name,
        lastName: decodedUser.family_name,
        loginProvider: 'google',
        loginTime: new Date().toISOString()
      };
      
      // Verificar se há dados anônimos para migrar
      AuthService.migrateAnonymousData(userData.id);
      
      // Salvar no localStorage
      AuthService.saveUser(userData);
      
      // Retornar o usuário processado
      return userData;
    } catch (error) {
      console.error('Erro ao processar login do Google:', error);
      return null;
    }
  },

  // Migrar dados anônimos para conta de usuário
  migrateAnonymousData: (userId) => {
    if (typeof window === 'undefined') return;
    
    try {
      // Verificar se já existem dados associados ao novo ID de usuário
      const userChatsExist = localStorage.getItem(`chats_${userId}`);
      const userMemoriesExist = localStorage.getItem(`user_memories_${userId}`);
      
      // Se não existem dados de usuário, migrar dados anônimos (se houver)
      if (!userChatsExist) {
        const anonChats = localStorage.getItem('chats');
        if (anonChats) {
          localStorage.setItem(`chats_${userId}`, anonChats);
          console.log('Chats anônimos migrados para a conta de usuário');
        }
      }
      
      if (!userMemoriesExist) {
        const anonMemories = localStorage.getItem('user_memories');
        if (anonMemories) {
          localStorage.setItem(`user_memories_${userId}`, anonMemories);
          console.log('Memórias anônimas migradas para a conta de usuário');
        }
      }
    } catch (error) {
      console.error('Erro ao migrar dados anônimos:', error);
    }
  },

  // Fazer logout
  logout: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user_data');
  },

  // Verificar se o usuário está logado
  isLoggedIn: () => {
    return !!AuthService.getCurrentUser();
  }
};

export default AuthService;
