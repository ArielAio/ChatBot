import openai from 'openai';
import { encode } from 'gpt-3-encoder';

/**
 * Configuração da API client
 */
const client = new openai.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://chat.maritaca.ai/api",
});

/**
 * Conta tokens em um texto usando o encoder apropriado.
 * @param {string} texto - Texto para contar tokens
 * @returns {number} - Número de tokens
 */
const contarTokens = texto => encode(texto).length;

/**
 * Consulta a API de Language Model para obter uma resposta
 * @param {string} pergunta - Pergunta do usuário
 * @param {Array} memoriasRelevantes - Memórias relevantes do usuário
 * @returns {Promise<string>} - Resposta do modelo
 */
const consultarAPI = async (pergunta, memoriasRelevantes = []) => {
    try {
        // Contexto adicional baseado nas memórias do usuário
        let contextoMemoria = "";
        let nomeUsuario = null;
        
        if (memoriasRelevantes && memoriasRelevantes.length > 0) {
            contextoMemoria = "Informações importantes sobre o usuário:\n";
            
            // Verificar se há uma memória de nome
            const memoriaDeNome = memoriasRelevantes.find(m => m.topic === 'Nome');
            if (memoriaDeNome) {
                nomeUsuario = memoriaDeNome.data;
            }
            
            memoriasRelevantes.forEach(memoria => {
                contextoMemoria += `- ${memoria.topic}: ${memoria.data}\n`;
            });
            
            if (nomeUsuario) {
                contextoMemoria += `\nO nome do usuário é ${nomeUsuario}. Ocasionalmente, use o nome do usuário para tornar a conversa mais pessoal e acolhedora.`;
            } else {
                contextoMemoria += "\nUtilize essas informações para personalizar sua resposta de forma natural e sutil.";
            }
            
            // Log para depuração
            console.log("Usando memórias na API:", memoriasRelevantes);
        }

        const promptSistema = `Responda de forma clara e completa, não ultrapassando 1000 tokens.
${contextoMemoria}`;

        const response = await client.chat.completions.create({
            model: 'sabia-3.1',
            messages: [
                { role: 'system', content: promptSistema },
                { role: 'user', content: pergunta },
            ],
            temperature: 0.1,
            max_tokens: 1000,
            stop: ['\n\n'],
        });
        
        if (!response.choices || !response.choices[0]?.message?.content) {
            throw new Error('Resposta da API inválida ou vazia');
        }

        return response.choices[0].message.content;
    } catch (error) {
        console.error("Erro na chamada à API:", error);
        throw error;
    }
};

export default async function handler(req, res) {
    // Implementar CORS para permitir chamadas de outros domínios
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Lidar com requisições OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ mensagem: 'Método não permitido.' });
    }
    
    try {
        const { pergunta, memoriasRelevantes } = req.body;
        
        if (!pergunta || typeof pergunta !== 'string') {
            return res.status(400).json({ mensagem: 'Pergunta não fornecida ou inválida.' });
        }
        
        const perguntaTrimmed = pergunta.trim();
        if (perguntaTrimmed.length === 0) {
            return res.status(400).json({ mensagem: 'Pergunta vazia.' });
        }
        
        if (contarTokens(perguntaTrimmed) > 100) {
            return res.status(400).json({ mensagem: 'A pergunta excede o limite de 100 tokens.' });
        }
        
        // Usar as memórias relevantes que foram passadas, se houver
        const memorias = memoriasRelevantes || [];
        
        const resposta = await consultarAPI(perguntaTrimmed, memorias);
        
        // Aplicar cache-control para melhorar performance
        res.setHeader('Cache-Control', 'private, max-age=3600');
        return res.status(200).json({ resposta });
    } catch (error) {
        console.error("Erro ao processar requisição:", error);
        return res.status(500).json({ 
            mensagem: 'Erro ao consultar a API.',
            erro: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
