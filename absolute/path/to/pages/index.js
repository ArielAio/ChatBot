const handleNewChat = useCallback(() => {
    if (loading) return; // Evita múltiplos cliques durante o carregamento
    
    // Adiciona um bloqueio temporário para evitar cliques duplos
    if (isCreatingChat.current) return;
    isCreatingChat.current = true;
    
    const newChat = ChatService.createNewChat();
    setChats((prevChats) => [newChat, ...prevChats]);
    setChatAtual(newChat);
    
    // Limpa o bloqueio após um curto período
    setTimeout(() => {
      isCreatingChat.current = false;
    }, 500);
    
    // Fecha a sidebar em dispositivos móveis
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [loading, isMobile]);
  const isCreatingChat = useRef(false);