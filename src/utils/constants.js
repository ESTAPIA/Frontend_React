// src/utils/constants.js

/**
 * Constantes de la aplicación Motoshop React
 */

// URLs de la API
export const API_ENDPOINTS = {  // Autenticación
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/usuarios/registro',  // Corregido según backend
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout'
  },
    // Productos
  PRODUCTS: {
    BASE: '/productos',
    ALL: '/productos/todos',
    PAGINATED: '/productos',
    BY_ID: (id) => `/productos/${id}`,
    BY_CATEGORY: (categoryId) => `/productos/categoria/${categoryId}`,
    SEARCH: '/productos/buscar'
  },
  
  // Categorías
  CATEGORIES: {
    BASE: '/categorias',
    ALL: '/categorias',
    PRODUCTS: (categoryId) => `/categorias/${categoryId}/productos`
  },
  
  // Carrito
  CART: {
    BASE: '/carrito',
    GET: (cedulaCliente) => `/carrito/${cedulaCliente}`,
    ADD: '/carrito/agregar',
    UPDATE: '/carrito/actualizar',
    REMOVE: (itemId) => `/carrito/eliminar/${itemId}`,
    CLEAR: (cedulaCliente) => `/carrito/limpiar/${cedulaCliente}`
  },
  
  // Pedidos
  ORDERS: {
    BASE: '/pedidos',
    BY_CLIENT: (cedulaCliente) => `/pedidos/cliente/${cedulaCliente}`,
    BY_ID: (id) => `/pedidos/${id}`,
    CREATE: '/pedidos'
  },
    // Usuarios
  USERS: {
    BASE: '/usuarios',
    PROFILE: '/usuarios/perfil',
    UPDATE: '/usuarios/actualizar',
    BY_CEDULA: (cedula) => `/clientes/${cedula}`  // Para obtener datos completos
  },
  
  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/usuarios',
    PRODUCTS: '/admin/productos',
    ORDERS: '/admin/pedidos',
    STATS: '/admin/estadisticas'
  }
};

// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER',
  GUEST: 'ROLE_GUEST'
};

// Estados de pedidos
export const ORDER_STATUS = {
  PENDING: 'PENDIENTE',
  CONFIRMED: 'CONFIRMADO',
  PROCESSING: 'PROCESANDO',
  SHIPPED: 'ENVIADO',
  DELIVERED: 'ENTREGADO',
  CANCELLED: 'CANCELADO'
};

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};

// Configuración de localStorage
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  CART: 'cart',
  THEME: 'theme'
};
