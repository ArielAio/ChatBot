import React from 'react';
import { motion } from 'framer-motion';
import { FaCloud, FaCloudDownloadAlt, FaCheck } from 'react-icons/fa';

const LoginStatus = ({ user, className = '' }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-[10px] sm:text-xs flex items-center p-1 sm:p-2 rounded-md ${className}`}
    >
      {user ? (
        <div className="flex items-center text-green-600 dark:text-green-400">
          <FaCloudDownloadAlt className="mr-1" size={12} />
          <span className="hidden xs:inline">Sincronizado com Google</span>
          <span className="xs:hidden">Sincronizado</span>
          <FaCheck className="ml-1" size={10} />
        </div>
      ) : (
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <FaCloud className="mr-1" size={12} />
          <span>Modo local</span>
        </div>
      )}
    </motion.div>
  );
};

export default LoginStatus;
