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
            // Ordenar memórias por relevância
            const memoriasOrdenadas = [...memoriasRelevantes].sort((a, b) => {
                // Priorizar informações básicas como nome
                if (a.topic === 'Nome') return -1;
                if (b.topic === 'Nome') return 1;
                
                // Depois por ocorrências (frequência de menção)
                return (b.occurrences || 1) - (a.occurrences || 1);
            });
            
            contextoMemoria = "Informações importantes sobre o usuário:\n";
            
            // Verificar se há uma memória de nome
            const memoriaDeNome = memoriasOrdenadas.find(m => m.topic === 'Nome');
            if (memoriaDeNome) {
                nomeUsuario = memoriaDeNome.data;
            }
            
            // Agrupar memórias por tópico para melhor organização
            const memoriasPorTopico = memoriasOrdenadas.reduce((acc, memoria) => {
                if (!acc[memoria.topic]) acc[memoria.topic] = [];
                acc[memoria.topic].push(memoria);
                return acc;
            }, {});
            
            // Adicionar memórias ao contexto, organizadas por tópico
            Object.entries(memoriasPorTopico).forEach(([topic, memories]) => {
                if (memories.length === 1) {
                    contextoMemoria += `- ${topic}: ${memories[0].data}\n`;
                } else {
                    contextoMemoria += `- ${topic}:\n`;
                    memories.forEach(m => {
                        contextoMemoria += `  * ${m.data}\n`;
                    });
                }
            });
            
            if (nomeUsuario) {
                contextoMemoria += `\nO nome do usuário é ${nomeUsuario}. Ocasionalmente, use o nome do usuário para tornar a conversa mais pessoal e acolhedora.`;
            }
            
            // Instruções adicionais baseadas no contexto
            contextoMemoria += "\nUtilize essas informações para personalizar sua resposta de forma natural e sutil, sem mencionar explicitamente que está usando essa memória.";
            
            // Log para depuração
            console.log("Usando memórias na API:", memoriasRelevantes);
        }
        
        // Instruções para a personalidade do chatbot
        const sistemaPrompt = `Você é um assistente virtual amigável e prestativo.
        
${contextoMemoria}

Mantenha suas respostas concisas mas completas, focando em ser útil e informativo.
Use um tom conversacional, amigável e respeitoso.
Se não souber a resposta para algo, seja honesto em vez de inventar informações.
Evite ser repetitivo nas suas respostas.
O idioma principal da conversa é o português brasileiro.`;

        // Verificar se o sistema prompt não é muito grande
        const tokenCountSistema = contarTokens(sistemaPrompt);
        const tokenCountPergunta = contarTokens(pergunta);
        console.log(`Tokens - Sistema: ${tokenCountSistema}, Pergunta: ${tokenCountPergunta}`);
        
        // Obter resposta da API
        const response = await client.chat.completions.create({
            model: "maritalk",
            temperature: 0.7,
            max_tokens: 800,
            messages: [
                { role: "system", content: sistemaPrompt },
                { role: "user", content: pergunta }
            ]
        });
        
        // Extrair e retornar a resposta
        if (response.choices && response.choices.length > 0) {
            const resposta = response.choices[0].message.content.trim();
            console.log("Resposta da API:", resposta.substring(0, 100) + "...");
            return resposta;
        } else {
            throw new Error("Resposta vazia da API");
        }
    } catch (error) {
        console.error("Erro ao consultar API:", error);
        throw error;
    }
};

/**
 * Handler para o endpoint /api/chatbot
 */
export default async function handler(req, res) {
    // Apenas aceitar método POST
    if (req.method !== 'POST') {
        return res.status(405).json({ mensagem: 'Método não permitido' });
    }
    
    try {
        const { pergunta, memoriasRelevantes } = req.body;
        
        // Validar parâmetros
        if (!pergunta || typeof pergunta !== 'string') {
            return res.status(400).json({ mensagem: 'Pergunta inválida' });
        }
        
        // Consultar a API
        const resposta = await consultarAPI(pergunta, memoriasRelevantes);
        
        // Retornar resposta
        return res.status(200).json({ resposta });
    } catch (error) {
        console.error('Erro no servidor:', error);
        return res.status(500).json({ 
            mensagem: 'Erro ao processar a pergunta',
            erro: error.message
        });
    }
}
