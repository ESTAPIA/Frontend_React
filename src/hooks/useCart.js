import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

/**
 * Hook personalizado para usar el contexto del carrito
 * @returns {Object} Estado y funciones del carrito
 */
export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};

export default useCart;
