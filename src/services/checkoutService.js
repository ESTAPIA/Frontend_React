import apiClient from './api';

class CheckoutService {
  /**
   * Crear pedido pendiente desde carrito
   * @param {Object} data - {direccionEntrega: string}
   * @returns {Promise<Object>}
   */
  async createPendingOrder(data) {
    try {
      const response = await apiClient.post('/proceso-pago/crear-pedido-pendiente', data);
      console.log('✅ Pedido pendiente creado:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error al crear pedido pendiente:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al crear el pedido'
      };
    }
  }

  /**
   * Obtener información de un pedido
   * @param {number} orderId - ID del pedido
   * @returns {Promise<Object>}
   */
  async getOrderInfo(orderId) {
    try {
      const response = await apiClient.get(`/pedidos/${orderId}`);
      console.log('✅ Información del pedido obtenida:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error al obtener información del pedido:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al cargar el pedido'
      };
    }
  }

  /**
   * Verificar cuentas bancarias disponibles para pago
   * @param {number} orderId - ID del pedido
   * @returns {Promise<Object>}
   */
  async verifyBankAccounts(orderId) {
    try {
      const response = await apiClient.get(`/proceso-pago/verificar-cuentas/${orderId}`);
      console.log('✅ Cuentas bancarias verificadas:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error al verificar cuentas:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al verificar cuentas bancarias'
      };
    }
  }

  /**
   * Confirmar pago del pedido
   * @param {number} orderId - ID del pedido
   * @param {Object} paymentData - Datos de pago
   * @returns {Promise<Object>}
   */
  async confirmPayment(orderId, paymentData) {
    try {
      const { cuentaId, tipoCuenta, clearCart = true } = paymentData;
      
      const params = new URLSearchParams({
        cuentaId: cuentaId,
        tipoCuenta: tipoCuenta,
        clearCart: clearCart
      });

      const response = await apiClient.post(`/proceso-pago/confirmar-pago/${orderId}?${params}`);
      console.log('✅ Pago confirmado exitosamente:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error al confirmar pago:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al procesar el pago'
      };
    }
  }

  /**
   * Cancelar pedido pendiente
   * @param {number} orderId - ID del pedido
   * @returns {Promise<Object>}
   */
  async cancelOrder(orderId) {
    try {
      const response = await apiClient.post(`/proceso-pago/cancelar-pedido/${orderId}`);
      console.log('✅ Pedido cancelado:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error al cancelar pedido:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al cancelar el pedido'
      };
    }
  }
}

const checkoutService = new CheckoutService();
export default checkoutService;
