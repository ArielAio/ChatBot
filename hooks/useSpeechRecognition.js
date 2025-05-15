import { useState, useEffect, useCallback } from 'react';

const useSpeechRecognition = (onFinalResult) => {
  const [ouvindo, setOuvindo] = useState(false);
  const [reconhecedor, setReconhecedor] = useState(null);
  const [tempResult, setTempResult] = useState('');
  const [suportaReconhecimento, setSuportaReconhecimento] = useState(false);
  
  // Verificar suporte ao reconhecimento de voz
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSuportaReconhecimento(
        'SpeechRecognition' in window || 
        'webkitSpeechRecognition' in window
      );
    }
  }, []);
  
  // Configurar o reconhecedor
  useEffect(() => {
    if (!suportaReconhecimento || reconhecedor) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'pt-BR';
    recognition.interimResults = true; // Permite resultados parciais para melhor UX
    recognition.continuous = false;  
    recognition.maxAlternatives = 1;
    
    recognition.onresult = (event) => {
      // Pegar resultado mais recente
      const ultimoResultado = event.results[event.results.length - 1];
      
      // Atualizar pergunta em tempo real com resultados parciais
      if (!ultimoResultado.isFinal) {
        setTempResult(ultimoResultado[0].transcript);
      } else {
        const resultado = ultimoResultado[0].transcript;
        setTempResult(resultado);
        // Pequeno delay para melhor UX
        setTimeout(() => onFinalResult(resultado), 300);
      }
    };
    
    recognition.onerror = (event) => {
      console.log('Erro de reconhecimento:', event.error);
      setOuvindo(false);
    };
    
    recognition.onstart = () => setOuvindo(true);
    recognition.onend = () => setOuvindo(false);
    
    setReconhecedor(recognition);
  }, [suportaReconhecimento, reconhecedor, onFinalResult]);
  
  // Iniciar ou parar reconhecimento
  const toggleListening = useCallback(() => {
    if (ouvindo && reconhecedor) {
      reconhecedor.stop();
      setOuvindo(false);
      return;
    }
    
    if (!ouvindo && reconhecedor) {
      try {
        reconhecedor.start();
      } catch (error) {
        console.error('Erro ao iniciar reconhecimento:', error);
        // Se ocorrer um erro (como já estar executando), reinicia
        reconhecedor.stop();
        setTimeout(() => {
          try { reconhecedor.start(); } catch (e) { console.error(e); }
        }, 200);
      }
    }
  }, [ouvindo, reconhecedor]);
  
  return {
    ouvindo,
    tempResult,
    suportaReconhecimento,
    toggleListening
  };
};

export default useSpeechRecognition;
