import React from 'react';
import { motion } from 'framer-motion';
import { FaCloud, FaCloudDownloadAlt, FaCheck } from 'react-icons/fa';

const LoginStatus = ({ user, className = '' }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-xs flex items-center p-2 rounded-md ${className}`}
    >
      {user ? (
        <div className="flex items-center text-green-600 dark:text-green-400">
          <FaCloudDownloadAlt className="mr-1" />
          <span>Sincronizado com Google</span>
          <FaCheck className="ml-1" size={10} />
        </div>
      ) : (
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <FaCloud className="mr-1" />
          <span>Modo local</span>
        </div>
      )}
    </motion.div>
  );
};

export default LoginStatus;
