import { useState } from 'react';

export default function Home() {
  const [pergunta, setPergunta] = useState('');
  const [conversas, setConversas] = useState([]);
  const [reconhecedor, setReconhecedor] = useState(null);

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

    setConversas((prev) => [...prev, { tipo: 'bot', texto: data.resposta }]);
    setPergunta('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      enviarPergunta();
    }
  };

  const iniciarReconhecimentoVoz = () => {
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
      };

      reconhecimento.onend = () => {
        console.log('Reconhecimento de voz finalizado');
      };

      reconhecimento.start();
      setReconhecedor(reconhecimento);
    } else {
      alert('Reconhecimento de voz não é suportado neste navegador.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-2">
      <div className="bg-white w-full max-w-md p-4 rounded-lg shadow-md flex flex-col justify-between h-full">
        <h1 className="text-xl font-bold text-center mb-2">🤖 Chatbot</h1>

        {/* Janela de Chat */}
        <div className="flex-1 overflow-y-auto mb-2 p-2 bg-gray-50 rounded-lg">
          {conversas.map((conversa, index) => (
            <div
              key={index}
              className={`mb-2 flex ${conversa.tipo === 'usuario' ? 'justify-end' : 'justify-start'
                }`}
            >
              <div
                className={`p-2 rounded-lg max-w-[80%] text-sm ${conversa.tipo === 'usuario'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-black'
                  }`}
              >
                {conversa.texto}
              </div>
            </div>
          ))}
        </div>

        {/* Campo de entrada e botões */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua pergunta..."
            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={enviarPergunta}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            Enviar
          </button>
          <button
            onClick={iniciarReconhecimentoVoz}
            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
          >
            🎙️ Falar
          </button>
        </div>
      </div>
    </div>
  );
}
