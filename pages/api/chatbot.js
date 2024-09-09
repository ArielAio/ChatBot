import { promises as fs } from 'fs';
import path from 'path';
import natural from 'natural'; // Biblioteca para processamento de texto

const filePath = path.join(process.cwd(), 'data', 'palavras_chave_respostas.json');

// Carregar dados do arquivo JSON
const carregarDados = async () => {
    try {
        const jsonData = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(jsonData);
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        return {};
    }
};

// Salvar dados no arquivo JSON
const salvarDados = async (dados) => {
    try {
        const jsonString = JSON.stringify(dados, null, 2);
        await fs.writeFile(filePath, jsonString);
    } catch (error) {
        console.error("Erro ao salvar dados:", error);
    }
};

// Calcular pontuação de relevância usando TF-IDF
const calcularPontuacao = (pergunta, palavrasChaveRespostas) => {
    const tfidf = new natural.TfIdf();

    // Adicionar cada chave e resposta ao TF-IDF
    for (const chave in palavrasChaveRespostas) {
        tfidf.addDocument(chave);
    }

    tfidf.addDocument(pergunta);

    // Calcular pontuações para cada chave
    const pontuacoes = {};
    for (const chave in palavrasChaveRespostas) {
        pontuacoes[chave] = tfidf.tfidf(chave, tfidf.documents.length - 1);
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
