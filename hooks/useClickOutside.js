import { useEffect, useRef } from 'react';

/**
 * Hook personalizado para detectar cliques fora de um elemento
 * @param {Function} handler - Função a ser chamada quando um clique fora do elemento é detectado
 * @param {boolean} active - Se o detector está ativo (opcional, padrão true)
 * @returns {Object} Ref a ser associado ao elemento
 */
const useClickOutside = (handler, active = true) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!active) return;

    const handleClickOutside = (event) => {
      // Se o clique foi fora do elemento referenciado, chama o handler
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    };

    // Adicionando event listener para mousedown e touchstart
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    // Limpeza
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [handler, active]);

  return ref;
};

export default useClickOutside;