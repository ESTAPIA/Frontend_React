import React, { createContext, useReducer, useCallback, useEffect } from 'react';
import cartService from '../services/cartService';
import { useAuth } from '../hooks/useAuth';
import { 
  calculateCartTotal, 
  calculateItemCount, 
  syncWithLocalStorage,
  getCartFromLocalStorage,
  clearCartFromLocalStorage 
} from '../utils/cartHelpers';
import toast from 'react-hot-toast';

// Crear contexto
export const CartContext = createContext();

// Acciones del reducer
const CART_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOAD_CART_SUCCESS: 'LOAD_CART_SUCCESS',
  ADD_ITEM_SUCCESS: 'ADD_ITEM_SUCCESS',
  UPDATE_ITEM_SUCCESS: 'UPDATE_ITEM_SUCCESS',
  REMOVE_ITEM_SUCCESS: 'REMOVE_ITEM_SUCCESS',
  CLEAR_CART_SUCCESS: 'CLEAR_CART_SUCCESS',
  SET_MINI_CART_OPEN: 'SET_MINI_CART_OPEN',
  RESET_CART: 'RESET_CART'
};

// Estado inicial
const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
  loading: false,
  error: null,
  isMiniCartOpen: false,
  lastUpdated: null
};

// Reducer para manejar el estado del carrito
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? null : state.error
      };

    case CART_ACTIONS.SET_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case CART_ACTIONS.LOAD_CART_SUCCESS:
      const loadedItems = action.payload.items || [];
      return {
        ...state,
        items: loadedItems,
        total: calculateCartTotal(loadedItems),
        itemCount: calculateItemCount(loadedItems),
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      };

    case CART_ACTIONS.ADD_ITEM_SUCCESS:
    case CART_ACTIONS.UPDATE_ITEM_SUCCESS:
    case CART_ACTIONS.REMOVE_ITEM_SUCCESS:
      const updatedItems = action.payload.items || state.items;
      return {
        ...state,
        items: updatedItems,
        total: calculateCartTotal(updatedItems),
        itemCount: calculateItemCount(updatedItems),
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      };

    case CART_ACTIONS.CLEAR_CART_SUCCESS:
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      };

    case CART_ACTIONS.SET_MINI_CART_OPEN:
      return {
        ...state,
        isMiniCartOpen: action.payload
      };

    case CART_ACTIONS.RESET_CART:
      return {
        ...initialState
      };

    default:
      return state;
  }
};

// Provider del contexto
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Cargar carrito al inicializar o cuando cambie la autenticación
  const loadCart = useCallback(async (showLoading = true) => {
    if (!isAuthenticated) {
      dispatch({ type: CART_ACTIONS.RESET_CART });
      clearCartFromLocalStorage();
      return;
    }

    if (showLoading) {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
    }

    try {
      const result = await cartService.getCart();
      
      if (result.success) {
        dispatch({
          type: CART_ACTIONS.LOAD_CART_SUCCESS,
          payload: result.data
        });
        
        // Sincronizar con localStorage como backup
        syncWithLocalStorage(result.data.items || []);
      } else {
        // Si falla la carga desde API, intentar localStorage
        const localItems = getCartFromLocalStorage();
        dispatch({
          type: CART_ACTIONS.LOAD_CART_SUCCESS,
          payload: { items: localItems }
        });
        
        if (showLoading) {
          dispatch({
            type: CART_ACTIONS.SET_ERROR,
            payload: result.error
          });
        }
      }
    } catch (error) {
      console.error('Error al cargar carrito:', error);
      
      // Fallback a localStorage
      const localItems = getCartFromLocalStorage();
      dispatch({
        type: CART_ACTIONS.LOAD_CART_SUCCESS,
        payload: { items: localItems }
      });
      
      if (showLoading) {
        dispatch({
          type: CART_ACTIONS.SET_ERROR,
          payload: 'Error al cargar el carrito'
        });
      }
    }
  }, [isAuthenticated]);

  // Agregar item al carrito
  const addItem = useCallback(async (idProducto, cantidad = 1) => {
    if (!isAuthenticated) {
      toast.error('Inicia sesión para agregar productos al carrito');
      return { success: false };
    }

    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

    try {
      const result = await cartService.addItem(idProducto, cantidad);
      
      if (result.success) {
        // Recargar carrito para obtener datos actualizados
        await loadCart(false);
        toast.success(result.message);
        return { success: true };
      } else {
        dispatch({
          type: CART_ACTIONS.SET_ERROR,
          payload: result.error
        });
        
        // Mostrar error específico según el tipo
        if (result.type === 'INSUFFICIENT_STOCK') {
          toast.error('No hay suficiente stock disponible');
        } else {
          toast.error(result.error);
        }
        
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = 'Error al agregar producto al carrito';
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: errorMessage
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [isAuthenticated, loadCart]);

  // Actualizar cantidad de item
  const updateQuantity = useCallback(async (idProducto, cantidad) => {
    if (!isAuthenticated) return { success: false };

    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

    try {
      const result = await cartService.updateQuantity(idProducto, cantidad);
      
      if (result.success) {
        await loadCart(false);
        toast.success(result.message);
        return { success: true };
      } else {
        dispatch({
          type: CART_ACTIONS.SET_ERROR,
          payload: result.error
        });
        toast.error(result.error);
        return { success: false };
      }
    } catch (error) {
      const errorMessage = 'Error al actualizar cantidad';
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: errorMessage
      });
      toast.error(errorMessage);
      return { success: false };
    }
  }, [isAuthenticated, loadCart]);

  // Eliminar item del carrito
  const removeItem = useCallback(async (idProducto) => {
    if (!isAuthenticated) return { success: false };

    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

    try {
      const result = await cartService.removeItem(idProducto);
      
      if (result.success) {
        await loadCart(false);
        toast.success(result.message);
        return { success: true };
      } else {
        dispatch({
          type: CART_ACTIONS.SET_ERROR,
          payload: result.error
        });
        toast.error(result.error);
        return { success: false };
      }
    } catch (error) {
      const errorMessage = 'Error al eliminar producto';
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: errorMessage
      });
      toast.error(errorMessage);
      return { success: false };
    }
  }, [isAuthenticated, loadCart]);

  // Vaciar carrito
  const clearCart = useCallback(async () => {
    if (!isAuthenticated) return { success: false };

    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

    try {
      const result = await cartService.clearCart();
      
      if (result.success) {
        dispatch({ type: CART_ACTIONS.CLEAR_CART_SUCCESS });
        clearCartFromLocalStorage();
        toast.success(result.message);
        return { success: true };
      } else {
        dispatch({
          type: CART_ACTIONS.SET_ERROR,
          payload: result.error
        });
        toast.error(result.error);
        return { success: false };
      }
    } catch (error) {
      const errorMessage = 'Error al vaciar carrito';
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: errorMessage
      });
      toast.error(errorMessage);
      return { success: false };
    }
  }, [isAuthenticated]);

  // Abrir/cerrar mini carrito
  const toggleMiniCart = useCallback(() => {
    dispatch({
      type: CART_ACTIONS.SET_MINI_CART_OPEN,
      payload: !state.isMiniCartOpen
    });
  }, [state.isMiniCartOpen]);

  const openMiniCart = useCallback(() => {
    dispatch({
      type: CART_ACTIONS.SET_MINI_CART_OPEN,
      payload: true
    });
  }, []);

  const closeMiniCart = useCallback(() => {
    dispatch({
      type: CART_ACTIONS.SET_MINI_CART_OPEN,
      payload: false
    });
  }, []);

  // Efecto para cargar carrito cuando cambie autenticación
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Valor del contexto
  const value = {
    // Estado
    ...state,
    
    // Acciones
    loadCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    
    // Control del mini carrito
    toggleMiniCart,
    openMiniCart,
    closeMiniCart,
    
    // Información derivada
    isEmpty: state.items.length === 0,
    hasItems: state.items.length > 0
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
