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
      .slice(0, 7); // Aumentamos o limite para incluir mais contexto
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
      // Nome em apresentação simples
      {
        regex: /(?:^|[.!?]\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s+(?:prazer|muito prazer|é um prazer)/gi,
        topic: "Nome"
      },
      // Nome em resposta a pergunta direta
      { 
        regex: /(?:qual (?:é|e) (?:o seu|seu) nome\??)\s*[\r\n]+(?:meu nome[é\s]+|me chamo|sou|)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
        topic: "Nome"
      },
      // Preferências
      { 
        regex: /(?:eu )?(?:gosto|adoro|prefiro|amo|curto) (?:de )?([^,.!?]+)/gi,
        topic: "Preferências"
      },
      // Aversões
      { 
        regex: /(?:eu )?(?:não gosto|odeio|detesto|evito) (?:de )?([^,.!?]+)/gi,
        topic: "Aversões"
      },
      // Família
      { 
        regex: /(?:meu|minha) (?:pai|mãe|irmão|irmã|filho|filha|esposo|esposa|marido|mulher|namorado|namorada) (?:é|se chama|chama-se|trabalha como) ([^,.!?]+)/gi,
        topic: "Família"
      },
      // Profissão
      { 
        regex: /(?:eu )?(?:trabalho|atuo|sou) (?:como|na área de|no setor de|com)? ([^,.!?]+)/gi,
        topic: "Profissão"
      },
      // Profissão - forma alternativa
      { 
        regex: /(?:sou|trabalho como) ([^,.!?]+)/gi,
        topic: "Profissão" 
      },
      // Hobbies
      { 
        regex: /(?:meu hobby|meu passatempo|gosto de|adoro|nas horas vagas eu) ([^,.!?]+)/gi,
        topic: "Hobbies"
      },
      // Localização
      { 
        regex: /(?:eu )?(?:moro|vivo|estou morando|resido) (?:em|no|na) ([^,.!?]+)/gi,
        topic: "Localização"
      },
      // Idade
      { 
        regex: /(?:eu )?(?:tenho|possuo) (\d+)(?: anos)?/gi,
        topic: "Idade"
      }
    ];

    // Função auxiliar para detectar nomes próprios
    const detectarNomesProprios = (texto) => {
      // Buscar por palavras iniciadas com maiúsculas que não estejam no início de frases
      const regexNomesProprios = /(?<![.!?]\s)(?:^|[^\w])([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/g;
      const potenciaisNomes = [...texto.matchAll(regexNomesProprios)];
      
      // Lista de palavras comuns que não são nomes
      const palavrasComuns = ['Eu', 'Você', 'Ele', 'Ela', 'Nós', 'Eles', 'Sim', 'Não', 'Talvez', 'Olá', 'Oi'];
      
      // Filtrar nomes válidos
      return potenciaisNomes
        .map(match => match[1])
        .filter(nome => 
          // Filtrar palavras comuns e garantir que é longo o suficiente para ser um nome
          !palavrasComuns.includes(nome) && 
          nome.length >= 3 &&
          // Garantir que contenha apenas letras e espaços
          /^[A-Za-z\s]+$/.test(nome)
        );
    };
    
    const memories = [];
    
    // Extrair das mensagens do usuário (tipo 'usuario')
    const userMessages = messages.filter(msg => msg.tipo === 'usuario');
    
    userMessages.forEach(message => {
      const text = message.texto;
      
      // Aplicar cada padrão ao texto
      patterns.forEach(pattern => {
        const matches = [...text.matchAll(pattern.regex)];
        
        matches.forEach(match => {
          if (match[1] && match[1].length > 1) {
            // Limpar e formatar o dado
            let data = match[1].trim();
            
            // Tratamento especial para nomes próprios (capitalizar)
            if (pattern.topic === "Nome") {
              data = data.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
            }
            
            memories.push({
              topic: pattern.topic,
              data: data,
              confidence: 0.8 // Extração direta tem alta confiança
            });
          }
        });
      });
      
      // Buscar por possíveis nomes não capturados pelos padrões
      if (!memories.some(m => m.topic === "Nome")) {
        const nomesProprios = detectarNomesProprios(text);
        if (nomesProprios.length > 0) {
          memories.push({
            topic: "Nome",
            data: nomesProprios[0], // Escolher o primeiro nome encontrado
            confidence: 0.6 // Confiança menor para detecção indireta
          });
        }
      }
    });
    
    return memories;
  }
};

export default MemoryService;