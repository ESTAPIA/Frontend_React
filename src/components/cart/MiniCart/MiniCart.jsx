import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useCart } from '../../../hooks/useCart';
import { formatPrice } from '../../../utils/cartHelpers';
import styles from './MiniCart.module.css';

/**
 * Componente MiniCart - Modal deslizable del carrito
 * Replica exactamente el comportamiento del modal del navbar-user.ejs original
 */
const MiniCart = ({ show, onClose }) => {
  const {
    items,
    total,
    itemCount,
    loading,
    error,
    updateQuantity,
    removeItem,
    clearCart,
    isEmpty
  } = useCart();

  // ✅ AÑADIR: Estado local para operaciones específicas
  const [localLoading, setLocalLoading] = useState(new Set());
  // ✅ SIMPLIFICADO: Solo manejar el estado del body
  useEffect(() => {
    if (show) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };  }, [show]);
  // ✅ MEJORAR: Handler con loading específico
  const handleQuantityChange = useCallback(async (idProducto, nuevaCantidad) => {
    setLocalLoading(prev => new Set([...prev, `qty-${idProducto}`]));
    
    try {
      if (nuevaCantidad <= 0) {
        await removeItem(idProducto);
      } else {
        await updateQuantity(idProducto, nuevaCantidad);
      }
    } finally {
      setLocalLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(`qty-${idProducto}`);
        return newSet;
      });
    }
  }, [removeItem, updateQuantity, setLocalLoading]);
  // ✅ MEJORAR: Handler de eliminar con loading y smooth scroll
  const handleRemoveItem = useCallback(async (idProducto) => {
    setLocalLoading(prev => new Set([...prev, `remove-${idProducto}`]));
    
    try {
      await removeItem(idProducto);
      // Smooth scroll al top del modal tras eliminar
      const modalBody = document.querySelector(`.${styles.modalBody}`);
      if (modalBody) {
        modalBody.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setLocalLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(`remove-${idProducto}`);
        return newSet;
      });
    }
  }, [removeItem, setLocalLoading]);

  // Handler para vaciar carrito
  const handleClearCart = async () => {
    if (window.confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      await clearCart();
    }
  };
  if (!show) return null;
  return (
    <>
      {/* ✅ Backdrop simplificado */}
      <div 
        className="modal-backdrop fade show"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        style={{ zIndex: 1040 }}
        role="button"
        tabIndex={0}
        aria-label="Cerrar carrito"
      />
      
      {/* ✅ Modal con z-index correcto */}
      <div 
        className={`modal fade show`} 
        style={{ 
          display: 'block',
          zIndex: 1050 
        }}
        tabIndex="-1" 
        aria-labelledby="miniCartLabel" 
        aria-hidden="false"
        aria-modal="true"
      >
      <div className={`modal-dialog modal-dialog-right ${styles.modalDialog}`}>
        <div className={`modal-content ${styles.modalContent}`}>
          {/* Header del modal */}
          <div className={`modal-header ${styles.modalHeader}`}>
            <h5 className="modal-title" id="miniCartLabel">
              <i className="bi bi-cart4 me-2"></i>
              Mi Carrito
              {itemCount > 0 && (
                <span className={`badge ${styles.itemCountBadge} ms-2`}>
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              )}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Cerrar carrito"
            />
          </div>

          {/* Body del modal */}
          <div className={`modal-body ${styles.modalBody}`}>
            {/* Estado de loading */}
            {loading && (
              <div className={`${styles.loadingState} text-center py-4`}>
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Cargando carrito...</span>
                </div>
                <p className="mt-2 text-muted">Cargando tu carrito...</p>
              </div>
            )}

            {/* Estado de error */}
            {error && !loading && (
              <div className="alert alert-warning" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {/* Carrito vacío */}
            {!loading && isEmpty && (
              <div className={`${styles.emptyState} text-center py-4`}>
                <i className="bi bi-cart-x" style={{ fontSize: '3rem', color: 'var(--medium-gray)' }}></i>
                <h6 className="mt-3 text-muted">Tu carrito está vacío</h6>
                <p className="text-muted">¡Agrega algunos productos para empezar!</p>
                <Link 
                  to="/catalog" 
                  className="btn btn-primary btn-sm"
                  onClick={onClose}
                >
                  <i className="bi bi-shop me-1"></i>
                  Explorar Productos
                </Link>
              </div>
            )}

            {/* Lista de productos */}
            {!loading && !isEmpty && (
              <div className={`${styles.cartItems}`}>
                {items.map((item, index) => (
                  <div 
                    key={item.idProducto} 
                    className={`${styles.cartItem}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >                    {/* Imagen del producto */}
                    <div className={styles.itemImage}>
                      <img 
                        src={item.imagen || '/images/placeholder-product.jpg'} 
                        alt={item.nombre}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = '/images/placeholder-product.jpg';
                        }}
                      />
                    </div>

                    {/* Información del producto */}
                    <div className={styles.itemInfo}>
                      <h6 className={styles.itemName}>{item.nombre}</h6>
                      <p className={styles.itemPrice}>
                        {formatPrice(item.precio)} c/u
                      </p>                        {/* Controles de cantidad */}
                        <div className={styles.quantityControls}>                          <button 
                            className={`btn btn-sm ${styles.quantityBtn}`}
                            onClick={() => handleQuantityChange(item.idProducto, item.cantidad - 1)}
                            disabled={loading || localLoading.has(`qty-${item.idProducto}`)}
                            aria-label="Disminuir cantidad"
                          >
                            {localLoading.has(`qty-${item.idProducto}`) ? (
                              <span className="spinner-border spinner-border-sm" role="status" aria-label="Actualizando..." />
                            ) : (
                              <i className="bi bi-dash"></i>
                            )}
                          </button>
                          
                          <span className={styles.quantityDisplay}>
                            {item.cantidad}
                          </span>
                          
                          <button 
                            className={`btn btn-sm ${styles.quantityBtn}`}
                            onClick={() => handleQuantityChange(item.idProducto, item.cantidad + 1)}
                            disabled={loading || localLoading.has(`qty-${item.idProducto}`)}
                            aria-label="Aumentar cantidad"
                          >
                            {localLoading.has(`qty-${item.idProducto}`) ? (
                              <span className="spinner-border spinner-border-sm" />
                            ) : (
                              <i className="bi bi-plus"></i>
                            )}
                          </button>
                        </div>
                    </div>

                    {/* Subtotal y botón eliminar */}
                    <div className={styles.itemActions}>
                      <div className={styles.itemSubtotal}>
                        {formatPrice(item.subtotal)}
                      </div>                      <button 
                        className={`btn btn-sm ${styles.removeBtn}`}
                        onClick={() => handleRemoveItem(item.idProducto)}
                        disabled={loading || localLoading.has(`remove-${item.idProducto}`)}
                        title="Eliminar producto"
                        aria-label={`Eliminar ${item.nombre} del carrito`}
                      >
                        {localLoading.has(`remove-${item.idProducto}`) ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          <i className="bi bi-trash"></i>
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Botón vaciar carrito */}
                {items.length > 1 && (
                  <div className="text-end mt-3">
                    <button 
                      className={`btn btn-sm ${styles.clearCartBtn}`}
                      onClick={handleClearCart}
                      disabled={loading}
                    >
                      <i className="bi bi-trash me-1"></i>
                      Vaciar carrito
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer del modal */}
          {!isEmpty && (
            <div className={`modal-footer ${styles.modalFooter}`}>
              <div className={styles.cartSummary}>
                <div className={styles.totalSection}>
                  <span className={styles.totalLabel}>Total a pagar:</span>
                  <span className={styles.totalAmount}>
                    {formatPrice(total)}
                  </span>
                </div>
                
                <div className={styles.cartActions}>
                  <Link 
                    to="/cart" 
                    className={`btn ${styles.viewCartBtn}`}
                    onClick={onClose}
                  >
                    <i className="bi bi-eye me-1"></i>
                    Ver Carrito Completo
                  </Link>
                  
                  <Link 
                    to="/checkout" 
                    className={`btn btn-primary ${styles.checkoutBtn}`}
                    onClick={onClose}
                  >
                    <i className="bi bi-credit-card me-1"></i>
                    Proceder al Pago
                  </Link>                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

MiniCart.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default MiniCart;
