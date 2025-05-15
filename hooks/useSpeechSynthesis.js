import { useState, useCallback, useEffect } from 'react';

const useSpeechSynthesis = () => {
  const [mute, setMute] = useState(false);
  
  // Modificação: Cancelar qualquer síntese de voz em andamento ao ativar o mute
  const toggleMute = useCallback(() => {
    // Inverte o estado atual
    setMute(estadoAtual => {
      const novoEstado = !estadoAtual;
      
      // Se estiver silenciando (mudando para mute=true), cancela qualquer fala em andamento
      if (novoEstado && window && 'speechSynthesis' in window) {
        console.log('Cancelando síntese de voz devido ao mute');
        window.speechSynthesis.cancel();
      }
      
      return novoEstado;
    });
  }, []);
  
  const falarResposta = useCallback((texto) => {
    if (mute || typeof window === 'undefined' || !texto) return;
    
    try {
      // Cancelar qualquer síntese anterior
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        // Criar nova fala
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(texto);
        
        // Configurar voz em português, se disponível
        const voices = synth.getVoices();
        const ptVoice = voices.find(voice => 
          voice.lang.includes('pt') || voice.name.includes('Portuguese')
        );
        
        if (ptVoice) {
          utterance.voice = ptVoice;
        }
        
        utterance.lang = 'pt-BR';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        synth.speak(utterance);
      }
    } catch (error) {
      console.error('Erro ao sintetizar fala:', error);
    }
  }, [mute]);
  
  // Monitorar mudanças no estado de mute
  useEffect(() => {
    if (mute && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Cancelar imediatamente qualquer síntese de voz em andamento
      window.speechSynthesis.cancel();
      console.log('Síntese de voz cancelada devido a mudança no estado de mute');
    }
  }, [mute]);
  
  return {
    mute,
    toggleMute,
    falarResposta
  };
};

export default useSpeechSynthesis;
