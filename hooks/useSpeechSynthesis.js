import { useState, useCallback } from 'react';

const useSpeechSynthesis = () => {
  const [mute, setMute] = useState(false);
  
  const toggleMute = useCallback(() => setMute(m => !m), []);
  
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
  
  return {
    mute,
    toggleMute,
    falarResposta
  };
};

export default useSpeechSynthesis;
