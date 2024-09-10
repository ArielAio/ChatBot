import openai from 'openai';
import { encode } from 'gpt-3-encoder';

const client = new openai.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://chat.maritaca.ai/api",
});

const contarTokens = (texto) => {
    return encode(texto).length;
};

const truncarResposta = (resposta) => {
    const pontoFinal = resposta.lastIndexOf('.');
    return pontoFinal !== -1 ? resposta.substring(0, pontoFinal + 1) : resposta;
};

const consultarAPI = async (pergunta) => {
    const messages = [
        { role: 'system', content: 'Responda em uma frase curta e completa, não ultrapassando 80 tokens.' },
        { role: 'user', content: pergunta },
    ];

    const response = await client.chat.completions.create({
        model: 'sabia-2-small',
        messages,
        temperature: 0.1,
        max_tokens: 80,
        stop: ['\n', '.', '!'],
    });

    return truncarResposta(response.choices[0].message.content);
};

export default async function handler(req, res) {
    if (req.method === 'POST') {
        let { pergunta } = req.body;

        if (contarTokens(pergunta) > 50) {
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
    } else {
        res.status(405).json({ mensagem: 'Método não permitido.' });
    }
}
