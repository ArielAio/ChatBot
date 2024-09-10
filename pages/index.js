import { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';

export default function Home() {
  const [pergunta, setPergunta] = useState('');
  const [conversas, setConversas] = useState([{ tipo: 'bot', texto: 'Olá! Como posso ajudar você hoje?' }]);
  const [reconhecedor, setReconhecedor] = useState(null);
  const [ouvindo, setOuvindo] = useState(false);
  const [mute, setMute] = useState(false);
  const circuloRef = useRef(null);
  const endOfMessagesRef = useRef(null);

  const falarResposta = (texto) => {
    if (mute) return;

    const sintetizador = window.speechSynthesis;
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = 'pt-BR';

    sintetizador.speak(fala);
  };

  const enviarPergunta = async () => {
    if (!pergunta) return;

    const novaConversa = [...conversas, { tipo: 'usuario', texto: pergunta }];
    setConversas(novaConversa);

    const res = await fetch('/api/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pergunta }),
    });
    const data = await res.json();

    const resposta = data.resposta;
    setConversas((prev) => [...prev, { tipo: 'bot', texto: resposta }]);
    setPergunta('');

    falarResposta(resposta);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      enviarPergunta();
    }
  };

  const iniciarOuPararReconhecimentoVoz = () => {
    if (ouvindo) {
      reconhecedor.stop();
      setOuvindo(false);
      if (circuloRef.current) {
        circuloRef.current.classList.remove('ouvindo');
      }
    } else {
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const reconhecimento = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        reconhecimento.lang = 'pt-BR';
        reconhecimento.interimResults = false;
        reconhecimento.maxAlternatives = 1;

        reconhecimento.onresult = (event) => {
          const resultado = event.results[0][0].transcript;
          setPergunta(resultado);
          enviarPergunta();
        };

        reconhecimento.onerror = (event) => {
          console.error('Erro no reconhecimento de voz:', event.error);
          setOuvindo(false);
          if (circuloRef.current) {
            circuloRef.current.classList.remove('ouvindo');
          }
        };

        reconhecimento.onstart = () => {
          setOuvindo(true);
          if (circuloRef.current) {
            circuloRef.current.classList.add('ouvindo');
          }
        };

        reconhecimento.onend = () => {
          console.log('Reconhecimento de voz finalizado');
          setOuvindo(false);
          if (circuloRef.current) {
            circuloRef.current.classList.remove('ouvindo');
          }
        };

        setReconhecedor(reconhecimento);
        reconhecimento.start();
      } else {
        alert('Reconhecimento de voz não é suportado neste navegador.');
      }
    }
  };

  const toggleMute = () => {
    setMute(!mute);
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversas]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg flex flex-col h-full max-h-[80vh]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Chatbot</h1>
          <button
            onClick={toggleMute}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            {mute ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
          </button>
        </div>

        {/* Janela de Chat */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100 rounded-lg shadow-inner">
          {conversas.map((conversa, index) => (
            <div
              key={index}
              className={`mb-2 flex ${conversa.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-3 rounded-lg max-w-[75%] text-sm ${conversa.tipo === 'usuario'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-800'
                  }`}
              >
                {conversa.texto}
              </div>
            </div>
          ))}
          <div ref={endOfMessagesRef} />
        </div>

        <div className="flex items-center space-x-3 mt-4">
          <button
            onClick={iniciarOuPararReconhecimentoVoz}
            className="relative p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors duration-200"
          >
            <FaMicrophone size={20} />
            <div
              ref={circuloRef}
              className={`absolute inset-0 border-2 rounded-full ${ouvindo ? 'border-green-300' : 'border-transparent'
                } transition-transform duration-300`}
              style={{ transform: ouvindo ? 'scale(1.3)' : 'scale(1)' }}
            />
          </button>
          <input
            type="text"
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua pergunta..."
            className="flex-1 p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={enviarPergunta}
            className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Enviar
          </button>
        </div>
      </div>

      <footer className="mt-4 text-sm text-gray-600">
        <p>
          by{' '}
          <a href="https://www.linkedin.com/in/ariel-aio/" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
            @ArielAio
          </a>{' '}
          &{' '}
          <a href="https://www.linkedin.com/in/gabriel-aguera-baria-435058295/" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
            @GabrielAguera
          </a>
        </p>
      </footer>
    </div>
  );
}
