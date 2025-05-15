# ChatBot

Um chatbot interativo que utiliza memória contextual para personalizar as respostas, construído com Next.js e integrado com a API da Maritaca AI.

## Estrutura do Projeto

```
/ChatBot
├── components/             # Componentes React reutilizáveis
├── hooks/                  # Hooks personalizados
├── pages/                  # Páginas e rotas da aplicação
│   ├── api/                # API endpoints
│   └── _app.js, index.js   # Configuração principal e página inicial
├── public/                 # Arquivos estáticos
├── scripts/                # Scripts utilitários
├── styles/                 # Estilos CSS
└── utils/                  # Serviços e funções utilitárias
```

## Principais Funcionalidades

- **Chatbot Inteligente**: Interface de chat com histórico de mensagens e memória contextual
- **Autenticação Google**: Login com Google OAuth para salvar dados entre dispositivos
- **Reconhecimento de Voz**: Entrada de perguntas por voz (onde suportado pelo navegador)
- **Síntese de Voz**: Opção de leitura das respostas em voz alta
- **Modo Escuro/Claro**: Tema adaptável às preferências do usuário
- **Design Responsivo**: Interface otimizada para dispositivos móveis e desktop
- **Memória Contextual**: O chatbot lembra informações pessoais para personalizar respostas

## Principais Componentes

- **ChatContainer**: Exibe as mensagens do chat atual
- **UserMenu**: Menu de usuário com opções de login/logout e gerenciamento de dados
- **MemoryPanel**: Painel lateral para visualizar as memórias aprendidas pelo chatbot
- **Sidebar**: Barra lateral para seleção de conversas salvas
- **DataManagement**: Interface para exportar e importar dados do usuário

## Principais Serviços

- **ChatService**: Gerencia o armazenamento e manipulação de conversas
- **MemoryService**: Gerencia a extração, armazenamento e recuperação de memórias
- **AuthService**: Gerencia a autenticação de usuários

## Hooks Personalizados

- **useChat**: Gerencia o estado e operações do chat
- **useTheme**: Gerencia o tema claro/escuro
- **useSpeechRecognition**: Gerencia o reconhecimento de voz
- **useSpeechSynthesis**: Gerencia a síntese de voz
- **useClickOutside**: Detecta cliques fora de elementos específicos

## Configuração

1. Clone o repositório
2. Instale as dependências com `npm install` ou `yarn`
3. Configure as variáveis de ambiente em `.env.local` (use `.env.local.example` como base)
4. Inicie o servidor de desenvolvimento com `npm run dev` ou `yarn dev`

## Requisitos

- Node.js 14+ 
- API key da Maritaca AI 
- Google OAuth Client ID (para funcionalidade de login)

## Licença

Projeto privado, uso não autorizado sem permissão.
