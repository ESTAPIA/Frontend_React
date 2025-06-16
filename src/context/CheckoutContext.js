import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import checkoutService from '../services/checkoutService';
import toast from 'react-hot-toast';

// Estados del checkout
const CHECKOUT_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CURRENT_STEP: 'SET_CURRENT_STEP',
  SET_SHIPPING_ADDRESS: 'SET_SHIPPING_ADDRESS',
  SET_PAYMENT_METHOD: 'SET_PAYMENT_METHOD',
  SET_ORDER_ID: 'SET_ORDER_ID',
  SET_ORDER_TOTAL: 'SET_ORDER_TOTAL',
  SET_FLOW_TYPE: 'SET_FLOW_TYPE',
  RESET_CHECKOUT: 'RESET_CHECKOUT'
};

const initialState = {
  // Estados de control
  currentStep: 1,
  loading: false,
  error: null,
  
  // Tipos de flujo
  flowType: 'NEW_ORDER', // 'NEW_ORDER' | 'EXISTING_ORDER'
  shouldClearCart: true,
  
  // Datos del proceso
  orderId: null,
  orderTotal: 0,
  shippingAddress: '',
  paymentMethod: null,
  
  // Configuración de pasos
  steps: [
    { id: 1, title: 'Dirección de Entrega', icon: '1', component: 'AddressStep' },
    { id: 2, title: 'Método de Pago', icon: '2', component: 'PaymentStep' },
    { id: 3, title: 'Confirmación', icon: '3', component: 'ConfirmationStep' }
  ]
};

const checkoutReducer = (state, action) => {
  switch (action.type) {
    case CHECKOUT_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case CHECKOUT_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
      
    case CHECKOUT_ACTIONS.SET_CURRENT_STEP:
      return { ...state, currentStep: action.payload };
      
    case CHECKOUT_ACTIONS.SET_SHIPPING_ADDRESS:
      return { ...state, shippingAddress: action.payload };
      
    case CHECKOUT_ACTIONS.SET_PAYMENT_METHOD:
      return { ...state, paymentMethod: action.payload };
      
    case CHECKOUT_ACTIONS.SET_ORDER_ID:
      return { ...state, orderId: action.payload };
      
    case CHECKOUT_ACTIONS.SET_ORDER_TOTAL:
      return { ...state, orderTotal: action.payload };
      
    case CHECKOUT_ACTIONS.SET_FLOW_TYPE:
      return { 
        ...state, 
        flowType: action.payload.type,
        shouldClearCart: action.payload.shouldClearCart || false,
        currentStep: action.payload.startStep || 1
      };
      
    case CHECKOUT_ACTIONS.RESET_CHECKOUT:
      return { ...initialState };
      
    default:
      return state;
  }
};

const CheckoutContext = createContext();

export const CheckoutProvider = ({ children }) => {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Inicializar checkout
  const initializeCheckout = useCallback((orderIdFromUrl = null) => {
    if (orderIdFromUrl) {
      // Flujo: Pagar pedido existente
      dispatch({
        type: CHECKOUT_ACTIONS.SET_FLOW_TYPE,
        payload: {
          type: 'EXISTING_ORDER',
          shouldClearCart: false,
          startStep: 2 // Saltar dirección
        }
      });
      dispatch({ type: CHECKOUT_ACTIONS.SET_ORDER_ID, payload: orderIdFromUrl });
    } else {
      // Flujo: Checkout normal
      dispatch({
        type: CHECKOUT_ACTIONS.SET_FLOW_TYPE,
        payload: {
          type: 'NEW_ORDER',
          shouldClearCart: true,
          startStep: 1
        }
      });
    }
  }, []);

  // Navegación entre pasos
  const goToStep = useCallback((stepNumber) => {
    // Validar rango de pasos
    if (stepNumber < 1 || stepNumber > state.steps.length) {
      return false;
    }
    
    // Para flujo de pedido existente, no permitir ir al paso 1
    if (state.flowType === 'EXISTING_ORDER' && stepNumber === 1) {
      console.warn('No se puede ir al paso 1 en flujo de pedido existente');
      return false;
    }
    
    dispatch({ type: CHECKOUT_ACTIONS.SET_CURRENT_STEP, payload: stepNumber });
    return true;
  }, [state.flowType, state.steps.length]);

  const nextStep = useCallback(() => {
    return goToStep(state.currentStep + 1);
  }, [state.currentStep, goToStep]);

  const prevStep = useCallback(() => {
    return goToStep(state.currentStep - 1);
  }, [state.currentStep, goToStep]);

  // Actualizar datos del checkout
  const setShippingAddress = useCallback((address) => {
    dispatch({ type: CHECKOUT_ACTIONS.SET_SHIPPING_ADDRESS, payload: address });
  }, []);

  const setPaymentMethod = useCallback((method) => {
    dispatch({ type: CHECKOUT_ACTIONS.SET_PAYMENT_METHOD, payload: method });
  }, []);

  const setOrderTotal = useCallback((total) => {
    dispatch({ type: CHECKOUT_ACTIONS.SET_ORDER_TOTAL, payload: total });
  }, []);
  // Crear pedido pendiente
  const createPendingOrder = useCallback(async (shippingAddress) => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para continuar');
      return { success: false, error: 'No autenticado' };
    }

    // Validaciones básicas
    if (!shippingAddress || shippingAddress.trim().length < 10) {
      toast.error('Dirección de entrega inválida');
      return { success: false, error: 'Dirección inválida' };
    }

    dispatch({ type: CHECKOUT_ACTIONS.SET_LOADING, payload: true });

    try {
      const result = await checkoutService.createPendingOrder({ 
        direccionEntrega: shippingAddress.trim() 
      });

      if (result.success) {
        // Actualizar estado del checkout
        dispatch({ type: CHECKOUT_ACTIONS.SET_ORDER_ID, payload: result.data.idPedido });
        dispatch({ type: CHECKOUT_ACTIONS.SET_ORDER_TOTAL, payload: result.data.total });
        setShippingAddress(shippingAddress.trim());
        
        // Feedback exitoso
        toast.success('Pedido creado exitosamente');
        console.log('✅ Pedido pendiente creado:', result.data);
        
        return { success: true, data: result.data };
      } else {
        dispatch({ type: CHECKOUT_ACTIONS.SET_ERROR, payload: result.error });
        toast.error(result.error || 'Error al crear el pedido');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = 'Error de conexión al crear el pedido';
      dispatch({ type: CHECKOUT_ACTIONS.SET_ERROR, payload: errorMsg });
      toast.error(errorMsg);
      console.error('❌ Error createPendingOrder:', error);
      return { success: false, error: errorMsg };
    } finally {
      dispatch({ type: CHECKOUT_ACTIONS.SET_LOADING, payload: false });
    }
  }, [isAuthenticated, setShippingAddress]);

  // Obtener información de pedido existente
  const fetchOrderInfo = useCallback(async (orderId) => {
    dispatch({ type: CHECKOUT_ACTIONS.SET_LOADING, payload: true });

    try {
      const result = await checkoutService.getOrderInfo(orderId);

      if (result.success) {
        const order = result.data;
        dispatch({ type: CHECKOUT_ACTIONS.SET_ORDER_TOTAL, payload: order.total });
        setShippingAddress(order.direccionEntrega || 'Dirección no especificada');
        
        return { success: true, data: order };
      } else {
        dispatch({ type: CHECKOUT_ACTIONS.SET_ERROR, payload: result.error });
        toast.error(result.error);
        return { success: false, error: result.error };
      }    } catch (error) {
      console.error('Error al cargar pedido:', error);
      const errorMsg = 'Error al cargar información del pedido';
      dispatch({ type: CHECKOUT_ACTIONS.SET_ERROR, payload: errorMsg });
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      dispatch({ type: CHECKOUT_ACTIONS.SET_LOADING, payload: false });
    }
  }, [setShippingAddress]);

  // Reset del checkout
  const resetCheckout = useCallback(() => {
    dispatch({ type: CHECKOUT_ACTIONS.RESET_CHECKOUT });
  }, []);
  const value = useMemo(() => ({
    // Estado
    ...state,
    
    // Acciones de navegación
    initializeCheckout,
    goToStep,
    nextStep,
    prevStep,
    
    // Acciones de datos
    setShippingAddress,
    setPaymentMethod,
    setOrderTotal,
    createPendingOrder,
    fetchOrderInfo,
    resetCheckout
  }), [
    state,
    initializeCheckout,
    goToStep,
    nextStep,
    prevStep,
    setShippingAddress,
    setPaymentMethod,
    setOrderTotal,
    createPendingOrder,
    fetchOrderInfo,
    resetCheckout
  ]);

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};

CheckoutProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout debe usarse dentro de CheckoutProvider');
  }
  return context;
};

export { CHECKOUT_ACTIONS };
