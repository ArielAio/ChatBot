import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaCloudUploadAlt, FaCloudDownloadAlt, FaTimes, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import DataExportService from '../utils/dataExportService';

const DataManagement = ({ onComplete }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const success = DataExportService.exportUserData();
    if (success) {
      setImportStatus({
        success: true,
        message: 'Dados exportados com sucesso!',
        isExport: true
      });
      setTimeout(() => {
        setImportStatus(null);
      }, 3000);
    } else {
      setImportStatus({
        success: false,
        message: 'Falha ao exportar dados.',
        isExport: true
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus({
      success: null,
      message: 'Importando dados...',
      isExport: false
    });

    try {
      const result = await DataExportService.importUserData(file);
      setImportStatus({
        success: result.success,
        message: result.message,
        stats: result.stats,
        isExport: false
      });
      
      if (result.success) {
        setTimeout(() => {
          if (onComplete) onComplete(true);
        }, 2000);
      }
    } catch (error) {
      setImportStatus({
        success: false,
        message: error.message || 'Falha ao importar dados.',
        isExport: false
      });
    } finally {
      setIsImporting(false);
      // Limpar o valor do input file para permitir selecionar o mesmo arquivo novamente
      e.target.value = '';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Gerenciar Dados
        </h2>
        {onComplete && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onComplete(false)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            aria-label="Fechar"
          >
            <FaTimes size={20} />
          </motion.button>
        )}
      </div>

      <div className="space-y-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Exporte seus dados para fazer backup ou transferir para outro dispositivo.
            Importe para restaurar um backup anterior.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            disabled={isImporting}
          >
            <FaCloudDownloadAlt size={18} />
            <span>Exportar Dados</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={triggerFileInput}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
            disabled={isImporting}
          >
            <FaCloudUploadAlt size={18} />
            <span>Importar Dados</span>
          </motion.button>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleFileSelected}
            className="hidden"
          />
        </div>

        {importStatus && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              importStatus.success === true
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : importStatus.success === false
                ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {importStatus.success === true ? (
                <FaCheck className="text-green-500 dark:text-green-400" size={16} />
              ) : importStatus.success === false ? (
                <FaExclamationTriangle className="text-red-500 dark:text-red-400" size={16} />
              ) : (
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full" />
              )}
              <p className="text-sm">{importStatus.message}</p>
            </div>
            
            {importStatus.success && importStatus.stats && !importStatus.isExport && (
              <div className="mt-2 text-xs">
                <p>Itens importados: {importStatus.stats.chats} conversas, {importStatus.stats.memories} memórias</p>
              </div>
            )}
          </motion.div>
        )}
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Todos os dados são armazenados localmente. A importação substituirá todos os dados existentes.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default DataManagement;
