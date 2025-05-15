# Configuração de Autenticação Google

Para permitir o login com o Google em sua aplicação, você precisará configurar o Google Cloud Platform para obter um Client ID. Este guia explica como fazer isso passo a passo.

## Criando um Projeto no Google Cloud Platform

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Clique no menu suspenso de projetos no topo da página e selecione "Novo Projeto".
3. Dê um nome ao seu projeto (por exemplo, "MeuChatBot") e clique em "Criar".
4. Aguarde alguns segundos até que o projeto seja criado.

## Configurando a Tela de Consentimento OAuth

1. No menu lateral, navegue até "APIs e Serviços" > "Tela de consentimento OAuth".
2. Selecione o tipo de usuário "Externo" e clique em "Criar".
3. Preencha as informações necessárias:
   - Nome do aplicativo: "MeuChatBot" (ou o nome da sua aplicação)
   - E-mail de suporte para o usuário: seu endereço de e-mail
   - E-mail de desenvolvedor: seu endereço de e-mail
4. Clique em "Salvar e Continuar".
5. Na tela de Escopos, pode pular sem adicionar nada. Clique em "Salvar e Continuar".
6. Na tela de Usuários de teste, pode pular sem adicionar nada. Clique em "Salvar e Continuar".
7. Revise as informações e clique em "Voltar ao Painel".

## Criando Credenciais OAuth

1. No menu lateral, navegue até "APIs e Serviços" > "Credenciais".
2. Clique em "Criar Credenciais" e selecione "ID do Cliente OAuth".
3. Configure o "Tipo de Aplicação" como "Aplicativo da Web".
4. Adicione um nome para seu aplicativo, por exemplo "MeuChatBot Web Client".
5. Em "Origens JavaScript autorizadas", adicione:
   - `http://localhost:3000` (para desenvolvimento local)
   - Quando estiver em produção, adicione também o URL do seu site, como `https://seuchatbot.com.br`
6. Em "URIs de redirecionamento autorizados", adicione:
   - `http://localhost:3000` (para desenvolvimento local)
   - Quando estiver em produção, adicione também o URL do seu site, como `https://seuchatbot.com.br`
7. Clique em "Criar".
8. Seu Client ID será exibido. Copie-o para usar em sua aplicação.

## Configurando o Client ID no Aplicativo

Após obter o Client ID, você pode configurá-lo de duas maneiras:

### Opção 1: Usando variáveis de ambiente (recomendado para produção)

1. Crie um arquivo `.env.local` na raiz do projeto baseado no exemplo fornecido em `.env.local.example`:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu_client_id_aqui
```

2. Substitua `seu_client_id_aqui` pelo Client ID que você copiou.

### Opção 2: Modificando diretamente o código (apenas para desenvolvimento local)

1. Abra o arquivo `_app.js` na pasta `pages`.
2. Substitua a variável `googleClientId` pelo seu próprio Client ID:

```javascript
const googleClientId = "123456789-abcdefghijklmnopqrstuvwxyz1234567.apps.googleusercontent.com";
```

## Executando a Aplicação

Após configurar o Client ID, você pode iniciar a aplicação:

```bash
# Para desenvolvimento
bun run dev

# Para produção
bun run build
bun run start
```

## Testando a Autenticação

1. Acesse a aplicação no navegador (normalmente em `http://localhost:3000`).
2. Você deverá ver a tela de login com a opção de entrar com o Google.
3. Ao clicar, uma janela de autenticação do Google será aberta.
4. Após autenticar, você será redirecionado de volta à aplicação como um usuário autenticado.

## Resolução de Problemas

Se encontrar problemas com a autenticação, verifique:

1. **Client ID incorreto**: Certifique-se de que está usando o Client ID correto.
2. **Origens não autorizadas**: Verifique se o URL que você está usando para acessar a aplicação está na lista de origens autorizadas.
3. **Erros de CORS**: Se receber erros de CORS, verifique as origens autorizadas nas configurações do Google Cloud.
4. **Status do Projeto**: Certifique-se de que seu projeto no Google Cloud está ativo e não suspenso.

## Privacidade e Segurança

- Esta implementação armazena apenas o token de identificação do usuário localmente.
- Nenhum dado sensível é enviado para servidores externos.
- Todas as conversas e memórias são armazenadas apenas no navegador do usuário.

Para mais informações sobre as políticas de privacidade do Google, consulte [Google Cloud & Privacidade](https://cloud.google.com/security/privacy).
