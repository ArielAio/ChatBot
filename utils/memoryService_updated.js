// Serviço para gerenciar a memória contextual do usuário
import AuthService from './authService';

const MemoryService = {
  // Obtém todas as memórias salvas
  getMemories: () => {
    if (typeof window === 'undefined') return [];
    
    // Se houver um usuário logado, tenta buscar memórias específicas dele
    const user = AuthService.getCurrentUser();
    const storageKey = user?.id ? `user_memories_${user.id}` : 'user_memories';
    
    const memories = localStorage.getItem(storageKey);
    return memories ? JSON.parse(memories) : [];
  },

  // Salva uma nova memória
  saveMemory: (memory) => {
    const memories = MemoryService.getMemories();
    
    // Log para diagnóstico
    console.log(`Tentativa de salvar memória: ${memory.topic} => ${memory.data} (confiança: ${memory.confidence})`);
    
    // Verificar se já existe uma memória similar
    const existingIndex = memories.findIndex(m => 
      m.topic === memory.topic && m.data === memory.data
    );
    
    if (existingIndex >= 0) {
      // Atualizar a memória existente incrementando a contagem de ocorrências
      memories[existingIndex].occurrences += 1;
      memories[existingIndex].lastUpdated = new Date().toISOString();
      console.log(`Memória existente atualizada: ${memory.topic} => ${memory.data} (ocorrências: ${memories[existingIndex].occurrences})`);
    } else {
      // Adicionar nova memória
      memories.push({
        ...memory,
        id: Date.now().toString(),
        occurrences: 1,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
      console.log(`Nova memória adicionada: ${memory.topic} => ${memory.data}`);
    }
    
    // Ordenar memórias pela relevância (ocorrências e data)
    memories.sort((a, b) => {
      // Primeiro por número de ocorrências
      if (b.occurrences !== a.occurrences) {
        return b.occurrences - a.occurrences;
      }
      // Depois por data da última atualização
      return new Date(b.lastUpdated) - new Date(a.lastUpdated);
    });
    
    // Limitar ao máximo de 50 memórias para não sobrecarregar
    const trimmedMemories = memories.slice(0, 50);
    
    // Se houver um usuário logado, usa uma chave específica para ele
    const user = AuthService.getCurrentUser();
    const storageKey = user?.id ? `user_memories_${user.id}` : 'user_memories';
    
    localStorage.setItem(storageKey, JSON.stringify(trimmedMemories));
    return trimmedMemories;
  },
  
  // Extrair memórias relevantes com base em uma pergunta
  getRelevantMemories: (query) => {
    const memories = MemoryService.getMemories();
    if (!memories.length) return [];
    
    // Termos extraídos da pergunta (palavras-chave)
    const queryTerms = query.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .split(/\s+/)
      .filter(term => term.length > 3);
      
    // Memórias especiais (como nome) que queremos incluir independentemente da consulta
    const fundamentalMemories = memories.filter(memory => 
      ['Nome', 'Idade', 'Profissão', 'Localização'].includes(memory.topic)
    );
    
    // Filtrar memórias relevantes baseadas nos termos da consulta
    const relevantByQuery = memories
      .filter(memory => {
        const memoryText = `${memory.topic} ${memory.data}`.toLowerCase();
        // Uma memória é relevante se contém pelo menos um dos termos da pergunta
        return queryTerms.some(term => memoryText.includes(term));
      });
    
    // Combinar e remover duplicatas
    const combined = [...fundamentalMemories, ...relevantByQuery];
    const uniqueMemories = Array.from(new Map(combined.map(item => [item.id, item])).values());
    
    // Ordenar por relevância (ocorrências e confiança) e limitar
    return uniqueMemories
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 7);  // Limitamos a 7 memórias mais relevantes
  },
  
  // Excluir uma memória específica
  deleteMemory: (memoryId) => {
    if (typeof window === 'undefined') return false;
    
    let memories = MemoryService.getMemories();
    const originalLength = memories.length;
    
    // Filtrar memórias, removendo a memória com o ID especificado
    memories = memories.filter(memory => memory.id !== memoryId);
    
    // Se não encontrou a memória para excluir, retornar falso
    if (memories.length === originalLength) return false;
    
    // Se houver um usuário logado, usa uma chave específica para ele
    const user = AuthService.getCurrentUser();
    const storageKey = user?.id ? `user_memories_${user.id}` : 'user_memories';
    
    // Salvar memórias atualizadas
    localStorage.setItem(storageKey, JSON.stringify(memories));
    return true;
  },
  
  // Excluir todas as memórias
  deleteAllMemories: () => {
    if (typeof window === 'undefined') return false;
    
    // Se houver um usuário logado, usa uma chave específica para ele
    const user = AuthService.getCurrentUser();
    const storageKey = user?.id ? `user_memories_${user.id}` : 'user_memories';
    
    // Remover as memórias do localStorage
    localStorage.removeItem(storageKey);
    return true;
  },
  
  // Formatar memórias para uso no prompt do sistema
  formatMemoriesForPrompt: (memories) => {
    if (!memories.length) return "";
    
    let memoryText = "Informações importantes sobre o usuário:\n";
    memories.forEach(memory => {
      memoryText += `- ${memory.topic}: ${memory.data}\n`;
    });
    
    return memoryText;
  },
  
  // Extrair informações importantes de uma conversa
  extractMemoriesFromConversation: (messages) => {
    // Padrões para identificar informações pessoais
    const patterns = [
      // Nome com mais padrões comuns
      { 
        regex: /(?:meu nome[é\s]+|me chamo|sou|pode me chamar de|me chame de)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
        topic: "Nome"
      },
      // Outros padrões existentes...
    ];

    // Função auxiliar para detectar nomes próprios
    const detectarNomesProprios = (texto) => {
      // Implementação existente...
    };
    
    const memories = [];
    
    // Extrair das mensagens do usuário (tipo 'usuario')
    const userMessages = messages.filter(msg => msg.tipo === 'usuario');
    
    // Lógica existente...
    
    return memories;
  }
};

export default MemoryService;
