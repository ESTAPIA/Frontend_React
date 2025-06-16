// src/services/authService.js
import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Servicio de autenticación para Motoshop React
 * Compatible con el backend Spring Boot existente
 */
class AuthService {
  /**
   * Iniciar sesión con cédula y contraseña
   * @param {Object} credentials - Credenciales de login
   * @param {string} credentials.cedula - Número de cédula del usuario
   * @param {string} credentials.password - Contraseña del usuario
   * @returns {Promise<Object>} Respuesta con token y datos del usuario
   */
  async login(credentials) {
    try {
      const { cedula, password } = credentials;
      
      // Validar datos requeridos
      if (!cedula || !password) {
        throw new Error('Cédula y contraseña son requeridas');
      }

      // Hacer petición al backend (igual que el original)
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        cedula: cedula.trim(),
        password: password
      });

      const { data } = response;
      
      // Validar respuesta del servidor
      if (!data.token) {
        throw new Error('Token no recibido del servidor');
      }      // Estructurar datos según formato del backend
      const userData = {
        token: data.token,
        refreshToken: data.refreshToken || null,
        user: {
          cedula: cedula.trim(), // ✅ Usar la cédula del request
          role: data.role || 'ROLE_USER', // ✅ Usar role de la respuesta directa
          // Incluir otros datos si vienen en la respuesta
          ...data.user
        }
      };

      return {
        success: true,
        data: userData
      };
    } catch (error) {
      console.error('Error en login:', error);
      
      // Manejar errores específicos del backend
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Cédula o contraseña incorrectas'
        };
      }
      
      if (error.response?.status === 400) {
        return {
          success: false,
          error: error.response.data?.message || 'Datos inválidos'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Error al iniciar sesión'
      };
    }
  }

  /**
   * Registrar nuevo usuario
   * @param {Object} userData - Datos del nuevo usuario
   * @param {string} userData.cedula - Número de cédula (sin guiones)
   * @param {string} userData.password - Contraseña
   * @param {string} userData.confirmPassword - Confirmación de contraseña
   * @returns {Promise<Object>} Respuesta con token y datos del usuario
   */
  async register(userData) {
    try {
      const { cedula, password, confirmPassword } = userData;
      
      // Validaciones del lado del cliente (igual que el original)
      if (!cedula || !password || !confirmPassword) {
        throw new Error('Todos los campos son requeridos');
      }

      if (password !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Validar formato de cédula (solo números)
      const cedulaLimpia = cedula.replace(/\D/g, '');
      if (cedulaLimpia.length < 8) {
        throw new Error('La cédula debe tener al menos 8 dígitos');
      }

      // Hacer petición al backend
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
        cedula: cedulaLimpia,
        password: password
      });

      const { data } = response;
      
      // El endpoint de registro puede retornar solo estado y mensaje
      // En ese caso, hacer login automático
      if (data.estado === 'exitoso' || data.success) {
        // Hacer login automático tras registro exitoso
        const loginResult = await this.login({
          cedula: cedulaLimpia,
          password: password
        });
        
        if (loginResult.success) {
          return loginResult;
        } else {
          // Si login falla, retornar éxito de registro pero sin datos de sesión
          return {
            success: true,
            data: {
              message: 'Usuario registrado exitosamente. Por favor, inicia sesión.',
              needsLogin: true
            }
          };
        }
      }
      
      // Si el registro retorna token directamente (futuro)
      if (data.token) {
        const userData = {
          token: data.token,
          refreshToken: data.refreshToken || null,
          user: {
            cedula: cedulaLimpia,
            role: data.user?.role || 'ROLE_USER',
            nombre: data.user?.nombre,
            email: data.user?.email,
            ...data.user
          }
        };
        
        return {
          success: true,
          data: userData
        };
      }
      
      // Respuesta sin token, registro exitoso pero necesita login
      return {
        success: true,
        data: {
          message: 'Usuario registrado exitosamente. Por favor, inicia sesión.',
          needsLogin: true
        }
      };
    } catch (error) {
      console.error('Error en registro:', error);
      
      // Manejar errores específicos del backend
      if (error.response?.status === 409) {
        return {
          success: false,
          error: 'Esta cédula ya está registrada'
        };
      }
      
      if (error.response?.status === 400) {
        return {
          success: false,
          error: error.response.data?.message || 'Datos inválidos'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Error al registrar usuario'
      };
    }
  }

  /**
   * Renovar token JWT
   * @param {string} refreshToken - Token de renovación
   * @returns {Promise<Object>} Nuevo token de acceso
   */
  async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new Error('Token de renovación requerido');
      }

      const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, {
        refreshToken
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error renovando token:', error);
      return {
        success: false,
        error: 'Error al renovar token'
      };
    }
  }

  /**
   * Cerrar sesión
   * @returns {Promise<Object>} Confirmación de logout
   */
  async logout() {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error en logout:', error);
      // Incluso si hay error en el servidor, se considera exitoso
      // porque vamos a limpiar la sesión local
      return {
        success: true
      };
    }
  }
  /**
   * Verificar si el token actual es válido
   * @returns {Promise<boolean>} True si el token es válido
   */
  async verifyToken() {
    // ❌ DESHABILITADO: Endpoint /auth/verify no existe en el backend
    console.warn('Verificación de token deshabilitada - endpoint no disponible');
    
    // ✅ Verificación básica: si existe token, asumimos que es válido
    const token = localStorage.getItem('token');
    return !!token;
    
    /* CÓDIGO ORIGINAL COMENTADO - ENDPOINT NO EXISTE:
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      // Hacer una petición simple para verificar el token
      await apiClient.get('/auth/verify');
      return true;
    } catch (error) {
      return false;
    }
    */
  }
  /**
   * Obtener información completa del usuario actual
   * @returns {Promise<Object>} Datos completos del usuario autenticado
   */
  async getUserInfo() {
    try {
      // ✅ USAR ENDPOINT CORRECTO: /api/auth/user-info (sin parámetros)
      const response = await apiClient.get('/auth/user-info');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error obteniendo información del usuario:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener información del usuario'
      };
    }
  }
}

// Exportar instancia única (singleton)
const authService = new AuthService();
export default authService;
