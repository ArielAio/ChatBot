import { useState, useEffect, useRef, useCallback } from 'react';
import ChatService from '../utils/chatService';
import MemoryService from '../utils/memoryService';

// Hook para gerenciar as operações do chat
function useChat(falarResposta) {
  const [pergunta, setPergunta] = useState('');
  const [chatAtual, setChatAtual] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [memories, setMemories] = useState([]);
  
  // Refs para prevenir criação duplicada
  const isCreatingChat = useRef(false);
  const lastCreatedChatRef = useRef(0);
  
  // Carregar chats
  useEffect(() => {
    const savedChats = ChatService.getChats();
    setChats(savedChats);
    
    // Se há chats salvos, seleciona o mais recente
    if (savedChats.length > 0) {
      // Ordenar por data de atualização
      const sortedChats = [...savedChats].sort((a, b) => 
        new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
      );
      setChatAtual(sortedChats[0]);
    }
    
    // Carregar memórias
    const savedMemories = MemoryService.getMemories();
    setMemories(savedMemories);
  }, []);
  
  // Criar novo chat com proteção contra duplicação
  const criarNovoChat = useCallback(() => {
    // Verificar se já está criando um chat
    if (isCreatingChat.current) {
      console.log('Ignorando solicitação duplicada de criação de chat');
      return null;
    }
    
    // Verificar se um chat foi criado recentemente (menos de 2 segundos)
    const agora = Date.now();
    if (agora - lastCreatedChatRef.current < 2000) {
      console.log('Ignorando criação de chat muito próxima');
      return null;
    }
    
    // Definir flags para bloquear criações duplicadas
    isCreatingChat.current = true;
    lastCreatedChatRef.current = agora;
    
    console.log('Criando novo chat...');
    const novoChat = ChatService.createChat("Nova Conversa");
    
    // Atualizar estados
    setChatAtual(novoChat);
    setChats(prev => [novoChat, ...prev]);
    setPergunta('');
    
    // Liberar flag após um tempo
    setTimeout(() => {
      isCreatingChat.current = false;
    }, 1000);
    
    return novoChat;
  }, []);
  
  // Selecionar um chat existente
  const selecionarChat = useCallback((chat) => {
    setChatAtual(chat);
    setPergunta('');
  }, []);
  
  // Excluir um chat
  const excluirChat = useCallback((chatId) => {
    if (!chatId) {
      console.error('Tentativa de excluir chat sem fornecer ID');
      return false;
    }
    
    try {
      // Salvar referência ao chat atual antes da exclusão
      const chatAtualId = chatAtual?.id;
      
      // Executar operação de exclusão
      const chatRemovido = ChatService.deleteChat(chatId);
      
      if (!chatRemovido) {
        console.warn(`Falha ao excluir chat ${chatId}`);
        return false;
      }
      
      // Atualizar estado dos chats
      const chatsAtualizados = chats.filter(c => c.id !== chatId);
      setChats(chatsAtualizados);
      
      // Se excluiu o chat atual, selecionar outro
      if (chatAtualId === chatId) {
        if (chatsAtualizados.length > 0) {
          setChatAtual(chatsAtualizados[0]);
        } else {
          setChatAtual(null);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir chat:', error);
      return false;
    }
  }, [chats, chatAtual]);
  
  // Enviar pergunta para a API
  const enviarPergunta = useCallback(async () => {
    // Limpeza e validação básica
    if (!pergunta.trim() || loading) return;
    
    // Se não existir um chat atual, criar um novo
    if (!chatAtual) {
      const novoChatCriado = criarNovoChat();
      if (!novoChatCriado) return;
      // Pequeno delay para garantir que o chat foi criado
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    const perguntaFormatada = pergunta.trim();
    
    // Verificar se chatAtual existe e tem a propriedade messages
    if (!chatAtual || !chatAtual.messages) {
      console.error('Chat atual é nulo ou não possui mensagens');
      return;
    }
    
    // Verificar se é o primeiro mensagem do usuário para definir o título
    const isFirstUserMessage = chatAtual.messages.filter(m => m.tipo === 'usuario').length === 0;
    
    // Atualizar o chat atual com a mensagem do usuário
    const mensagemUsuario = { tipo: 'usuario', texto: perguntaFormatada };
    const chatAtualizado = { 
      ...chatAtual, 
      messages: [...chatAtual.messages, mensagemUsuario],
      // Se for a primeira mensagem, atualizar o título
      ...(isFirstUserMessage && { title: perguntaFormatada.substring(0, 30) + (perguntaFormatada.length > 30 ? '...' : '') })
    };
    
    // Salvar a atualização no localStorage e atualizar o estado
    ChatService.saveChat(chatAtualizado);
    setChatAtual(chatAtualizado);
    setChats(prev => prev.map(c => c.id === chatAtual.id ? chatAtualizado : c));
    
    // Obter memórias relevantes para a pergunta
    const memoriasRelevantes = MemoryService.getRelevantMemories(perguntaFormatada);
    console.log('Memórias relevantes para a pergunta:', memoriasRelevantes);
    
    // Limpar input e mostrar loading
    setPergunta('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pergunta: perguntaFormatada,
          memoriasRelevantes
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Erro na resposta da API:', res.status, errorData);
        throw new Error(`Erro ${res.status}: ${errorData.mensagem || 'Erro desconhecido'}`);
      }
      
      const data = await res.json();
      
      if (!data.resposta) {
        throw new Error('Resposta vazia da API');
      }
      
      // Pequeno delay para animação mais fluida
      setTimeout(() => {
        // Verificar se chatAtualizado existe e tem a propriedade messages
        if (!chatAtualizado || !chatAtualizado.messages) {
          console.error('Chat atualizado é nulo ou não possui mensagens');
          setLoading(false);
          return;
        }
        
        // Adicionar a resposta do bot ao chat atual
        const mensagemBot = { tipo: 'bot', texto: data.resposta };
        const chatComResposta = { 
          ...chatAtualizado, 
          messages: [...chatAtualizado.messages, mensagemBot] 
        };
        
        // Salvar chat atualizado
        ChatService.saveChat(chatComResposta);
        setChatAtual(chatComResposta);
        setChats(prev => prev.map(c => c.id === chatAtualizado.id ? chatComResposta : c));
        
        // Falar a resposta se áudio estiver ativado
        if (falarResposta) {
          falarResposta(data.resposta);
        }
        
        // Extrair memórias da conversa e salvar
        // Usar toda a conversa para extrair informações mais completas
        const novasMemoriasDaConversa = MemoryService.extractMemoriesFromConversation(
          chatComResposta.messages
        );
        
        console.log('Memórias extraídas da conversa:', novasMemoriasDaConversa);
        
        // Salvar memórias relevantes
        novasMemoriasDaConversa.forEach(memory => {
          MemoryService.saveMemory(memory);
        });
        
        // Atualizar o estado das memórias
        const memoriasAtualizadas = MemoryService.getMemories();
        setMemories(memoriasAtualizadas);
        console.log('Estado atual de memórias:', memoriasAtualizadas);
        
        // Finalizar estado de loading
        setLoading(false);
      }, 300);
    } catch (error) {
      console.error('Erro ao enviar pergunta:', error);
      
      // Adicionar mensagem de erro ao chat
      setTimeout(() => {
        // Verificar se chatAtual ainda existe (pode ter sido excluído enquanto carregava)
        if (!chatAtual || !chatAtual.messages) {
          console.error('Chat atual não está disponível para adicionar mensagem de erro');
          setLoading(false);
          return;
        }
        
        // Adicionar mensagem de erro do sistema
        const mensagemErro = { 
          tipo: 'bot', 
          texto: `Desculpe, ocorreu um erro: ${error.message || 'Falha na comunicação com o servidor'}. Por favor, tente novamente.` 
        };
        
        const chatComErro = { 
          ...chatAtual, 
          messages: [...chatAtual.messages, mensagemErro] 
        };
        
        // Salvar chat com mensagem de erro
        ChatService.saveChat(chatComErro);
        setChatAtual(chatComErro);
        setChats(prev => prev.map(c => c.id === chatAtual.id ? chatComErro : c));
        
        // Finalizar estado de loading
        setLoading(false);
      }, 300);
    }
  }, [pergunta, loading, chatAtual, falarResposta, criarNovoChat]);

  // Handler para envio ao pressionar Enter
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarPergunta();
    }
  }, [enviarPergunta]);

  // Adicionar um efeito para garantir que chatAtual seja válido
  useEffect(() => {
    // Se não há chats mas chatAtual ainda está definido, isso significa
    // que todos os chats foram excluídos e precisamos redefinir chatAtual
    if (chats.length === 0 && chatAtual !== null) {
      console.log('Todos os chats foram removidos, redefinindo chatAtual para null');
      setChatAtual(null);
    }
  }, [chats, chatAtual]);

  return {
    pergunta,
    setPergunta,
    chatAtual,
    chats,
    loading,
    memories,
    isCreatingChat: isCreatingChat.current,
    criarNovoChat,
    selecionarChat,
    excluirChat,
    enviarPergunta,
    handleKeyDown,
    setMemories
  };
}

export default useChat;
