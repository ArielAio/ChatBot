import { useState, useRef, useCallback, useEffect } from 'react';
import ChatService from '../utils/chatService';
import ImprovedMemoryService from '../utils/improvedMemoryService';

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
  const debounceTimerRef = useRef(null);
  
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
    const savedMemories = ImprovedMemoryService.getMemories();
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
    const chatRemovido = ChatService.deleteChat(chatId);
    
    // Atualizar estado dos chats
    const chatsAtualizados = chats.filter(c => c.id !== chatId);
    setChats(chatsAtualizados);
    
    // Se excluiu o chat atual, selecionar outro
    if (chatAtual && chatAtual.id === chatId) {
      setChatAtual(chatsAtualizados.length > 0 ? chatsAtualizados[0] : null);
    }
    
    return chatRemovido;
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
    const memoriasRelevantes = ImprovedMemoryService.getRelevantMemories(perguntaFormatada);
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
          console.error('Não foi possível adicionar resposta: chat é nulo ou não possui messages');
          setLoading(false);
          return;
        }
        
        // Adicionar a resposta do bot ao chat atual
        const mensagemBot = { tipo: 'bot', texto: data.resposta };
        const chatComResposta = { 
          ...chatAtualizado, 
          messages: [...chatAtualizado.messages, mensagemBot] 
        };
        
        // Extrair memórias da conversa e salvar
        // Usar toda a conversa para extrair informações mais completas
        const novasMemoriasDaConversa = ImprovedMemoryService.extractMemoriesFromConversation(
          chatComResposta.messages
        );
        
        console.log('Memórias extraídas da conversa:', novasMemoriasDaConversa);
        
        // Salvar memórias relevantes
        novasMemoriasDaConversa.forEach(memory => {
          ImprovedMemoryService.saveMemory(memory);
        });
        
        // Atualizar o estado das memórias
        const memoriasAtualizadas = ImprovedMemoryService.getMemories();
        setMemories(memoriasAtualizadas);
        console.log('Estado atual de memórias:', memoriasAtualizadas);
        
        // Salvar no localStorage e atualizar estado
        ChatService.saveChat(chatComResposta);
        setChatAtual(chatComResposta);
        setChats(prev => prev.map(c => c.id === chatAtual.id ? chatComResposta : c));
        
        // Falar resposta e finalizar loading
        falarResposta(data.resposta);
        setLoading(false);
      }, 300);
    } catch (error) {
      console.error('Erro ao enviar pergunta:', error);
      
      // Adicionar mensagem de erro ao chat
      setTimeout(() => {
        // Mensagem de erro mais detalhada baseada no tipo de erro
        let mensagemTexto = 'Desculpe, ocorreu um erro ao gerar a resposta.';
        
        // Verificar se o erro está relacionado ao modelo
        if (error.message && error.message.includes('model')) {
          mensagemTexto = 'Desculpe, ocorreu um erro com o modelo de linguagem. Os administradores foram notificados.';
        } else if (error.message && error.message.includes('500')) {
          mensagemTexto = 'Desculpe, o servidor está enfrentando problemas temporários. Por favor, tente novamente em alguns instantes.';
        } else if (error.message && error.message.includes('404')) {
          mensagemTexto = 'Desculpe, não foi possível conectar ao serviço de IA. Verifique a configuração do chatbot.';
        }
        
        // Verificar se chatAtualizado existe e tem a propriedade messages
        if (!chatAtualizado || !chatAtualizado.messages) {
          console.error('Não foi possível adicionar mensagem de erro: chat é nulo ou não possui messages');
          setLoading(false);
          return;
        }
        
        const mensagemErro = { 
          tipo: 'bot', 
          texto: mensagemTexto
        };
        
        const chatComErro = { 
          ...chatAtualizado, 
          messages: [...chatAtualizado.messages, mensagemErro] 
        };
        
        // Salvar no localStorage e atualizar estado
        ChatService.saveChat(chatComErro);
        setChatAtual(chatComErro);
        setChats(prev => prev.map(c => c.id === chatAtual.id ? chatComErro : c));
        
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
