// Serviço aprimorado para gerenciar a memória contextual do usuário
import AuthService from './authService';

// Cache para evitar leituras repetidas do localStorage
let memoriesCache = null;
let lastUserId = null;

// Valores mínimos para considerar uma memória relevante
const CONFIDENCE_THRESHOLD = 0.65; // Aumentado para exigir maior confiança
const RELEVANCE_SCORE_THRESHOLD = 0.5;

// Tópicos prioritários que sempre devem ser mantidos se disponíveis
const PRIORITY_TOPICS = ['Nome', 'Idade', 'Profissão', 'Localização', 'Preferências'];

// Estrutura para analisar relevância de tópicos em diferentes contextos
const TOPIC_RELEVANCE_MAP = {
  'Nome': 1.0,
  'Idade': 0.9,
  'Profissão': 0.9,
  'Localização': 0.8,
  'Família': 0.7,
  'Preferências': 0.8,
  'Aversões': 0.7,
  'Hobbies': 0.7,
  'Educação': 0.7,
  'Objetivos': 0.7,
  'Saúde': 0.6,
  'Evento': 0.5
};

const ImprovedMemoryService = {
  // Limpar cache quando necessário
  clearCache: () => {
    memoriesCache = null;
  },
  
  // Obtém todas as memórias salvas com cache
  getMemories: () => {
    if (typeof window === 'undefined') return [];
    
    // Se houver um usuário logado, tenta buscar memórias específicas dele
    const user = AuthService.getCurrentUser();
    const userId = user?.id || 'anonymous';
    const storageKey = user?.id ? `user_memories_${user.id}` : 'user_memories';
    
    // Usar cache se disponível e o usuário não mudou
    if (memoriesCache && lastUserId === userId) {
      return memoriesCache;
    }
    
    // Atualizar cache
    const memories = localStorage.getItem(storageKey);
    memoriesCache = memories ? JSON.parse(memories) : [];
    lastUserId = userId;
    
    return memoriesCache;
  },

  // Calcula a relevância de uma memória com base em múltiplos fatores
  calculateMemoryRelevance: (memory) => {
    // Começa com a base de relevância de acordo com o tópico
    let relevanceScore = TOPIC_RELEVANCE_MAP[memory.topic] || 0.4;
    
    // Ajustar por confiança, penaliza confiança baixa
    relevanceScore *= (memory.confidence || 0.5);
    
    // Ajustar por ocorrências (quanto mais ocorre, mais relevante)
    // Limitamos a 5 ocorrências para não sobrevalorizar
    const occurrenceFactor = Math.min(memory.occurrences || 1, 5) / 5;
    relevanceScore *= (1 + occurrenceFactor);
    
    // Ajuste pela recência (memórias mais recentes são mais relevantes)
    const ageInDays = (Date.now() - new Date(memory.lastUpdated || Date.now()).getTime()) / (1000 * 60 * 60 * 24);
    // Penaliza memórias antigas (mais de 30 dias)
    const recencyFactor = Math.max(0.5, 1 - (ageInDays / 60));
    relevanceScore *= recencyFactor;
    
    // Verificar se o conteúdo é substancial (não é muito curto)
    if (memory.data && memory.data.length < 3) {
      relevanceScore *= 0.5; // Penalizar dados muito curtos
    }
    
    // Normalizar score final entre 0 e 1
    return Math.min(Math.max(relevanceScore, 0), 1);
  },

  // Salva uma nova memória se for relevante
  saveMemory: (memory) => {
    // Verifica se a memória tem dados substantivos
    if (!memory.data || memory.data.trim().length < 2) {
      console.log('Memória rejeitada: dados insuficientes');
      return null;
    }
    
    // Verificar se já tem confiança, caso contrário atribui padrão
    const memoryWithConfidence = {
      ...memory,
      confidence: memory.confidence || 0.6
    };
    
    // Se a confiança for muito baixa, rejeita a memória
    if (memoryWithConfidence.confidence < CONFIDENCE_THRESHOLD && 
        !PRIORITY_TOPICS.includes(memoryWithConfidence.topic)) {
      console.log(`Memória rejeitada: confiança insuficiente (${memoryWithConfidence.confidence})`);
      return null;
    }
    
    const memories = ImprovedMemoryService.getMemories();
    
    // Verificar se já existe uma memória similar
    const existingIndex = memories.findIndex(m => {
      // Verifica similaridade no tópico e nos dados  
      if (m.topic !== memoryWithConfidence.topic) return false;
      
      // Para dados curtos, verificar igualdade exata
      if (m.data.length < 10 || memoryWithConfidence.data.length < 10) {
        return m.data.toLowerCase() === memoryWithConfidence.data.toLowerCase();
      }
      
      // Para dados mais longos, verificar similaridade
      const similarity = ImprovedMemoryService.calculateTextSimilarity(
        m.data.toLowerCase(), 
        memoryWithConfidence.data.toLowerCase()
      );
      
      return similarity > 0.7; // 70% de similaridade é considerado o mesmo dado
    });
    
    if (existingIndex >= 0) {
      // Atualizar a memória existente incrementando a contagem de ocorrências
      memories[existingIndex].occurrences = (memories[existingIndex].occurrences || 1) + 1;
      memories[existingIndex].lastUpdated = new Date().toISOString();
      
      // Se a nova memória tem maior confiança, atualiza
      if (memoryWithConfidence.confidence > (memories[existingIndex].confidence || 0)) {
        memories[existingIndex].confidence = memoryWithConfidence.confidence;
      }
      
      // Se a nova memória tem dados mais detalhados, atualiza
      if (memoryWithConfidence.data.length > memories[existingIndex].data.length) {
        memories[existingIndex].data = memoryWithConfidence.data;
      }
    } else {
      // Adicionar nova memória
      memories.push({
        ...memoryWithConfidence,
        id: Date.now().toString(),
        occurrences: 1,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
    }
    
    // Calcular relevância para cada memória
    const memoriesWithRelevance = memories.map(m => ({
      ...m,
      relevanceScore: ImprovedMemoryService.calculateMemoryRelevance(m)
    }));
    
    // Filtrar memórias com baixa relevância, exceto tópicos prioritários
    const filteredMemories = memoriesWithRelevance.filter(m => 
      m.relevanceScore >= RELEVANCE_SCORE_THRESHOLD || 
      PRIORITY_TOPICS.includes(m.topic)
    );
    
    // Ordenar memórias pela relevância calculada
    filteredMemories.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Limitar ao máximo de 40 memórias mais relevantes
    const trimmedMemories = filteredMemories.slice(0, 40);
    
    // Se houver um usuário logado, usa uma chave específica para ele
    const user = AuthService.getCurrentUser();
    const storageKey = user?.id ? `user_memories_${user.id}` : 'user_memories';
    
    // Limpar propriedades temporárias antes de salvar
    const cleanMemories = trimmedMemories.map(({ relevanceScore, ...rest }) => rest);
    
    // Atualizar cache
    memoriesCache = cleanMemories;
    lastUserId = user?.id || 'anonymous';
    
    // Usar requestAnimationFrame para operações de escrita no localStorage
    requestAnimationFrame(() => {
      localStorage.setItem(storageKey, JSON.stringify(cleanMemories));
    });
    
    return cleanMemories;
  },
  
  // Calcular similaridade entre dois textos (implementação simples)
  calculateTextSimilarity: (text1, text2) => {
    // Se os textos são idênticos
    if (text1 === text2) return 1.0;
    
    // Tokenização básica
    const tokens1 = text1.toLowerCase().split(/\W+/).filter(t => t.length > 2);
    const tokens2 = text2.toLowerCase().split(/\W+/).filter(t => t.length > 2);
    
    // Set de tokens únicos
    const uniqueTokens1 = new Set(tokens1);
    const uniqueTokens2 = new Set(tokens2);
    
    // Interseção
    const intersection = new Set();
    for (const token of uniqueTokens1) {
      if (uniqueTokens2.has(token)) {
        intersection.add(token);
      }
    }
    
    // Coeficiente de Jaccard: tamanho da interseção / tamanho da união
    const union = new Set([...uniqueTokens1, ...uniqueTokens2]);
    
    return intersection.size / union.size;
  },
  
  // Extrair memórias relevantes com base em uma pergunta com análise contextual
  getRelevantMemories: (query) => {
    const memories = ImprovedMemoryService.getMemories();
    if (!memories.length) return [];
    
    // Extrair termos relevantes da pergunta (palavras-chave)
    const queryTerms = query.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .split(/\s+/)
      .filter(term => term.length > 3);
    
    // Detectar tópicos possíveis na consulta
    const topicsInQuery = Object.keys(TOPIC_RELEVANCE_MAP).filter(topic => 
      query.toLowerCase().includes(topic.toLowerCase())
    );
    
    // Memórias prioritárias (fundamentais) sempre incluídas
    const priorityMemories = memories.filter(memory =>
      PRIORITY_TOPICS.includes(memory.topic)
    );
    
    // Calcular score de relevância para cada memória em relação à pergunta
    const scoredMemories = memories.map(memory => {
      let score = 0;
      const memoryText = `${memory.topic} ${memory.data}`.toLowerCase();
      
      // Pontuação por tópicos mencionados na pergunta
      if (topicsInQuery.includes(memory.topic)) {
        score += 0.5;
      }
      
      // Pontuação por termos da pergunta encontrados na memória
      const matchedTerms = queryTerms.filter(term => memoryText.includes(term));
      score += (matchedTerms.length / queryTerms.length) * 0.5;
      
      // Ajuste por confiança da memória
      score *= (memory.confidence || 0.5);
      
      return { memory, score };
    });
    
    // Filtrar memórias com score mínimo
    const relevantByQuery = scoredMemories
      .filter(item => item.score > 0.2)
      .map(item => item.memory);
    
    // Combinar e remover duplicatas
    const combined = [...priorityMemories, ...relevantByQuery];
    const uniqueMemories = Array.from(new Map(combined.map(item => [item.id, item])).values());
    
    // Ordenar por ocorrências, confiança e limitar
    return uniqueMemories
      .sort((a, b) => {
        // Ordenar primeiro por prioridade do tópico
        const priorityDiff = (TOPIC_RELEVANCE_MAP[b.topic] || 0) - (TOPIC_RELEVANCE_MAP[a.topic] || 0);
        if (priorityDiff !== 0) return priorityDiff;
        
        // Depois por ocorrências
        return b.occurrences - a.occurrences;
      })
      .slice(0, 7); // Limitamos a 7 memórias mais relevantes
  },
  
  // Excluir uma memória específica
  deleteMemory: (memoryId) => {
    if (typeof window === 'undefined') return false;
    
    let memories = ImprovedMemoryService.getMemories();
    const originalLength = memories.length;
    
    // Filtrar memórias, removendo a memória com o ID especificado
    memories = memories.filter(memory => memory.id !== memoryId);
    
    // Se não encontrou a memória para excluir, retornar falso
    if (memories.length === originalLength) return false;
    
    // Se houver um usuário logado, usa uma chave específica para ele
    const user = AuthService.getCurrentUser();
    const storageKey = user?.id ? `user_memories_${user.id}` : 'user_memories';
    
    // Atualizar cache e salvar
    memoriesCache = memories;
    
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
    
    // Limpar cache
    memoriesCache = [];
    
    // Remover as memórias do localStorage
    localStorage.removeItem(storageKey);
    return true;
  },
  
  // Formatar memórias para uso no prompt do sistema
  formatMemoriesForPrompt: (memories) => {
    if (!memories.length) return "";
    
    let memoryText = "Informações importantes sobre o usuário:\n";
    
    // Ordenar memórias por relevância do tópico para formatação
    const sortedMemories = [...memories].sort((a, b) => 
      (TOPIC_RELEVANCE_MAP[b.topic] || 0) - (TOPIC_RELEVANCE_MAP[a.topic] || 0)
    );
    
    sortedMemories.forEach(memory => {
      memoryText += `- ${memory.topic}: ${memory.data}\n`;
    });
    
    return memoryText;
  },
  
  // Extrair informações importantes de uma conversa com análise contextual melhorada
  extractMemoriesFromConversation: (messages) => {
    // Padrões mais precisos para identificar informações pessoais
    const patterns = [
      // Nome com mais padrões comuns
      { 
        regex: /(?:meu nome[é\s]+|me chamo|sou|pode me chamar de|me chame de)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
        topic: "Nome",
        confidence: 0.9
      },
      // Nome em apresentação simples
      {
        regex: /(?:^|[.!?]\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s+(?:prazer|muito prazer|é um prazer)/gi,
        topic: "Nome",
        confidence: 0.8
      },
      // Nome em resposta a pergunta direta
      { 
        regex: /(?:qual (?:é|e) (?:o seu|seu) nome\??)\s*[\r\n]+(?:meu nome[é\s]+|me chamo|sou|)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
        topic: "Nome",
        confidence: 0.9
      },
      // Preferências expressas claramente
      { 
        regex: /(?:eu )?(?:realmente |muito |adoro |amo |prefiro )(?:gosto|adoro|prefiro|amo|curto) (?:de |da |do |das |dos )?([^,.!?]+)/gi,
        topic: "Preferências",
        confidence: 0.85
      },
      // Preferências simples
      { 
        regex: /(?:eu )?(?:gosto|adoro|prefiro|amo|curto) (?:de |da |do |das |dos )?([^,.!?]+)/gi,
        topic: "Preferências",
        confidence: 0.7
      },
      // Aversões expressas claramente
      { 
        regex: /(?:eu )?(?:realmente |muito |absolutamente )(?:não gosto|odeio|detesto|evito) (?:de |da |do |das |dos )?([^,.!?]+)/gi,
        topic: "Aversões",
        confidence: 0.85
      },
      // Aversões simples
      { 
        regex: /(?:eu )?(?:não gosto|odeio|detesto|evito) (?:de |da |do |das |dos )?([^,.!?]+)/gi,
        topic: "Aversões",
        confidence: 0.7
      },
      // Família detalhada
      { 
        regex: /(?:meu|minha) (?:pai|mãe|irmão|irmã|filho|filha|esposo|esposa|marido|mulher|namorado|namorada) (?:se chama|chama-se|é) ([^,.!?]+)/gi,
        topic: "Família",
        confidence: 0.85
      },
      // Família relacionamentos
      { 
        regex: /(?:eu )?(?:tenho|possuo) (?:um|uma) (?:pai|mãe|irmão|irmã|filho|filha|esposo|esposa|marido|mulher|namorado|namorada) (?:chamad[oa] )?([^,.!?]+)/gi,
        topic: "Família",
        confidence: 0.75
      },
      // Profissão detalhada
      { 
        regex: /(?:eu )?(?:trabalho|atuo|opero) (?:como|na área de|no setor de|com|na empresa|no cargo de) ([^,.!?]+)/gi,
        topic: "Profissão",
        confidence: 0.9
      },
      // Profissão simples
      { 
        regex: /(?:eu )?(?:sou|trabalho como) ([^,.!?]+)/gi,
        topic: "Profissão",
        confidence: 0.7
      },
      // Hobbies detalhados
      { 
        regex: /(?:meu hobby|meu passatempo favorito|o que eu mais gosto de fazer|adoro|nas horas vagas eu) ([^,.!?]+)/gi,
        topic: "Hobbies",
        confidence: 0.8
      },
      // Hobbies simples
      { 
        regex: /(?:gosto de|curto|adoro) (?:praticar|fazer|jogar|assistir) ([^,.!?]+)/gi,
        topic: "Hobbies",
        confidence: 0.7
      },
      // Localização detalhada
      { 
        regex: /(?:eu )?(?:moro|vivo|resido|estou morando) (?:em|no|na|numa região de|num bairro de|numa cidade chamada) ([^,.!?]+)/gi,
        topic: "Localização",
        confidence: 0.9
      },
      // Localização simples
      { 
        regex: /(?:eu )?(?:sou de|venho de|nasci em) ([^,.!?]+)/gi,
        topic: "Localização",
        confidence: 0.7
      },
      // Idade exata
      { 
        regex: /(?:eu )?(?:tenho|possuo|estou com) (\d+)(?:\s+anos(?:\s+de\s+idade)?)?/gi,
        topic: "Idade",
        confidence: 0.95
      },
      // Educação
      { 
        regex: /(?:eu )?(?:estudei|me formei|sou formado|tenho graduação|fiz faculdade|tenho diploma) (?:em|de|na área de) ([^,.!?]+)/gi,
        topic: "Educação",
        confidence: 0.8
      },
      // Objetivos
      { 
        regex: /(?:meu objetivo|minha meta|pretendo|planejo|quero|desejo|sonho em) ([^,.!?]+)/gi,
        topic: "Objetivos",
        confidence: 0.7
      }
    ];

    // Função auxiliar aprimorada para detectar nomes próprios
    const detectarNomesProprios = (texto) => {
      // Buscar por palavras iniciadas com maiúsculas que não estejam no início de frases
      const regexNomesProprios = /(?<![.!?]\s)(?:^|[^\w])([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/g;
      const potenciaisNomes = [...texto.matchAll(regexNomesProprios)];
      
      // Lista de palavras comuns que não são nomes
      const palavrasComuns = [
        'Eu', 'Você', 'Ele', 'Ela', 'Nós', 'Eles', 'Sim', 'Não', 'Talvez', 'Olá', 'Oi',
        'Bom', 'Dia', 'Boa', 'Tarde', 'Noite', 'Como', 'Obrigado', 'Tudo', 'Bem',
        'Quando', 'Onde', 'Porque', 'Brasil', 'Internet', 'Google', 'Janeiro', 'Fevereiro',
        'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro',
        'Novembro', 'Dezembro', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta',
        'Sábado', 'Domingo'
      ];
      
      // Filtrar nomes válidos com confiança baseada em critérios
      return potenciaisNomes
        .map(match => {
          const nome = match[1];
          
          // Verificar se é uma palavra comum
          if (palavrasComuns.includes(nome)) return null;
          
          // Verificar se é longo o suficiente
          if (nome.length < 3) return null;
          
          // Verificar se contém apenas letras e espaços
          if (!/^[A-Za-z\s]+$/.test(nome)) return null;
          
          // Calcular confiança baseada em heurísticas
          let confidence = 0.5; // Base
          
          // Nomes com mais de uma palavra têm maior confiança
          if (nome.includes(' ')) confidence += 0.2;
          
          // Nomes mais longos têm maior confiança
          confidence += Math.min(0.1, (nome.length - 3) * 0.02);
          
          return { nome, confidence };
        })
        .filter(item => item !== null)
        .sort((a, b) => b.confidence - a.confidence);
    };
    
    // Analisar frequência e contexto das menções
    const analyzeNameFrequency = (userMessages) => {
      const nameCounts = {};
      
      userMessages.forEach(message => {
        const potentialNames = detectarNomesProprios(message.texto);
        
        potentialNames.forEach(({ nome }) => {
          nameCounts[nome] = (nameCounts[nome] || 0) + 1;
        });
      });
      
      // Ordenar por frequência
      return Object.entries(nameCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({
          name,
          count,
          // Maior confiança para nomes mencionados mais frequentemente
          confidence: Math.min(0.5 + (count * 0.1), 0.9)
        }));
    };
    
    const memories = [];
    
    // Extrair das mensagens do usuário (tipo 'usuario')
    const userMessages = messages.filter(msg => msg.tipo === 'usuario');
    
    // Analisar nomes próprios em todas as mensagens
    const nameFrequency = analyzeNameFrequency(userMessages);
    let nameFound = false;
    
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
              nameFound = true;
              data = data.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
            }
            
            // Para idades, verificar se está em um intervalo razoável
            if (pattern.topic === "Idade") {
              const age = parseInt(data);
              if (isNaN(age) || age < 1 || age > 120) return; // Idade inválida
            }
            
            // Evitar dados muito curtos exceto para idade
            if (data.length < 3 && pattern.topic !== "Idade") return;
            
            memories.push({
              topic: pattern.topic,
              data: data,
              confidence: pattern.confidence || 0.7
            });
          }
        });
      });
    });
    
    // Se não encontrou nome com os padrões regulares, usar análise de frequência
    if (!nameFound && nameFrequency.length > 0) {
      const mostFrequentName = nameFrequency[0];
      
      // Adicionar apenas se tiver confiança suficiente
      if (mostFrequentName.confidence >= 0.6) {
        memories.push({
          topic: "Nome",
          data: mostFrequentName.name,
          confidence: mostFrequentName.confidence
        });
      }
    }
    
    // Filtrar memórias com baixa confiança e remover duplicatas
    return memories
      .filter(memory => memory.confidence >= CONFIDENCE_THRESHOLD)
      .reduce((unique, memory) => {
        // Verificar se já existe uma memória do mesmo tópico
        const existingIndex = unique.findIndex(m => 
          m.topic === memory.topic && 
          ImprovedMemoryService.calculateTextSimilarity(m.data, memory.data) > 0.7
        );
        
        if (existingIndex >= 0) {
          // Manter a que tem maior confiança
          if (memory.confidence > unique[existingIndex].confidence) {
            unique[existingIndex] = memory;
          }
        } else {
          unique.push(memory);
        }
        
        return unique;
      }, []);
  }
};

export default ImprovedMemoryService;
