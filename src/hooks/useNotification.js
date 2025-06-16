// src/hooks/useNotification.js
import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

/**
 * Hook personalizado para usar el sistema de notificaciones
 * @returns {Object} Funciones para mostrar diferentes tipos de notificaciones
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
};

export default useNotification;
