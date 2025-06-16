// src/context/NotificationContext.js
import React, { createContext, useContext, useCallback } from 'react';
import toast from 'react-hot-toast';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  
  const showAccessDenied = useCallback((reason) => {
    toast.error(reason || 'Acceso denegado', {
      duration: 4000,
      position: 'top-center',
      icon: '🚫',
      style: {
        background: '#FFF3E0',
        color: '#E65100',
        border: '1px solid #FFB74D',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500'
      }
    });
  }, []);

  const showLoginRequired = useCallback((intendedPath) => {
    toast('Inicia sesión para continuar', {
      duration: 3000,
      position: 'top-center',
      icon: '🔐',
      style: {
        background: 'var(--primary-cream)',
        color: 'var(--dark-green)',
        border: '2px solid var(--primary-green)',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500'
      }
    });
  }, []);

  const showRoleUpgradeNeeded = useCallback(() => {
    toast('Contacta al administrador para obtener permisos', {
      duration: 5000,
      position: 'top-center',
      icon: '📧',
      style: {
        background: '#FFF8E1',
        color: '#F57F17',
        border: '1px solid #FBC02D',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500'
      }
    });
  }, []);

  const showSuccessAccess = useCallback((message) => {
    toast.success(message || 'Acceso concedido', {
      duration: 2000,
      position: 'top-right',
      icon: '✅',
      style: {
        background: 'var(--primary-cream)',
        color: 'var(--dark-green)',
        border: '2px solid var(--secondary-green)',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500'
      }
    });
  }, []);

  const value = {
    showAccessDenied,
    showLoginRequired, 
    showRoleUpgradeNeeded,
    showSuccessAccess
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook personalizado para usar las notificaciones
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
