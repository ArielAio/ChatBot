import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaPlus, FaBrain } from 'react-icons/fa';

// Custom Hooks
import useTheme from '../hooks/useTheme';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import useChat from '../hooks/useChat';

// Componentes
import ChatContainer from '../components/ChatContainer';
import ChatInput from '../components/ChatInput';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import MemoryPanel from '../components/MemoryPanel';

// Serviços
import AuthService from '../utils/authService';
import ImprovedMemoryService from '../utils/improvedMemoryService';

// Carregamento preguiçoso de componentes
const LoginScreen = lazy(() => import('../components/LoginScreen'));
const UserMenu = lazy(() => import('../components/UserMenu'));

// Componente principal
export default function Home() {
  // Estado e hooks personalizados
  const [theme, toggleTheme, mounted] = useTheme();
  const { mute, toggleMute, falarResposta } = useSpeechSynthesis();
  const {
    pergunta,
    setPergunta,
    chatAtual,
    chats,
    loading,
    memories,
    isCreatingChat,
    criarNovoChat,
    selecionarChat,
    excluirChat,
    enviarPergunta,
    handleKeyDown
  } = useChat(falarResposta);
  
  // Estado para UI
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Refs
  const lastScrollTop = useRef(0);
  const endOfMessagesRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  // Reconhecimento de voz
  const onFinalSpeechResult = useCallback((result) => {
    setPergunta(result);
    setTimeout(() => enviarPergunta(), 300);
  }, [setPergunta, enviarPergunta]);
  
  const { 
    ouvindo, 
    suportaReconhecimento, 
    toggleListening: iniciarOuPararReconhecimentoVoz 
  } = useSpeechRecognition(onFinalSpeechResult);
  
  // Toggles
  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  const toggleMemoryPanel = useCallback(() => setShowMemoryPanel(prev => !prev), []);
  
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
    
    // Verificar se já existem chats para não criar um novo desnecessariamente
    const existingChats = chats;
    if (existingChats.length > 0) {
      console.log('Chats existentes encontrados após login, não criando chat de boas-vindas');
      return;
    }
    
    // Se o usuário fez login com uma conta do Google, mostrar mensagem de boas-vindas
    setTimeout(() => {
      // Criar um novo chat de boas-vindas
      const newChatTitle = userData?.firstName ? `Olá, ${userData.firstName}` : "Bem-vindo";
      
      const newChat = criarNovoChat();
      
      if (!newChat) {
        console.error('Erro ao criar chat de boas-vindas');
        return;
      }
      
      console.log('Chat de boas-vindas criado após login:', newChat.id);
    }, 500);
  };

  // Função para lidar com logout
  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  // Scroll suave para o final das mensagens
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
  
  // Detectar gestos de swipe em dispositivos móveis
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
    return (
      <Suspense fallback={<div className="flex items-center justify-center h-screen">Carregando...</div>}>
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </Suspense>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        isMobile={isMobile}
        toggleSidebar={toggleSidebar}
        chats={chats}
        activeChatId={chatAtual?.id}
        selecionarChat={selecionarChat}
        excluirChat={excluirChat}
        criarNovoChat={criarNovoChat}
        isCreatingChat={isCreatingChat}
        loading={loading}
      />
      
      {/* Área de deslizamento para abrir sidebar em dispositivos móveis */}
      {!sidebarOpen && (
        <div 
          className="swipe-area swipe-area-left sm:hidden touch-action-none" 
          onTouchStart={(e) => {
            const touchX = e.touches[0].clientX;
            if (touchX < 30) {
              toggleSidebar();
            }
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Área principal do chat */}
      <div className="flex-1 flex flex-col h-full">
        {/* Cabeçalho */}
        <Header 
          toggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
          chatTitle={chatAtual?.title}
          user={user}
          onLogout={handleLogout}
          toggleMemoryPanel={toggleMemoryPanel}
          toggleTheme={toggleTheme}
          theme={theme}
          toggleMute={toggleMute}
          mute={mute}
        />
        
        {/* Container de mensagens */}
        <ChatContainer 
          chatAtual={chatAtual}
          loading={loading}
          endOfMessagesRef={endOfMessagesRef}
          chatContainerRef={chatContainerRef}
        />
        
        {/* Input para mensagens */}
        <ChatInput 
          pergunta={pergunta}
          setPergunta={setPergunta}
          enviarPergunta={enviarPergunta}
          handleKeyDown={handleKeyDown}
          iniciarOuPararReconhecimentoVoz={iniciarOuPararReconhecimentoVoz}
          ouvindo={ouvindo}
          suportaReconhecimento={suportaReconhecimento}
          loading={loading}
          isMobile={isMobile}
        />
      </div>
      
      {/* Painel de memórias */}
      <AnimatePresence>
        {showMemoryPanel && (
          <MemoryPanel 
            memories={memories}
            toggleMemoryPanel={toggleMemoryPanel}
          />
        )}
      </AnimatePresence>
      
      {/* Barra de ações flutuante para dispositivos móveis */}
      <AnimatePresence>
        {showMobileActions && !sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full shadow-lg p-1.5 z-30 sm:hidden bottom-nav"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (!isCreatingChat) {
                    criarNovoChat();
                  } else {
                    console.log('Bloqueando clique duplicado no botão móvel de novo chat');
                  }
                }}
                disabled={isCreatingChat || loading}
                className={`p-3 ${
                  isCreatingChat || loading ? 
                  'bg-blue-400 opacity-70 cursor-not-allowed' : 
                  'bg-blue-500 hover:bg-blue-600'
                } text-white rounded-full mobile-active touch-target mobile-touch-feedback`}
                aria-label="Nova conversa"
              >
                <FaPlus size={18} />
              </button>
              
              <button
                onClick={toggleMemoryPanel}
                className="p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full mobile-active touch-target mobile-touch-feedback"
                aria-label="Memórias"
              >
                <FaBrain size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}