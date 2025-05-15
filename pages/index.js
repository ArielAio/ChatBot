import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaVolumeMute, FaVolumeUp, FaSun, FaMoon, FaPaperPlane, FaRobot, FaUser, FaPlus, FaTrash, FaEdit, FaTimes, FaBrain } from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';
import ChatService from '../utils/chatService';
import MemoryService from '../utils/memoryService';
import AuthService from '../utils/authService';
import LoginScreen from '../components/LoginScreen';
import UserMenu from '../components/UserMenu';
import LoginStatus from '../components/LoginStatus';

// Hook personalizado para gerenciar o tema
function useTheme() {
  const [theme, setTheme] = useState('dark'); // Default theme without accessing localStorage yet
  const [mounted, setMounted] = useState(false);
  
  // Apenas executa após o componente montar no cliente
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }
  }, []);
  
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);
  
  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);
  
  return [theme, toggleTheme, mounted];
}

// Componente de mensagem individual otimizado com memoização
const Mensagem = React.memo(({ conversa, index }) => {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '100px' });
  
  // Mensagem vem do bot ou do usuário
  const isBot = conversa.tipo === 'bot';
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.3, delay: Math.min(index * 0.1, 0.5) }}
      className={`mb-3 sm:mb-4 flex ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      <div className={`flex w-[90%] sm:w-[85%] ${isBot ? 'order-2' : 'order-1'}`}>
        <div 
          className={`p-2.5 sm:p-3 rounded-xl text-sm sm:text-base break-words text-wrap-anywhere w-full ${
            isBot 
              ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-600 bot-message' 
              : 'bg-blue-500 text-white user-message'
          }`}
        >
          {conversa.texto}
        </div>
      </div>
      <div className={`flex items-end mb-1 sm:mb-2 ${isBot ? 'order-1 mr-1 sm:mr-2' : 'order-2 ml-1 sm:ml-2'}`}>
        {isBot ? (
          <div className="p-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900">
            <FaRobot className="text-indigo-500 dark:text-indigo-400" size={14} />
          </div>
        ) : (
          <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900">
            <FaUser className="text-blue-500 dark:text-blue-400" size={14} />
          </div>
        )}
      </div>
    </motion.div>
  );
});

Mensagem.displayName = 'Mensagem';

// Componente de indicador de digitação otimizado
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="mb-3 sm:mb-4 flex justify-start"
  >
    <div className="flex w-[90%] sm:w-[85%] order-2">
      <div className="py-2 px-3 sm:py-3 sm:px-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 flex items-center space-x-1.5 w-full">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-400"
        />
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2, ease: "easeInOut" }}
          className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-400"
        />
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4, ease: "easeInOut" }}
          className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-400"
        />
      </div>
    </div>
    <div className="flex items-end mb-1.5 sm:mb-2 order-1 mr-1 sm:mr-2">
      <div className="p-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900">
        <FaRobot className="text-indigo-500 dark:text-indigo-400" size={14} />
      </div>
    </div>
  </motion.div>
);

// Componente ChatItem (item da barra lateral)
const ChatItem = React.memo(({ chat, isActive, onClick, onDelete }) => {
  const confirmDeleteChat = (e) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir esta conversa?")) {
      onDelete(chat.id);
    }
  };
  
  // Verificando se estamos em dispositivo móvel sem usar o state global
  const isOnMobileDevice = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(chat)}
      className={`mb-2 p-2.5 sm:p-3 rounded-lg cursor-pointer transition-colors border ${
        isActive
          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 border-transparent'
      } ${isOnMobileDevice ? 'mobile-chat-item' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <p className={`font-medium text-sm sm:text-base leading-tight mb-1 text-wrap-anywhere ${isOnMobileDevice ? 'mobile-chat-title' : ''} ${
            isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'
          }`}>
            {chat.title || 'Nova conversa'}
          </p>
          <p className={`text-xs text-gray-500 dark:text-gray-400 mt-0.5 ${isOnMobileDevice ? 'mobile-chat-subtitle' : ''}`}>
            {chat.messages.length > 0 
              ? `${chat.messages.length} mensagens` 
              : 'Sem mensagens'
            }
          </p>
        </div>
        
        <button
    onClick={confirmDeleteChat}
    className={`ml-1 p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors touch-target ${isOnMobileDevice ? 'mobile-chat-delete' : ''}`}
    aria-label="Excluir conversa"
  >
    <FaTrash size={isOnMobileDevice ? 14 : 12} />
  </button>
      </div>
    </motion.div>
  );
});

ChatItem.displayName = 'ChatItem';  // Componente principal altamente otimizado
export default function Home() {
  const [theme, toggleTheme, mounted] = useTheme();
  const [pergunta, setPergunta] = useState('');
  const [chatAtual, setChatAtual] = useState(null);
  const [chats, setChats] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [reconhecedor, setReconhecedor] = useState(null);
  const [ouvindo, setOuvindo] = useState(false);
  const [mute, setMute] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);
  const [memories, setMemories] = useState([]);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const lastScrollTop = useRef(0);
  const circuloRef = useRef(null);
  const endOfMessagesRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Verificar autenticação ao carregar a página
  useEffect(() => {
    if (mounted) {
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
      setCheckingAuth(false);
    }
  }, [mounted]);

  // Função de callback para login bem-sucedido
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    
    // Se o usuário fez login com uma conta do Google, mostrar mensagem de boas-vindas
    setTimeout(() => {
      // Criar um novo chat de boas-vindas
      const newChatTitle = userData?.firstName ? `Olá, ${userData.firstName}` : "Bem-vindo";
      const newChat = ChatService.createChat(newChatTitle);
      
      // Texto de boas-vindas personalizado com base no tipo de login
      let welcomeText = '';
      
      if (userData?.name) {
        // Usuário logado com Google
        welcomeText = `Bem-vindo, ${userData.firstName || userData.name}! 👋
        
Estou muito feliz em te ver por aqui. Como posso ajudar você hoje?
        
Suas conversas e memórias estão agora associadas à sua conta Google, então você pode sincronizá-las entre dispositivos onde fizer login.`;
      } else {
        // Usuário anônimo
        welcomeText = `Bem-vindo ao ChatBot! 👋
        
Você está usando o modo anônimo. Suas conversas e memórias serão salvas apenas neste dispositivo.
        
Se quiser sincronizar seus dados entre dispositivos, você pode fazer login com o Google a qualquer momento.`;
      }
      
      // Adicionar mensagem de boas-vindas ao chat atual
      const welcomeMessage = { tipo: 'bot', texto: welcomeText };
      ChatService.addMessage(newChat.id, welcomeMessage);
      
      // Atualizar o chat atual e a lista de chats
      const updatedChat = ChatService.getChat(newChat.id);
      setChatAtual(updatedChat);
      setChats(prev => [updatedChat, ...prev.filter(c => c.id !== updatedChat.id)]);
    }, 500);
  };

  // Função para lidar com logout
  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    if (mounted && isAuthenticated) {
      const savedChats = ChatService.getChats();
      setChats(savedChats);
      
      // Carregar memórias
      const savedMemories = MemoryService.getMemories();
      
      // Se o usuário está logado com Google, adicionar o nome como memória
      if (user?.firstName && !savedMemories.some(memory => memory.topic === 'Nome')) {
        const userNameMemory = {
          topic: 'Nome',
          data: user.firstName,
          confidence: 1.0
        };
        MemoryService.saveMemory(userNameMemory);
        
        // Recarregar memórias após adicionar o nome
        const updatedMemories = MemoryService.getMemories();
        setMemories(updatedMemories);
      } else {
        setMemories(savedMemories);
      }
      
      // Se houver chats, selecionar o mais recente
      if (savedChats.length > 0) {
        const sortedChats = [...savedChats].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setChatAtual(sortedChats[0]);
      } else {
        // Caso contrário, criar um novo chat
        criarNovoChat();
      }
    }
  }, [mounted, isAuthenticated, user]);

  // Criar um novo chat
  const criarNovoChat = useCallback(() => {
    const newChat = ChatService.createChat("Nova conversa");
    setChats(prev => [newChat, ...prev]);
    setChatAtual(newChat);
    setPergunta('');
    // Foco no input
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Selecionar um chat
  const selecionarChat = useCallback((chat) => {
    setChatAtual(chat);
    setPergunta('');
    // Foco no input
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Excluir um chat
  const excluirChat = useCallback((chatId) => {
    ChatService.deleteChat(chatId);
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    
    // Se o chat atual foi excluído, selecionar outro ou criar um novo
    if (chatAtual?.id === chatId) {
      const remainingChats = chats.filter(chat => chat.id !== chatId);
      if (remainingChats.length > 0) {
        setChatAtual(remainingChats[0]);
      } else {
        criarNovoChat();
      }
    }
  }, [chatAtual, chats, criarNovoChat]);
  
  // Funções memoizadas para otimização de performance
  const falarResposta = useCallback((texto) => {
    if (mute) return;
    
    // Cancelar qualquer fala anterior
    window.speechSynthesis.cancel();
    
    const sintetizador = window.speechSynthesis;
    const fala = new window.SpeechSynthesisUtterance(texto);
    fala.lang = 'pt-BR';
    
    // Tentar encontrar uma voz em português
    const vozes = sintetizador.getVoices();
    const vozPtBr = vozes.find(voz => voz.lang.includes('pt-BR'));
    if (vozPtBr) fala.voice = vozPtBr;
    
    sintetizador.speak(fala);
  }, [mute]);

  const enviarPergunta = useCallback(async () => {
    if (!pergunta.trim() || loading || !chatAtual) return;
    
    const perguntaFormatada = pergunta.trim();
    
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
        // Adicionar a resposta do bot ao chat atual
        const mensagemBot = { tipo: 'bot', texto: data.resposta };
        const chatComResposta = { 
          ...chatAtualizado, 
          messages: [...chatAtualizado.messages, mensagemBot] 
        };
        
        // Extrair memórias da conversa e salvar
        // Usar toda a conversa para extrair informações mais completas
        const novasMemoriasDaConversa = MemoryService.extractMemoriesFromConversation(
          chatComResposta.messages
        );
        
        console.log('Memórias extraídas da conversa:', novasMemoriasDaConversa);
        
        // Salvar apenas memórias que tenham confiança adequada
        novasMemoriasDaConversa
          .filter(memory => memory.confidence >= 0.6)
          .forEach(memory => {
            MemoryService.saveMemory(memory);
          });
        
        // Atualizar o estado das memórias
        const memoriasAtualizadas = MemoryService.getMemories();
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
        const mensagemErro = { 
          tipo: 'bot', 
          texto: 'Desculpe, ocorreu um erro ao gerar a resposta. Por favor, tente novamente.' 
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
  }, [pergunta, loading, chatAtual, falarResposta]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarPergunta();
    }
  }, [enviarPergunta]);

  const iniciarOuPararReconhecimentoVoz = useCallback(() => {
    if (ouvindo && reconhecedor) {
      reconhecedor.stop();
      setOuvindo(false);
      return;
    }
    
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const reconhecimento = new SpeechRecognition();
      
      reconhecimento.lang = 'pt-BR';
      reconhecimento.interimResults = true; // Permite resultados parciais para melhor UX
      reconhecimento.continuous = false;  
      reconhecimento.maxAlternatives = 1;
      
      reconhecimento.onresult = (event) => {
        // Pegar resultado mais recente
        const ultimoResultado = event.results[event.results.length - 1];
        
        // Atualizar pergunta em tempo real com resultados parciais
        if (!ultimoResultado.isFinal) {
          setPergunta(ultimoResultado[0].transcript);
        } else {
          const resultado = ultimoResultado[0].transcript;
          setPergunta(resultado);
          // Pequeno delay para melhor UX
          setTimeout(() => enviarPergunta(), 300);
        }
      };
      
      reconhecimento.onerror = (event) => {
        console.log('Erro de reconhecimento:', event.error);
        setOuvindo(false);
      };
      
      reconhecimento.onstart = () => setOuvindo(true);
      reconhecimento.onend = () => setOuvindo(false);
      
      setReconhecedor(reconhecimento);
      reconhecimento.start();
    } else {
      alert('Reconhecimento de voz não é suportado neste navegador.');
    }
  }, [ouvindo, reconhecedor, enviarPergunta]);

  const toggleMute = useCallback(() => setMute(m => !m), []);
  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  const toggleMemoryPanel = useCallback(() => setShowMemoryPanel(prev => !prev), []);

  // Scroll suave para o final das mensagens com RAF para otimização
  useEffect(() => {
    if (endOfMessagesRef.current) {
      const scroll = () => {
        endOfMessagesRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      };
      
      // Usando requestAnimationFrame para melhor performance de animação
      requestAnimationFrame(scroll);
    }
  }, [chatAtual, loading]);

  // Detectar direção do scroll para mostrar/esconder barra de ações móvel
  useEffect(() => {
    if (!chatContainerRef.current || !mounted) return;
    
    const handleScroll = () => {
      const st = chatContainerRef.current.scrollTop;
      if (st > lastScrollTop.current && st > 150) {
        // Scroll para baixo
        setShowMobileActions(true);
      } else if (st < 100 || st < lastScrollTop.current) {
        // Scroll para cima
        setShowMobileActions(false);
      }
      lastScrollTop.current = st <= 0 ? 0 : st;
    };
    
    const chatContainer = chatContainerRef.current;
    chatContainer.addEventListener('scroll', handleScroll);
    
    return () => {
      chatContainer.removeEventListener('scroll', handleScroll);
    };
  }, [mounted, chatContainerRef]);
  
  // Verificar se o dispositivo suporta reconhecimento de voz
  const suportaReconhecimento = useMemo(() => {
    if (typeof window !== 'undefined' && mounted) {
      return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    }
    return false;
  }, [mounted]);
  
  // Implementação do gesto de swipe para dispositivos móveis
  const handleSwipeRight = useCallback(() => {
    if (!sidebarOpen) {
      setSidebarOpen(true);
    }
  }, [sidebarOpen]);

  const handleSwipeLeft = useCallback(() => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [sidebarOpen]);

  // Detectar gestos de swipe em dispositivos móveis
  useEffect(() => {
    if (!mounted) return;
    
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50;
    
    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].clientX;
      const swipeDistance = touchEndX - touchStartX;
      
      if (Math.abs(swipeDistance) > minSwipeDistance) {
        if (swipeDistance > 0) {
          // Swipe para direita
          handleSwipeRight();
        } else {
          // Swipe para esquerda
          handleSwipeLeft();
        }
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [mounted, handleSwipeRight, handleSwipeLeft]);
  
  // Função para atualizar o isMobile quando o tamanho da tela muda
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Verificar tamanho inicial
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Renderiza um placeholder durante SSR/antes da hidratação
  if (!mounted || checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Mostrar tela de login se não estiver autenticado
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Animações para elementos da interface
  const sidebarVariants = {
    open: { 
      // Em dispositivos móveis: tela cheia com largura e altura de 100%
      ...(isMobile 
        ? { 
            width: "100%", 
            height: "100%",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 50,
          } 
        : { 
            width: "350px",
            maxWidth: "350px" 
          }
      ),
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: { 
      width: "0px",
      ...(isMobile ? { height: "0px" } : {}),
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };    return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 transition-colors duration-700">
      {/* Sidebar para exibir lista de chats */}
      <motion.div 
        className={`${isMobile ? 'fixed inset-0' : 'h-full'} bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700 overflow-hidden ${isMobile ? 'z-50' : 'z-10'}`}
        animate={sidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        initial={false}
      >
        <div className="p-3 sm:p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              {isMobile && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleSidebar}
                  className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Fechar menu"
                >
                  <FaTimes size={16} className="text-gray-600 dark:text-gray-300" />
                </motion.button>
              )}
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">Conversas</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={criarNovoChat}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Nova conversa"
            >
              <FaPlus size={16} />
            </motion.button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2">
            <AnimatePresence mode="popLayout">
              {chats.map(chat => (
                <ChatItem 
                  key={chat.id} 
                  chat={chat} 
                  isActive={chatAtual?.id === chat.id}
                  onClick={() => selecionarChat(chat)}
                  onDelete={excluirChat}
                />
              ))}
            </AnimatePresence>
            
            {chats.length === 0 && (
              <div className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">
                Nenhuma conversa encontrada
              </div>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Área de deslizamento para abrir sidebar em dispositivos móveis */}
      {!sidebarOpen && (
        <div 
          className="swipe-area swipe-area-left sm:hidden touch-action-none" 
          onTouchStart={(e) => {
            const touchX = e.touches[0].clientX;
            if (touchX < 30) { // Aumentado para melhor usabilidade
              toggleSidebar();
            }
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Área principal do chat */}
      <div className="flex-1 flex flex-col h-full">
        {/* Cabeçalho com título e botões */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 sm:p-4 flex items-center justify-between shadow-sm header-container">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 sm:p-2 mr-1 sm:mr-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors header-button"
              aria-label={sidebarOpen ? "Fechar barra lateral" : "Abrir barra lateral"}
            >
              <span className="block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 mb-1.5 hamburger-line"></span>
              <span className="block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 mb-1.5 hamburger-line"></span>
              <span className="block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 hamburger-line"></span>
            </button>
            <h1 className="text-base sm:text-xl font-semibold text-gray-800 dark:text-gray-100 truncate max-w-[150px] sm:max-w-[250px] md:max-w-full header-title">
              {chatAtual?.title || "Chatbot"}
            </h1>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <UserMenu 
              user={user} 
              onLogout={handleLogout} 
            />
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMemoryPanel}
              className="p-1 sm:p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Memórias"
            >
              <FaBrain className="text-purple-500 dark:text-purple-400" size={16} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-1 sm:p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? 
                <FaSun className="text-yellow-400" size={16} /> : 
                <FaMoon className="text-gray-700" size={16} />
              }
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMute}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label={mute ? 'Ativar som' : 'Desativar som'}
            >
              {mute ? 
                <FaVolumeMute className="text-gray-600 dark:text-gray-300" size={18} /> : 
                <FaVolumeUp className="text-gray-600 dark:text-gray-300" size={18} />
              }
            </motion.button>
          </div>
        </div>
        
        {/* Mensagens da conversa */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto py-2 sm:py-4 px-2 sm:px-4 bg-gray-50 dark:bg-gray-900 transition-colors chat-container overscroll-none"
        >
          {chatAtual ? (
            <AnimatePresence mode="popLayout">
              {chatAtual.messages.map((message, index) => (
                <Mensagem 
                  key={index} 
                  conversa={message} 
                  index={index}
                />
              ))}
              
              {loading && <TypingIndicator key="typing" />}
              
              {/* Indicador de memórias ativas */}
              {!loading && memories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 sm:mt-4 mb-2 px-2 sm:px-3 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/30 rounded-lg text-xs text-purple-700 dark:text-purple-300"
                >
                  <div className="flex items-center">
                    <FaBrain className="mr-1 sm:mr-2 text-purple-500" size={12} />
                    <div className="text-xs">
                      <strong>Memórias ativas:</strong>{' '}
                      {memories.length > 0 
                        ? `${user?.firstName || memories.filter(m => m.topic === 'Nome').map(m => m.data)[0] || 'Usuário'} (${memories.length})` 
                        : 'Nenhuma memória disponível'}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Selecione ou crie uma conversa</p>
            </div>
          )}
          
          <div ref={endOfMessagesRef} className="h-4" />
        </div>
        
        {/* Área de input */}
        <div className="p-2 sm:p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 message-input">
          <div className="flex items-center gap-1 sm:gap-2 max-w-4xl mx-auto">
            {suportaReconhecimento && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={iniciarOuPararReconhecimentoVoz}
                className={`relative p-2 sm:p-3 rounded-full transition-all duration-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 touch-target ${
                  ouvindo 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700'
                }`}
                disabled={loading || !chatAtual}
                aria-label={ouvindo ? 'Parar reconhecimento de voz' : 'Iniciar reconhecimento de voz'}
              >
                <FaMicrophone className="text-white" size={16} />
                
                {ouvindo && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-red-300 pointer-events-none"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.7, 0.5, 0.7]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                  />
                )}
              </motion.button>
            )}
            
            <input
              ref={inputRef}
              type="text"
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={chatAtual ? "Digite sua pergunta..." : "Selecione ou crie uma conversa"}
              className="flex-1 py-2 px-3 sm:p-3 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 transition-colors text-wrap-anywhere"
              disabled={loading || !chatAtual}
              aria-label="Campo de pergunta"
            />
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={enviarPergunta}
              className={`p-2 sm:p-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                pergunta.trim() && !loading && chatAtual
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
              disabled={!pergunta.trim() || loading || !chatAtual}
              aria-label="Enviar pergunta"
            >
              <FaPaperPlane size={16} />
            </motion.button>
          </div>
          
          {/* Indicador de status de login */}
          <div className="flex justify-center mt-2">
            <LoginStatus user={user} className="bg-gray-100 dark:bg-gray-700" />
          </div>
        </div>
      </div>
      
      {/* Painel de Memórias */}
      <AnimatePresence>
        {showMemoryPanel && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[85%] sm:w-80 bg-white dark:bg-gray-800 shadow-xl z-50 border-l border-gray-200 dark:border-gray-700 overflow-y-auto"
          >
            <div className="p-3 sm:p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                  <FaBrain className="text-purple-500 dark:text-purple-400 mr-2" size={16} />
                  Memórias
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleMemoryPanel}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Fechar painel de memórias"
                >
                  <FaTimes className="text-gray-500 dark:text-gray-400" size={16} />
                </motion.button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {memories.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {/* Agrupar memórias por tópico */}
                    {Object.entries(
                      memories.reduce((acc, memory) => {
                        if (!acc[memory.topic]) acc[memory.topic] = [];
                        acc[memory.topic].push(memory);
                        return acc;
                      }, {})
                    ).map(([topic, topicMemories]) => (
                      <div key={topic} className="mb-3 sm:mb-4">
                        <h3 className="text-sm sm:text-md font-semibold text-gray-800 dark:text-gray-200 mb-1 sm:mb-2">
                          {topic}
                        </h3>
                        <div className="space-y-1 sm:space-y-2">
                          {topicMemories.map(memory => (
                            <motion.div
                              key={memory.id}
                              whileHover={{ scale: 1.01 }}
                              className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs sm:text-sm"
                            >
                              <div className="text-gray-800 dark:text-gray-200 break-words text-wrap-anywhere">
                                {memory.data}
                              </div>
                              <div className="mt-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex flex-wrap justify-between">
                                <span className="mr-1">Relevância: {memory.occurrences}x</span>
                                <span>
                                  {new Date(memory.lastUpdated).toLocaleDateString()}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <FaBrain size={40} className="text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-sm">Nenhuma memória armazenada ainda</p>
                    <p className="text-xs mt-2 text-center px-4">
                      As memórias serão criadas automaticamente a partir das suas conversas.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Barra de ações flutuante para dispositivos móveis */}
      <AnimatePresence>
        {showMobileActions && !sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full shadow-lg p-1 z-30 sm:hidden bottom-nav"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={criarNovoChat}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full mobile-active touch-target"
                aria-label="Nova conversa"
              >
                <FaPlus size={16} />
              </button>
              
              <button
                onClick={toggleMemoryPanel}
                className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full mobile-active touch-target"
                aria-label="Memórias"
              >
                <FaBrain size={16} />
              </button>
              
              <button
                onClick={toggleTheme}
                className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full mobile-active touch-target"
                aria-label="Alternar tema"
              >
                {theme === 'dark' ? 
                  <FaSun className="text-yellow-400" size={16} /> : 
                  <FaMoon className="text-gray-700" size={16} />
                }
              </button>
              
              {suportaReconhecimento && (
                <button
                  onClick={iniciarOuPararReconhecimentoVoz}
                  className={`p-2 rounded-full mobile-active touch-target ${
                    ouvindo 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white`}
                  aria-label={ouvindo ? 'Parar reconhecimento de voz' : 'Iniciar reconhecimento de voz'}
                >
                  <FaMicrophone size={16} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Overlay para fechar sidebar em dispositivos móveis */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>
      
      {/* Estilos globais */}
      <style jsx global>{`
        /* Scrollbar personalizada */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }
        
        .dark ::-webkit-scrollbar-thumb {
          background-color: #4b5563;
        }
        
        html, body {
          height: 100%;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
