/**
 * Funciones auxiliares para el manejo del carrito
 */

/**
 * Calcular total del carrito
 * @param {Array} items - Items del carrito
 * @returns {number} Total calculado
 */
export const calculateCartTotal = (items = []) => {
  return items.reduce((total, item) => total + (item.subtotal || 0), 0);
};

/**
 * Calcular cantidad total de items
 * @param {Array} items - Items del carrito
 * @returns {number} Cantidad total
 */
export const calculateItemCount = (items = []) => {
  return items.reduce((count, item) => count + (item.cantidad || 0), 0);
};

/**
 * Encontrar item en carrito por ID de producto
 * @param {Array} items - Items del carrito
 * @param {number} idProducto - ID del producto
 * @returns {Object|null} Item encontrado o null
 */
export const findCartItem = (items = [], idProducto) => {
  return items.find(item => item.idProducto === idProducto) || null;
};

/**
 * Verificar si un producto está en el carrito
 * @param {Array} items - Items del carrito
 * @param {number} idProducto - ID del producto
 * @returns {boolean} True si está en carrito
 */
export const isProductInCart = (items = [], idProducto) => {
  return findCartItem(items, idProducto) !== null;
};

/**
 * Formatear precio para mostrar
 * @param {number} price - Precio a formatear
 * @returns {string} Precio formateado
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price || 0);
};

/**
 * Validar cantidad de producto
 * @param {number} cantidad - Cantidad a validar
 * @param {number} stock - Stock disponible
 * @returns {Object} Resultado de validación
 */
export const validateQuantity = (cantidad, stock = 999) => {
  if (!cantidad || cantidad <= 0) {
    return {
      valid: false,
      error: 'La cantidad debe ser mayor a 0'
    };
  }

  if (cantidad > stock) {
    return {
      valid: false,
      error: `Solo hay ${stock} unidades disponibles`
    };
  }

  return { valid: true };
};

/**
 * Generar ID único para operaciones de carrito
 * @returns {string} ID único
 */
export const generateCartOperationId = () => {
  return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Sincronizar carrito con localStorage como backup
 * @param {Array} items - Items del carrito
 */
export const syncWithLocalStorage = (items) => {
  try {
    const cartData = {
      items,
      timestamp: new Date().toISOString(),
      total: calculateCartTotal(items),
      itemCount: calculateItemCount(items)
    };
    localStorage.setItem('motoshop_cart_backup', JSON.stringify(cartData));
  } catch (error) {
    console.warn('Error al sincronizar con localStorage:', error);
  }
};

/**
 * Recuperar carrito desde localStorage
 * @returns {Array} Items del carrito o array vacío
 */
export const getCartFromLocalStorage = () => {
  try {
    const cartData = localStorage.getItem('motoshop_cart_backup');
    if (cartData) {
      const parsed = JSON.parse(cartData);
      return parsed.items || [];
    }
  } catch (error) {
    console.warn('Error al recuperar carrito de localStorage:', error);
  }
  return [];
};

/**
 * Limpiar backup de carrito en localStorage
 */
export const clearCartFromLocalStorage = () => {
  try {
    localStorage.removeItem('motoshop_cart_backup');
  } catch (error) {
    console.warn('Error al limpiar carrito de localStorage:', error);
  }
};
