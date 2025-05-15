// filepath: /Users/arielaio/Desktop/ChatBot/scripts/cleanup.js
/**
 * Script para limpar arquivos duplicados ou obsoletos do projeto.
 * Execute com: node scripts/cleanup.js
 */
const fs = require('fs');
const path = require('path');

// Lista de arquivos a serem removidos
const filesToRemove = [
  '/pages/index_new.js',
  '/pages/api/chatbot_new.js',
  '/utils/memoryService_updated.js',
  '/utils/chatService_updated.js',
  '/utils/improvedMemoryService.js'
];

// Lista de arquivos que devem ser renomeados (origem -> destino)
const filesToRename = [
  // Adicione arquivos para renomear aqui se necessário, no formato:
  // { from: '/caminho/original.js', to: '/caminho/novo.js' }
];

// Caminho base do projeto
const basePath = path.resolve(__dirname, '..');
console.log(`Limpando arquivos duplicados no diretório: ${basePath}`);

// Remover arquivos
filesToRemove.forEach(file => {
  const fullPath = path.join(basePath, file);
  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`[Removido] ${file}`);
    } else {
      console.log(`[Ignorado] ${file} (não encontrado)`);
    }
  } catch (err) {
    console.error(`[Erro] Não foi possível remover ${file}: ${err.message}`);
  }
});

// Renomear arquivos
filesToRename.forEach(({ from, to }) => {
  const fullFromPath = path.join(basePath, from);
  const fullToPath = path.join(basePath, to);
  
  try {
    if (fs.existsSync(fullFromPath)) {
      // Garantir que o diretório de destino existe
      const toDir = path.dirname(fullToPath);
      if (!fs.existsSync(toDir)) {
        fs.mkdirSync(toDir, { recursive: true });
      }
      
      fs.renameSync(fullFromPath, fullToPath);
      console.log(`[Renomeado] ${from} -> ${to}`);
    } else {
      console.log(`[Ignorado] ${from} (não encontrado)`);
    }
  } catch (err) {
    console.error(`[Erro] Não foi possível renomear ${from}: ${err.message}`);
  }
});

console.log('Limpeza finalizada!');