import { useState, useRef, useEffect, useCallback } from 'react';
import { FaMicrophone, FaVolumeMute, FaVolumeUp, FaSun, FaMoon } from 'react-icons/fa';

function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Executar apenas no cliente
    if (typeof window !== 'undefined') {
      // Verificar localStorage
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      
      // Verificar preferência do sistema
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    }
    return 'light';
  });
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Atualizar o DOM e localStorage
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);
  
  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);
  
  return [theme, toggleTheme];
}

export default function Home() {
  const [theme, toggleTheme] = useTheme();
  const [pergunta, setPergunta] = useState('');
  const [conversas, setConversas] = useState([{ tipo: 'bot', texto: 'Olá! Como posso ajudar você hoje?' }]);
  const [reconhecedor, setReconhecedor] = useState(null);
  const [ouvindo, setOuvindo] = useState(false);
  const [mute, setMute] = useState(false);
  const [loading, setLoading] = useState(false);
  const circuloRef = useRef(null);
  const endOfMessagesRef = useRef(null);

  const falarResposta = useCallback((texto) => {
    if (mute) return;
    const sintetizador = window.speechSynthesis;
    const fala = new window.SpeechSynthesisUtterance(texto);
    fala.lang = 'pt-BR';
    sintetizador.speak(fala);
  }, [mute]);

  const enviarPergunta = useCallback(async () => {
    if (!pergunta || loading) return;
    setConversas((prev) => [...prev, { tipo: 'usuario', texto: pergunta }]);
    setLoading(true);
    setPergunta('');
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta }),
      });
      const data = await res.json();
      setConversas((prev) => [...prev, { tipo: 'bot', texto: data.resposta }]);
      falarResposta(data.resposta);
    } catch {
      setConversas((prev) => [...prev, { tipo: 'bot', texto: 'Erro ao gerar resposta.' }]);
    } finally {
      setLoading(false);
    }
  }, [pergunta, falarResposta, loading]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      enviarPergunta();
    }
  }, [enviarPergunta]);

  const iniciarOuPararReconhecimentoVoz = useCallback(() => {
    if (ouvindo && reconhecedor) {
      reconhecedor.stop();
      setOuvindo(false);
      circuloRef.current?.classList.remove('ouvindo');
      return;
    }
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const reconhecimento = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      reconhecimento.lang = 'pt-BR';
      reconhecimento.interimResults = false;
      reconhecimento.maxAlternatives = 1;
      reconhecimento.onresult = (event) => {
        const resultado = event.results[0][0].transcript;
        setPergunta(resultado);
        setTimeout(() => enviarPergunta(), 100);
      };
      reconhecimento.onerror = (event) => {
        setOuvindo(false);
        circuloRef.current?.classList.remove('ouvindo');
      };
      reconhecimento.onstart = () => {
        setOuvindo(true);
        circuloRef.current?.classList.add('ouvindo');
      };
      reconhecimento.onend = () => {
        setOuvindo(false);
        circuloRef.current?.classList.remove('ouvindo');
      };
      setReconhecedor(reconhecimento);
      reconhecimento.start();
    } else {
      alert('Reconhecimento de voz não é suportado neste navegador.');
    }
  }, [ouvindo, reconhecedor, enviarPergunta]);

  const toggleMute = useCallback(() => setMute((m) => !m), []);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversas, loading]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-500 p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-xl p-6 rounded-2xl shadow-2xl flex flex-col h-full max-h-[80vh] transition-colors duration-500">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight">Chatbot</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Alternar tema"
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              {theme === 'dark' ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-700" />}
            </button>
            <button
              onClick={toggleMute}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200"
              aria-label={mute ? 'Ativar som' : 'Desativar som'}
            >
              {mute ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
            </button>
          </div>
        </div>
        {/* Janela de Chat */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-inner transition-colors duration-500">
          {conversas.map((conversa, index) => (
            <div
              key={index}
              className={`mb-2 flex ${conversa.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-3 rounded-lg max-w-[75%] text-sm shadow-md transition-all duration-300 ${conversa.tipo === 'usuario'
                  ? 'bg-blue-500 text-white rounded-br-none animate-fadeInRight'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none animate-fadeInLeft'
                  }`}
                style={{ animationDuration: '0.4s' }}
              >
                {conversa.texto}
              </div>
            </div>
          ))}
          {loading && (
            <div className="mb-2 flex justify-start">
              <div className="flex items-center space-x-2 animate-pulse">
                <span className="block w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="block w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                <span className="block w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                <span className="text-blue-500 dark:text-blue-300 font-medium ml-2">Gerando resposta...</span>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>
        <div className="flex items-center space-x-3 mt-4">
          <button
            onClick={iniciarOuPararReconhecimentoVoz}
            className={`relative p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-400 ${ouvindo ? 'ring-4 ring-green-300' : ''}`}
            disabled={loading}
            aria-label={ouvindo ? 'Parar reconhecimento de voz' : 'Iniciar reconhecimento de voz'}
          >
            <FaMicrophone size={20} />
            <div
              ref={circuloRef}
              className={`absolute inset-0 border-2 rounded-full pointer-events-none ${ouvindo ? 'border-green-300 animate-pulse' : 'border-transparent'} transition-transform duration-300`}
              style={{ transform: ouvindo ? 'scale(1.3)' : 'scale(1)' }}
            />
          </button>
          <input
            type="text"
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua pergunta..."
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 transition-colors"
            disabled={loading}
            aria-label="Campo de pergunta"
          />
          <button
            onClick={enviarPergunta}
            className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading || !pergunta}
            aria-label="Enviar pergunta"
          >
            Enviar
          </button>
        </div>
      </div>
      <footer className="mt-4 text-sm text-gray-600 dark:text-gray-300">
        <p>
          by{' '}
          <a href="https://www.linkedin.com/in/ariel-aio/" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
            @ArielAio
          </a>
        </p>
      </footer>
      <style jsx global>{`
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeInRight { animation: fadeInRight 0.4s; }
        .animate-fadeInLeft { animation: fadeInLeft 0.4s; }
      `}</style>
    </div>
  );
}
