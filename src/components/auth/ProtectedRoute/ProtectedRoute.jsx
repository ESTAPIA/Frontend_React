// src/components/auth/ProtectedRoute/ProtectedRoute.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { USER_ROLES } from '../../../utils/constants';

/**
 * Componente para proteger rutas según autenticación y roles
 * Redirige según el estado de autenticación y muestra mensajes específicos
 */
const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  allowedRoles = [],
  redirectTo = '/', 
  fallbackPath = '/profile',
  fallback = null 
}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      fallback || (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <div className="text-center">
            <div className="spinner-border text-primary-green" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3 text-muted">Verificando acceso...</p>
          </div>
        </div>
      )
    );
  }

  // Redirigir si no está autenticado
  if (!isAuthenticated) {
    // Guardar la ruta intentada para redirección posterior
    const intendedPath = location.pathname + location.search;
    
    // 🔐 Mostrar notificación INMEDIATAMENTE antes de redirección
    toast('🔐 Inicia sesión para continuar', {
      duration: 4000,
      position: 'top-center',
      style: {
        background: 'var(--primary-cream)',
        color: 'var(--dark-green)',
        border: '2px solid var(--primary-green)',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '400px',
        padding: '16px'
      }
    });
    
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: intendedPath,
          message: 'Debes iniciar sesión para acceder a esta página'
        }} 
        replace 
      />
    );
  }

  // Usuario autenticado: verificar roles específicos
  if (user) {
    const userRole = user.role;
    
    // Verificación específica para admin
    if (requireAdmin && userRole !== USER_ROLES.ADMIN) {
      // 🚫 Mostrar notificación INMEDIATAMENTE antes de redirección
      toast.error('🚫 Esta página requiere permisos de administrador', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#FFF3E0',
          color: '#E65100',
          border: '2px solid #FFB74D',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          maxWidth: '450px',
          padding: '16px'
        }
      });
      
      return (
        <Navigate 
          to={fallbackPath} 
          state={{ 
            from: location,
            message: "No tienes permisos de administrador para acceder a esta página",
            severity: "warning"
          }} 
          replace 
        />
      );
    }
    
    // Verificación por roles específicos
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      const roleNames = {
        'ROLE_USER': 'Usuario',
        'ROLE_ADMIN': 'Administrador'
      };
      
      // 🚫 Mostrar notificación INMEDIATAMENTE antes de redirección
      toast.error(`🚫 Esta página requiere rol: ${allowedRoles.map(r => roleNames[r] || r).join(', ')}`, {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#FFF3E0',
          color: '#E65100',
          border: '2px solid #FFB74D',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          maxWidth: '450px',
          padding: '16px'
        }
      });
      
      return (
        <Navigate 
          to={fallbackPath} 
          state={{ 
            from: location,
            message: `Tu rol actual (${roleNames[userRole] || userRole}) no tiene acceso a esta página`,
            severity: "warning"
          }} 
          replace 
        />
      );
    }
  }

  // Renderizar el componente protegido
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireAdmin: PropTypes.bool,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  redirectTo: PropTypes.string,
  fallbackPath: PropTypes.string,
  fallback: PropTypes.node,
};

export default ProtectedRoute;
