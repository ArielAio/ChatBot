// Serviço para exportar e importar dados do usuário
import ChatService from './chatService';
import MemoryService from './memoryService';
import AuthService from './authService';

const DataExportService = {
  // Exporta todos os dados do usuário para um arquivo JSON
  exportUserData: () => {
    if (typeof window === 'undefined') return null;
    
    try {
      const user = AuthService.getCurrentUser();
      const userId = user?.id || 'anonymous';
      
      const userData = {
        exportDate: new Date().toISOString(),
        userId: userId,
        userInfo: user || { type: 'anonymous' },
        chats: ChatService.getChats(),
        memories: MemoryService.getMemories()
      };
      
      const dataStr = JSON.stringify(userData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      // Criar elemento para download
      const exportFileDefaultName = `chatbot_backup_${new Date().toISOString().slice(0, 10)}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      return true;
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      return false;
    }
  },
  
  // Importa dados do usuário a partir de um arquivo JSON
  importUserData: async (file) => {
    if (typeof window === 'undefined') return { success: false, message: 'Ambiente não suportado' };
    
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target.result);
            
            // Validar estrutura básica
            if (!importedData.chats || !importedData.memories) {
              reject({ success: false, message: 'Arquivo inválido: formato incorreto' });
              return;
            }
            
            // Obter usuário atual
            const currentUser = AuthService.getCurrentUser();
            const targetStorageId = currentUser?.id || 'anonymous';
            
            // Determinar as chaves de armazenamento
            const chatStorageKey = currentUser?.id ? `chats_${currentUser.id}` : 'chats';
            const memoryStorageKey = currentUser?.id ? `user_memories_${currentUser.id}` : 'user_memories';
            
            // Salvar dados importados
            localStorage.setItem(chatStorageKey, JSON.stringify(importedData.chats));
            localStorage.setItem(memoryStorageKey, JSON.stringify(importedData.memories));
            
            resolve({ 
              success: true, 
              message: 'Dados importados com sucesso', 
              stats: {
                chats: importedData.chats.length,
                memories: importedData.memories.length
              }
            });
          } catch (error) {
            reject({ success: false, message: `Erro ao processar arquivo: ${error.message}` });
          }
        };
        
        reader.onerror = () => {
          reject({ success: false, message: 'Erro ao ler o arquivo' });
        };
        
        reader.readAsText(file);
      });
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return { success: false, message: `Erro: ${error.message}` };
    }
  }
};

export default DataExportService;
