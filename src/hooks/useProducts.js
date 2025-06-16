// src/hooks/useProducts.js
import { useState, useEffect, useCallback } from 'react';
import productService from '../services/productService';
import { mockFeaturedProducts } from '../data/mockProducts';

/**
 * Hook personalizado para gestión de productos
 * Incluye fallback automático a datos mock si la API falla
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.fetchOnMount - Obtener datos al montar (default: true)
 * @param {boolean} options.useFallback - Usar fallback a mock (default: true)
 * @returns {Object} Estado y funciones para gestión de productos
 */
const useProducts = (options = {}) => {
  const { 
    fetchOnMount = true, 
    useFallback = true 
  } = options;

  // Estados principales
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('none'); // 'api' | 'mock' | 'none'

  // Estados adicionales para funcionalidad avanzada
  const [lastFetch, setLastFetch] = useState(null);
  const [apiAvailable, setApiAvailable] = useState(null);

  /**
   * Función para obtener productos destacados (para HomePage)
   */
  const fetchFeaturedProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Intentar obtener de la API primero
      const response = await productService.getAllProducts();
      
      if (response.success && response.data && response.data.length > 0) {
        // API funcionó - tomar los primeros 6 como destacados
        const featuredProducts = response.data.slice(0, 6);
        setProducts(featuredProducts);
        setDataSource('api');
        setApiAvailable(true);
        setLastFetch(new Date());
        console.log('✅ Productos cargados desde API:', featuredProducts.length);
      } else {
        throw new Error('API no devolvió productos válidos');
      }
      
    } catch (apiError) {
      console.warn('⚠️ API no disponible, usando datos mock');
      setApiAvailable(false);
      
      if (useFallback) {
        // Fallback a datos mock
        setProducts(mockFeaturedProducts);
        setDataSource('mock');
        setError(null); // No mostrar error si hay fallback
        console.log('✅ Productos cargados desde Mock:', mockFeaturedProducts.length);
      } else {
        // Sin fallback - mostrar error
        setProducts([]);
        setDataSource('none');
        setError(`Error al cargar productos: ${apiError.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [useFallback]);

  /**
   * Función para obtener todos los productos
   */
  const fetchAllProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await productService.getAllProducts();
      
      if (response.success && response.data) {
        setProducts(response.data);
        setDataSource('api');
        setApiAvailable(true);
        setLastFetch(new Date());
      } else {
        throw new Error('API no devolvió productos válidos');
      }
      
    } catch (apiError) {
      console.warn('Error al obtener todos los productos:', apiError.message);
      setApiAvailable(false);
      
      if (useFallback) {
        setProducts(mockFeaturedProducts);
        setDataSource('mock');
        setError(null);
      } else {
        setProducts([]);
        setDataSource('none');
        setError(`Error al cargar productos: ${apiError.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [useFallback]);

  /**
   * Función para obtener productos paginados
   */
  const fetchProductsPaginated = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await productService.getProductsPaginated(params);
      
      if (response.success && response.data) {
        // Para productos paginados, mantener estructura de página
        return {
          success: true,
          data: response.data,
          source: 'api'
        };
      } else {
        throw new Error('Error en la paginación');
      }
      
    } catch (apiError) {
      console.warn('Error en productos paginados:', apiError.message);
      
      if (useFallback) {
        // Simular paginación con mock data
        const { page = 0, size = 12 } = params;
        const start = page * size;
        const end = start + size;
        const paginatedMock = mockFeaturedProducts.slice(start, end);
        
        return {
          success: true,
          data: {
            content: paginatedMock,
            totalElements: mockFeaturedProducts.length,
            totalPages: Math.ceil(mockFeaturedProducts.length / size),
            number: page,
            size: size,
            first: page === 0,
            last: page >= Math.ceil(mockFeaturedProducts.length / size) - 1
          },
          source: 'mock'
        };
      } else {
        return {
          success: false,
          error: apiError.message,
          source: 'none'
        };
      }
    } finally {
      setLoading(false);
    }
  }, [useFallback]);

  /**
   * Función para buscar productos
   */
  const searchProducts = useCallback(async (searchTerm, options = {}) => {
    if (!searchTerm || searchTerm.trim() === '') {
      return { success: false, error: 'Término de búsqueda vacío' };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await productService.searchProducts(searchTerm, options);
      
      if (response.success) {
        return response;
      } else {
        throw new Error('Error en la búsqueda');
      }
      
    } catch (apiError) {
      console.warn('Error en búsqueda:', apiError.message);
      
      if (useFallback) {
        // Buscar en mock data
        const filteredMock = mockFeaturedProducts.filter(product =>
          product.prodNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.prodDescripcion.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        return {
          success: true,
          data: filteredMock,
          source: 'mock'
        };
      } else {
        return {
          success: false,
          error: apiError.message,
          source: 'none'
        };
      }
    } finally {
      setLoading(false);
    }
  }, [useFallback]);

  /**
   * Función para obtener productos filtrados y paginados (para catálogo avanzado)
   */
  const fetchProductsFiltered = useCallback(async (filters = {}, pagination = {}) => {
    setLoading(true);
    setError(null);

    try {
      const {
        search = '',
        category = '',
        priceMin = '',
        priceMax = '',
        sortBy = 'name'
      } = filters;

      const {
        page = 0,
        size = 12
      } = pagination;

      // Intentar obtener datos de la API
      const response = await productService.getProductsPaginated({
        page,
        size,
        nombre: search,
        // TODO: Implementar filtros adicionales cuando la API los soporte
      });

      if (response.success && response.data) {
        let filteredProducts = response.data;

        // Si la API devolvió una lista simple, simular paginación
        if (Array.isArray(response.data)) {
          // Aplicar filtros localmente como fallback
          let filtered = response.data;

          // Filtro de búsqueda
          if (search) {
            filtered = filtered.filter(product =>
              product.prodNombre.toLowerCase().includes(search.toLowerCase()) ||
              product.prodDescripcion.toLowerCase().includes(search.toLowerCase())
            );
          }

          // Filtro de categoría
          if (category) {
            filtered = filtered.filter(product =>
              product.idCategoria?.toString() === category ||
              product.categoriaNombre?.toLowerCase().includes(category.toLowerCase())
            );
          }

          // Filtro de precio
          if (priceMin) {
            filtered = filtered.filter(product => product.prodPrecio >= parseFloat(priceMin));
          }
          if (priceMax) {
            filtered = filtered.filter(product => product.prodPrecio <= parseFloat(priceMax));
          }

          // Ordenamiento
          filtered = filtered.sort((a, b) => {
            switch (sortBy) {
              case 'name':
                return a.prodNombre.localeCompare(b.prodNombre);
              case 'name_desc':
                return b.prodNombre.localeCompare(a.prodNombre);
              case 'price':
                return a.prodPrecio - b.prodPrecio;
              case 'price_desc':
                return b.prodPrecio - a.prodPrecio;
              case 'newest':
                return b.idProducto - a.idProducto; // Asumir que ID mayor = más nuevo
              default:
                return 0;
            }
          });

          // Simular paginación
          const startIndex = page * size;
          const endIndex = startIndex + size;
          const paginatedContent = filtered.slice(startIndex, endIndex);

          filteredProducts = {
            content: paginatedContent,
            totalElements: filtered.length,
            totalPages: Math.ceil(filtered.length / size),
            number: page,
            size: size,
            first: page === 0,
            last: page >= Math.ceil(filtered.length / size) - 1,
            numberOfElements: paginatedContent.length
          };
        }

        setDataSource('api');
        setApiAvailable(true);
        setLastFetch(new Date());

        return {
          success: true,
          data: filteredProducts,
          source: 'api'
        };

      } else {
        throw new Error('API no devolvió productos válidos');
      }

    } catch (apiError) {
      console.warn('Error al obtener productos filtrados:', apiError.message);
      setApiAvailable(false);

      if (useFallback) {
        // Fallback con datos mock
        let filtered = [...mockFeaturedProducts];

        // Aplicar filtros a datos mock
        const {
          search = '',
          category = '',
          priceMin = '',
          priceMax = '',
          sortBy = 'name'
        } = filters;

        if (search) {
          filtered = filtered.filter(product =>
            product.prodNombre.toLowerCase().includes(search.toLowerCase()) ||
            product.prodDescripcion.toLowerCase().includes(search.toLowerCase())
          );
        }

        if (category) {
          filtered = filtered.filter(product =>
            product.idCategoria?.toString() === category ||
            product.categoriaNombre?.toLowerCase().includes(category.toLowerCase())
          );
        }

        if (priceMin) {
          filtered = filtered.filter(product => product.prodPrecio >= parseFloat(priceMin));
        }
        if (priceMax) {
          filtered = filtered.filter(product => product.prodPrecio <= parseFloat(priceMax));
        }

        // Ordenamiento
        filtered = filtered.sort((a, b) => {
          switch (sortBy) {
            case 'name':
              return a.prodNombre.localeCompare(b.prodNombre);
            case 'name_desc':
              return b.prodNombre.localeCompare(a.prodNombre);
            case 'price':
              return a.prodPrecio - b.prodPrecio;
            case 'price_desc':
              return b.prodPrecio - a.prodPrecio;
            case 'newest':
              return b.idProducto - a.idProducto;
            default:
              return 0;
          }
        });

        // Simular paginación con mock
        const { page = 0, size = 12 } = pagination;
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const paginatedContent = filtered.slice(startIndex, endIndex);

        const mockPaginatedData = {
          content: paginatedContent,
          totalElements: filtered.length,
          totalPages: Math.ceil(filtered.length / size),
          number: page,
          size: size,
          first: page === 0,
          last: page >= Math.ceil(filtered.length / size) - 1,
          numberOfElements: paginatedContent.length
        };

        setDataSource('mock');
        setError(null);

        return {
          success: true,
          data: mockPaginatedData,
          source: 'mock'
        };

      } else {
        setDataSource('none');
        setError(`Error al cargar productos: ${apiError.message}`);

        return {
          success: false,
          error: apiError.message,
          source: 'none'
        };
      }
    } finally {
      setLoading(false);
    }
  }, [useFallback]);

  /**
   * Función para refrescar datos
   */
  const refresh = useCallback(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  /**
   * Función para testear conectividad API
   */
  const testApiConnection = useCallback(async () => {
    try {
      const isAvailable = await productService.testConnectivity();
      setApiAvailable(isAvailable);
      return isAvailable;
    } catch (error) {
      setApiAvailable(false);
      return false;
    }
  }, []);

  // Effect para obtener datos al montar
  useEffect(() => {
    if (fetchOnMount) {
      fetchFeaturedProducts();
    }
  }, [fetchOnMount, fetchFeaturedProducts]);
  // Valores de retorno
  return {
    // Datos
    products,
    loading,
    error,
    dataSource,
    apiAvailable,
    lastFetch,
    
    // Funciones
    fetchFeaturedProducts,
    fetchAllProducts,
    fetchProductsPaginated,
    fetchProductsFiltered,
    searchProducts,
    refresh,
    testApiConnection,
      // Utilidades
    isEmpty: products.length === 0,
    hasError: error !== null,
    isUsingMock: dataSource === 'mock',
    isUsingApi: dataSource === 'api'
  };
};

export { useProducts };
export default useProducts;
