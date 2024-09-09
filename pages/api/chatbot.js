import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'palavras_chave_respostas.json');

/// Carregar dados do arquivo JSON
const carregarDados = async () => {
    const filePath = path.join(process.cwd(), 'data', 'palavras_chave_respostas.json');
    const jsonData = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(jsonData);
};

// Salvar dados no arquivo JSON
const salvarDados = async (dados) => {
    const filePath = path.join(process.cwd(), 'data', 'palavras_chave_respostas.json');
    const jsonString = JSON.stringify(dados, null, 2);
    await fs.writeFile(filePath, jsonString);
};

// Calcular pontuação de relevância
const calcularPontuacao = (pergunta, palavrasChaveRespostas) => {
    const pontuacoes = {};

    for (const chave in palavrasChaveRespostas) {
        const regex = new RegExp(`\\b${chave}\\b`, 'gi');
        const correspondencias = pergunta.match(regex);
        pontuacoes[chave] = (correspondencias || []).length;
    }

    return pontuacoes;
};

// Encontrar a melhor resposta com base na pontuação
const encontrarMelhorResposta = (pergunta, palavrasChaveRespostas) => {
    const pontuacoes = calcularPontuacao(pergunta, palavrasChaveRespostas);
    const melhorChave = Object.keys(pontuacoes).reduce((a, b) => pontuacoes[a] > pontuacoes[b] ? a : b);

    if (!palavrasChaveRespostas[melhorChave]) {
        const maxPontuacao = Math.max(...Object.values(pontuacoes));
        const chavesComMaxPontuacao = Object.keys(pontuacoes).filter(chave => pontuacoes[chave] === maxPontuacao);
        const respostaAleatoria = palavrasChaveRespostas[chavesComMaxPontuacao[Math.floor(Math.random() * chavesComMaxPontuacao.length)]];
        return respostaAleatoria || "Desculpe, não entendi sua pergunta.";
    }

    return palavrasChaveRespostas[melhorChave];
};

// Manipulador de requisições
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { pergunta, novaResposta, novaPalavraChave } = req.body;
        let palavrasChaveRespostas = await carregarDados();

        // Encontrar a melhor resposta
        let resposta = encontrarMelhorResposta(pergunta, palavrasChaveRespostas);

        // Caso não tenha uma resposta, pergunte ao usuário por uma nova
        if (resposta === "Desculpe, não entendi sua pergunta." && novaResposta && novaPalavraChave) {
            palavrasChaveRespostas[novaPalavraChave] = novaResposta;
            await salvarDados(palavrasChaveRespostas);
            resposta = "Obrigado, aprendi algo novo!";
        }

        res.status(200).json({ resposta });
    } else {
        res.status(405).json({ mensagem: 'Método não permitido.' });
    }
}