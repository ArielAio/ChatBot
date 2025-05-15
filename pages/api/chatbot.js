import openai from 'openai';
import { encode } from 'gpt-3-encoder';

const client = new openai.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://chat.maritaca.ai/api",
});

const contarTokens = texto => encode(texto).length;

const consultarAPI = async pergunta => {
    const response = await client.chat.completions.create({
        model: 'sabia-3.1',
        messages: [
            { role: 'system', content: 'Responda em uma frase curta e completa, não ultrapassando 200 tokens.' },
            { role: 'user', content: pergunta },
        ],
        temperature: 0.1,
        max_tokens: 200,
        stop: ['\n', '.', '!'],
    });
    return response.choices[0].message.content;
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ mensagem: 'Método não permitido.' });
        return;
    }
    const { pergunta } = req.body;
    if (!pergunta || contarTokens(pergunta) > 50) {
        res.status(400).json({ mensagem: 'A pergunta excede o limite de 50 tokens.' });
        return;
    }
    try {
        const resposta = await consultarAPI(pergunta);
        res.status(200).json({ resposta });
    } catch (error) {
        console.error("Erro ao consultar a API:", error);
        res.status(500).json({ mensagem: 'Erro ao consultar a API.' });
    }
}
