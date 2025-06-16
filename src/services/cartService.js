import apiClient from './api';

/**
 * Servicio para gestión del carrito de compras
 * Conecta con los endpoints del backend Spring Boot
 */
class CartService {
  
  /**
   * Obtener carrito del usuario autenticado
   * @returns {Promise<Object>} CarritoDTO del backend
   */
  async getCart() {
    try {
      const response = await apiClient.get('/carrito');
      return {
        success: true,
        data: response.data || { items: [] }
      };
    } catch (error) {
      console.error('Error al obtener carrito:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al cargar el carrito',
        data: { items: [] }
      };
    }
  }

  /**
   * Agregar producto al carrito
   * @param {number} idProducto - ID del producto
   * @param {number} cantidad - Cantidad a agregar
   * @returns {Promise<Object>} Resultado de la operación
   */
  async addItem(idProducto, cantidad) {
    try {
      const response = await apiClient.post('/carrito/agregar', {
        idProducto,
        cantidad
      });
      
      return {
        success: true,
        message: response.data.mensaje || 'Producto agregado al carrito'
      };
    } catch (error) {
      console.error('Error al agregar producto:', error);
      
      // Manejar errores específicos del backend
      const errorMessage = error.response?.data?.error || 'Error al agregar producto';
      
      return {
        success: false,
        error: errorMessage,
        type: this.getErrorType(error.response?.status)
      };
    }
  }

  /**
   * Actualizar cantidad de un producto
   * @param {number} idProducto - ID del producto
   * @param {number} cantidad - Nueva cantidad
   * @returns {Promise<Object>} Resultado de la operación
   */
  async updateQuantity(idProducto, cantidad) {
    try {
      if (cantidad <= 0) {
        // Si cantidad es 0, eliminar el producto
        return await this.removeItem(idProducto);
      }

      const response = await apiClient.patch('/carrito/actualizar-cantidad', {
        idProducto,
        cantidad
      });
      
      return {
        success: true,
        message: response.data.mensaje || 'Cantidad actualizada'
      };
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al actualizar cantidad'
      };
    }
  }

  /**
   * Eliminar producto del carrito
   * @param {number} idProducto - ID del producto a eliminar
   * @returns {Promise<Object>} Resultado de la operación
   */
  async removeItem(idProducto) {
    try {
      const response = await apiClient.post('/carrito/quitar', {
        idProducto
      });
      
      return {
        success: true,
        message: response.data.mensaje || 'Producto eliminado del carrito'
      };
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al eliminar producto'
      };
    }
  }

  /**
   * Vaciar carrito completo
   * @returns {Promise<Object>} Resultado de la operación
   */
  async clearCart() {
    try {
      const response = await apiClient.delete('/carrito');
      
      return {
        success: true,
        message: response.data.mensaje || 'Carrito vaciado correctamente'
      };
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al vaciar carrito'
      };
    }
  }

  /**
   * Obtener contador de items en carrito
   * @returns {Promise<number>} Número de items en carrito
   */
  async getCartCount() {
    try {
      const response = await apiClient.get('/carrito/count');
      return response.data.cantidad || 0;
    } catch (error) {
      console.error('Error al obtener contador:', error);
      return 0;
    }
  }

  /**
   * Determinar tipo de error según status HTTP
   * @param {number} status - Status HTTP
   * @returns {string} Tipo de error
   */
  getErrorType(status) {
    switch (status) {
      case 401: return 'UNAUTHORIZED';
      case 404: return 'PRODUCT_NOT_FOUND';
      case 409: return 'INSUFFICIENT_STOCK';
      default: return 'GENERIC_ERROR';
    }
  }
}

const cartService = new CartService();
export default cartService;
