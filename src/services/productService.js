// src/services/productService.js
import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Servicio de productos para Motoshop React
 * Compatible con el backend Spring Boot existente
 * Incluye fallback automático a datos mock
 */
const productService = {
  /**
   * Obtener todos los productos con detalles (para home y catálogo)
   * @returns {Promise<Object>} Respuesta con productos o error
   */
  getAllProducts: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.ALL);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Formato de respuesta inválido');
      }

      return {
        success: true,
        data: response.data,
        source: 'api'
      };
    } catch (error) {
      console.warn('Error al obtener productos de la API:', error.message);
      
      return {
        success: false,
        error: error.message,
        source: 'api'
      };
    }
  },

  /**
   * Obtener productos paginados (para catálogo con filtros)
   * @param {Object} params - Parámetros de consulta
   * @param {number} params.page - Número de página (0-based)
   * @param {number} params.size - Tamaño de página
   * @param {string} params.nombre - Filtro por nombre (opcional)
   * @returns {Promise<Object>} Respuesta con página de productos
   */
  getProductsPaginated: async (params = {}) => {
    try {
      const { page = 0, size = 12, nombre = '' } = params;
      
      const queryParams = {
        page,
        size,
        ...(nombre && { nombre })
      };

      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.PAGINATED, {
        params: queryParams
      });

      if (!response.data) {
        throw new Error('Respuesta vacía del servidor');
      }

      return {
        success: true,
        data: response.data,
        source: 'api'
      };
    } catch (error) {
      console.warn('Error al obtener productos paginados:', error.message);
      
      return {
        success: false,
        error: error.message,
        source: 'api'
      };
    }
  },

  /**
   * Obtener producto por ID
   * @param {number} id - ID del producto
   * @returns {Promise<Object>} Respuesta con producto o error
   */
  getProductById: async (id) => {
    try {
      if (!id || isNaN(id)) {
        throw new Error('ID de producto inválido');
      }

      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.BY_ID(id));
      
      if (!response.data) {
        throw new Error('Producto no encontrado');
      }

      return {
        success: true,
        data: response.data,
        source: 'api'
      };
    } catch (error) {
      console.warn(`Error al obtener producto ${id}:`, error.message);
      
      return {
        success: false,
        error: error.message,
        source: 'api'
      };
    }
  },

  /**
   * Obtener productos por categoría
   * @param {number} categoryId - ID de la categoría
   * @returns {Promise<Object>} Respuesta con productos de la categoría
   */
  getProductsByCategory: async (categoryId) => {
    try {
      if (!categoryId || isNaN(categoryId)) {
        throw new Error('ID de categoría inválido');
      }

      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.PRODUCTS(categoryId));
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Formato de respuesta inválido');
      }

      return {
        success: true,
        data: response.data,
        source: 'api'
      };
    } catch (error) {
      console.warn(`Error al obtener productos de categoría ${categoryId}:`, error.message);
      
      return {
        success: false,
        error: error.message,
        source: 'api'
      };
    }
  },

  /**
   * Buscar productos por texto
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Respuesta con productos encontrados
   */
  searchProducts: async (searchTerm, options = {}) => {
    try {
      if (!searchTerm || typeof searchTerm !== 'string') {
        throw new Error('Término de búsqueda inválido');
      }

      const { page = 0, size = 12 } = options;
      
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.PAGINATED, {
        params: {
          page,
          size,
          nombre: searchTerm.trim()
        }
      });

      return {
        success: true,
        data: response.data,
        source: 'api'
      };
    } catch (error) {
      console.warn('Error en búsqueda de productos:', error.message);
      
      return {
        success: false,
        error: error.message,
        source: 'api'
      };
    }
  },

  /**
   * Test de conectividad con la API
   * @returns {Promise<boolean>} true si la API está disponible
   */
  testConnectivity: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.ALL);
      return response.status === 200;
    } catch (error) {
      console.warn('API no disponible:', error.message);
      return false;
    }
  }
};

export default productService;
