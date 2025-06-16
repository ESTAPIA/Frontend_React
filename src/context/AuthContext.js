// src/context/AuthContext.js
import React, { createContext, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';
import { STORAGE_KEYS, USER_ROLES } from '../utils/constants';
import authService from '../services/authService';

// Estado inicial
const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

// Tipos de acciones
export const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer de autenticación
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: null
      };
      
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        loading: false,
        error: null
      };
      
    case AUTH_ACTIONS.LOGIN_ERROR:
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
      
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
      
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        error: null
      };
      
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    default:
      return state;
  }
};

// Crear contexto
export const AuthContext = createContext();

// Provider del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);  // Inicializar autenticación desde localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const userString = localStorage.getItem(STORAGE_KEYS.USER);

        if (token && userString) {
          const user = JSON.parse(userString);
          
          // ✅ ELIMINAR: No verificar token con endpoint inexistente
          // ❌ const isValidToken = await authService.verifyToken();
          
          // ✅ Usar directamente los datos almacenados
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user, token, refreshToken }
          });
            // ✅ NUEVA LÓGICA: Obtener información completa del usuario
          try {
            // Usar endpoint correcto /api/auth/user-info (sin parámetros)
            const userInfoResult = await authService.getUserInfo();
            
            if (userInfoResult.success) {
              const updatedUser = {
                ...user,
                // Mapear campos del usuario desde el backend
                cliNombre: userInfoResult.data.cliNombre,
                cliApellido: userInfoResult.data.cliApellido,
                cliCorreo: userInfoResult.data.cliCorreo,
                cliTelefono: userInfoResult.data.cliTelefono,
                // Mantener datos críticos originales
                cedula: user.cedula || userInfoResult.data.cedula,
                role: user.role
              };
              
              localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
              dispatch({
                type: AUTH_ACTIONS.UPDATE_USER,
                payload: updatedUser
              });
            }
          } catch (userInfoError) {
            console.warn('No se pudieron cargar datos del usuario:', userInfoError);
            // Continuar con datos básicos del usuario
          }
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Error inicializando autenticación:', error);
        // Limpiar localStorage corrupto
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);
  // Función de login
  const login = async (userData) => {
    try {
      const { user, token, refreshToken } = userData;
      
      // Guardar datos básicos en localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      if (refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }

      // Actualizar estado con datos básicos
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token, refreshToken }
      });

      // ✅ CARGAR DATOS COMPLETOS DEL USUARIO TRAS LOGIN
      try {
        const userInfoResult = await authService.getUserInfo();
        
        if (userInfoResult.success) {
          const completeUser = {
            ...user,
            // Agregar datos completos desde el backend
            cliNombre: userInfoResult.data.cliNombre,
            cliApellido: userInfoResult.data.cliApellido,
            cliCorreo: userInfoResult.data.cliCorreo,
            cliTelefono: userInfoResult.data.cliTelefono,
            // Mantener datos críticos
            cedula: user.cedula,
            role: user.role
          };
          
          // Actualizar localStorage con datos completos
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(completeUser));
          
          // Actualizar estado con datos completos
          dispatch({
            type: AUTH_ACTIONS.UPDATE_USER,
            payload: completeUser
          });
        }
      } catch (userInfoError) {
        console.warn('No se pudieron cargar datos completos del usuario:', userInfoError);
        // Continuar con datos básicos - no es un error fatal
      }

      return true;
    } catch (error) {
      console.error('Error en login:', error);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: 'Error al procesar el login'
      });
      return false;
    }
  };

  // Función de logout
  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.CART);

    // Actualizar estado
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Función para actualizar usuario
  const updateUser = (userData) => {
    try {
      const updatedUser = { ...state.user, ...userData };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: userData
      });
    } catch (error) {
      console.error('Error actualizando usuario:', error);
    }
  };

  // Función para limpiar errores
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };
  // Función para verificar si el usuario es admin  
  const isAdmin = () => {
    if (!state.user) return false;
    const userRole = state.user.role || state.user.rol;
    return userRole === USER_ROLES.ADMIN || userRole === 'admin' || userRole === 'ADMIN';
  };  // Función para verificar si el perfil está completo
  const isProfileComplete = () => {
    if (!state.user) return false;
    
    // Campos requeridos según el backend (como en profile.js original)
    const requiredFields = [
      'cliNombre',    // Nombre
      'cliApellido',  // Apellido  
      'cliTelefono',  // Teléfono
      'cliCorreo'     // Correo
    ];
    
    return requiredFields.every(field => {
      const value = state.user[field];
      return value && value.trim && value.trim().length > 0;
    });
  };

  // Valor del contexto
  const contextValue = {
    // Estado
    ...state,
    
    // Funciones
    login,
    logout,
    updateUser,
    clearError,
    
    // Utilidades
    isAdmin,
    isProfileComplete
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
