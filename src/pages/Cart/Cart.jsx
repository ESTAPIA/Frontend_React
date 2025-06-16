import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import CartSummary from '../../components/cart/CartSummary/CartSummary';
import { formatPrice } from '../../utils/cartHelpers';
import styles from './Cart.module.css';

/**
 * Página completa del carrito de compras
 * Replica exactamente la funcionalidad del view.ejs original
 */
const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    items,
    total,
    loading,
    error,
    isEmpty,
    updateQuantity,
    removeItem,
    clearCart,
    loadCart
  } = useCart();
  // Estados locales
  const [processingItems, setProcessingItems] = useState(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(null);

  // ✅ AÑADIR: Smooth scroll al top después de operaciones
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Verificar autenticación al montar
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login?redirect=/cart');
      return;
    }
    loadCart();
  }, [isAuthenticated, navigate, loadCart]);

  // Handlers para cantidad
  const handleQuantityDecrease = async (idProducto, currentQuantity) => {
    if (currentQuantity === 1) {
      // Si es 1, mostrar confirmación de eliminación
      const product = items.find(item => item.idProducto === idProducto);
      setShowConfirmModal({
        type: 'remove',
        productId: idProducto,
        productName: product?.nombre || 'Producto'
      });
    } else {
      await handleQuantityUpdate(idProducto, currentQuantity - 1);
    }
  };

  const handleQuantityIncrease = async (idProducto, currentQuantity) => {
    await handleQuantityUpdate(idProducto, currentQuantity + 1);
  };

  const handleQuantityUpdate = async (idProducto, newQuantity) => {
    setProcessingItems(prev => new Set([...prev, idProducto]));
    
    try {
      const result = await updateQuantity(idProducto, newQuantity);
      if (result.success) {
        // El toast ya se muestra desde CartContext
      }
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(idProducto);
        return newSet;
      });
    }
  };

  // Handler para eliminar producto
  const handleRemoveProduct = async (idProducto) => {
    const product = items.find(item => item.idProducto === idProducto);
    setShowConfirmModal({
      type: 'remove',
      productId: idProducto,
      productName: product?.nombre || 'Producto'
    });
  };

  // Handler para vaciar carrito
  const handleClearCart = () => {
    setShowConfirmModal({
      type: 'clear'
    });
  };
  // ✅ MEJORAR: Ejecutar acción confirmada con feedback mejorado
  const executeConfirmedAction = async () => {
    if (!showConfirmModal) return;

    try {
      if (showConfirmModal.type === 'remove') {
        await removeItem(showConfirmModal.productId);
        // ✅ Scroll suave después de eliminar
        scrollToTop();
      } else if (showConfirmModal.type === 'clear') {
        await clearCart();
        scrollToTop();
      }
    } finally {
      setShowConfirmModal(null);
    }
  };

  // Handler para proceder al checkout
  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  // Render estados especiales
  if (loading) {
    return (
      <main className={styles.cartPage}>
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Cargando carrito...</span>
            </div>
            <h4 className="text-muted">Cargando tu carrito</h4>
            <p className="text-muted">Obteniendo tus productos...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.cartPage}>
        <div className="container py-5">
          <div className="alert alert-danger text-center">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Error al cargar el carrito:</strong> {error}
            <div className="mt-3">
              <button className="btn btn-outline-danger me-2" onClick={loadCart}>
                <i className="bi bi-arrow-clockwise me-1"></i>Reintentar
              </button>
              <Link to="/catalog" className="btn btn-primary">
                <i className="bi bi-shop me-1"></i>Ir al Catálogo
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className={styles.cartPage}>
        {/* Hero Section */}
        <div className={styles.cartHeroSection}>
          <div className="container">
            <div className={styles.cartHeader}>
              <div className={styles.cartTitleSection}>
                <h1 className={styles.cartMainTitle}>
                  <i className="bi bi-cart3 me-3"></i>
                  Mi Carrito de Compras
                </h1>
                <p className={styles.cartSubtitle}>
                  Revisa tus productos antes de proceder al pago
                </p>
              </div>
              <div className={styles.cartActionsHeader}>
                <Link 
                  to="/catalog" 
                  className={`btn btn-outline-success ${styles.btnContinueShopping}`}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Seguir comprando
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="container">
          <div className={styles.cartMainContent}>
            <div className="row">
              {/* Columna de productos */}
              <div className="col-lg-8">
                <div className={styles.cartProductsSection}>
                  {/* Header de la sección */}
                  <div className={styles.cartSectionHeader}>                    <h3 className={styles.sectionTitle}>
                      Productos en tu carrito
                    </h3>
                    <div className={styles.cartCounterBadge}>
                      <i className="bi bi-box-seam me-1"></i>
                      <span>
                        {items.length} {items.length === 1 ? 'producto' : 'productos'}
                        {total > 0 && (
                          <small className="ms-2">
                            • Total: {formatPrice(total)}
                          </small>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Contenido del carrito */}
                  <div className={styles.cartItemsContainer}>
                    {isEmpty ? (
                      // Estado vacío
                      <div className={styles.emptyCartState}>
                        <i className="bi bi-cart-x" style={{ fontSize: '4rem', color: 'var(--medium-gray)' }}></i>
                        <h4 className={styles.emptyCartTitle}>Tu carrito está vacío</h4>
                        <p className={styles.emptyCartMessage}>
                          No hay productos en tu carrito de compras.
                        </p>
                        <Link 
                          to="/catalog" 
                          className={`btn btn-success ${styles.btnViewCatalog}`}
                        >
                          <i className="bi bi-grid me-2"></i>
                          Ver catálogo
                        </Link>
                      </div>
                    ) : (
                      // Tabla de productos
                      <div className={styles.tableResponsive}>
                        <table className={`table ${styles.cartTable}`}>
                          <thead>
                            <tr>
                              <th>Producto</th>
                              <th className="text-center">Precio</th>
                              <th className="text-center">Cantidad</th>
                              <th className="text-end">Subtotal</th>
                              <th className="text-center">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item) => {
                              const isProcessing = processingItems.has(item.idProducto);
                              const subtotal = item.precio * item.cantidad;

                              return (
                                <tr 
                                  key={item.idProducto}
                                  className={`${styles.cartItemRow} ${isProcessing ? styles.updating : ''}`}
                                  data-product-id={item.idProducto}
                                >
                                  {/* Producto */}
                                  <td className={styles.productInfoCell}>
                                    <div className={styles.productInfo}>
                                      <div className={styles.cartImageContainer}>                                        <img 
                                          src={item.imagen || '/images/placeholder-product.jpg'}
                                          alt={item.nombre}
                                          className={styles.cartItemImage}
                                          loading="lazy"
                                          onError={(e) => {
                                            e.target.src = '/images/placeholder-product.jpg';
                                          }}
                                        />
                                      </div>
                                      <div className={styles.productDetails}>
                                        <h6 className={styles.productName}>
                                          {item.nombre}
                                        </h6>
                                        <p className={styles.productDescription}>
                                          {item.descripcion || 'Sin descripción'}
                                        </p>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Precio */}
                                  <td className="text-center">
                                    <span className={styles.priceDisplay}>
                                      {formatPrice(item.precio)}
                                    </span>
                                  </td>

                                  {/* Cantidad */}
                                  <td className="text-center">
                                    <div className={styles.quantityControl}>                                      <button 
                                        type="button"
                                        className={`${styles.quantityBtn} ${styles.decreaseBtn}`}
                                        onClick={() => handleQuantityDecrease(item.idProducto, item.cantidad)}
                                        disabled={isProcessing}
                                        title="Disminuir cantidad"
                                      >
                                        {isProcessing ? (
                                          <span className="spinner-border spinner-border-sm" />
                                        ) : (
                                          <i className="bi bi-dash"></i>
                                        )}
                                      </button>
                                      <span className={styles.itemQuantity}>
                                        {item.cantidad}
                                      </span>
                                      <button 
                                        type="button"
                                        className={`${styles.quantityBtn} ${styles.increaseBtn}`}
                                        onClick={() => handleQuantityIncrease(item.idProducto, item.cantidad)}
                                        disabled={isProcessing}
                                        title="Aumentar cantidad"
                                      >
                                        {isProcessing ? (
                                          <span className="spinner-border spinner-border-sm" />
                                        ) : (
                                          <i className="bi bi-plus"></i>
                                        )}
                                      </button>
                                    </div>
                                  </td>

                                  {/* Subtotal */}
                                  <td className="text-end">
                                    <span className={styles.priceDisplay}>
                                      {formatPrice(subtotal)}
                                    </span>
                                  </td>

                                  {/* Acciones */}
                                  <td className="text-center">                                    <button 
                                      type="button"
                                      className={`btn btn-outline-danger btn-sm ${styles.removeBtn}`}
                                      onClick={() => handleRemoveProduct(item.idProducto)}
                                      disabled={isProcessing}
                                      title="Eliminar producto"
                                    >
                                      {isProcessing ? (
                                        <span className="spinner-border spinner-border-sm" />
                                      ) : (
                                        <i className="bi bi-trash"></i>
                                      )}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {/* Botón vaciar carrito */}
                        {items.length > 1 && (
                          <div className="text-end mt-3">
                            <button 
                              className={`btn btn-outline-danger ${styles.btnEmptyCart}`}
                              onClick={handleClearCart}
                              disabled={loading}
                            >
                              <i className="bi bi-trash me-2"></i>
                              Vaciar carrito
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Columna de resumen */}
              <div className="col-lg-4">
                <CartSummary 
                  total={total}
                  itemCount={items.length}
                  isEmpty={isEmpty}
                  onProceedToCheckout={handleProceedToCheckout}
                  onClearCart={handleClearCart}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {showConfirmModal.type === 'remove' ? 'Confirmar eliminación' : 'Vaciar carrito'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowConfirmModal(null)}
                ></button>
              </div>
              <div className="modal-body">
                {showConfirmModal.type === 'remove' ? (
                  <p>¿Estás seguro de que deseas eliminar <strong>{showConfirmModal.productName}</strong> del carrito?</p>
                ) : (
                  <>
                    <p>¿Estás seguro de que deseas eliminar todos los productos del carrito?</p>
                    <p className="text-danger">
                      <small>
                        <i className="bi bi-exclamation-triangle-fill me-1"></i> 
                        Esta acción no se puede deshacer.
                      </small>
                    </p>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowConfirmModal(null)}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={executeConfirmedAction}
                >
                  {showConfirmModal.type === 'remove' ? 'Eliminar' : 'Vaciar carrito'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;
