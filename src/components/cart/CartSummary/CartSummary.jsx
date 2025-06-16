import React from 'react';
import PropTypes from 'prop-types';
import { formatPrice } from '../../../utils/cartHelpers';
import styles from './CartSummary.module.css';

/**
 * Componente de resumen del carrito
 * Replicando el diseño sticky del original
 */
const CartSummary = ({ 
  total, 
  itemCount, 
  isEmpty, 
  onProceedToCheckout, 
  onClearCart 
}) => {
  return (
    <div className={styles.cartSummarySticky}>
      <div className={styles.cartSummaryCard}>
        {/* Header */}
        <div className={styles.summaryHeader}>
          <h4 className={styles.summaryTitle}>
            <i className="bi bi-receipt me-2"></i>
            Resumen de compra
          </h4>
        </div>
        
        {/* Body */}
        <div className={styles.summaryBody}>
          <div className={styles.summaryRow}>
            <span>Subtotal:</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.shippingRow}`}>
            <span>Envío:</span>
            <span className="text-success">Gratis</span>
          </div>
          <hr className={styles.summaryDivider} />
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span className={styles.totalLabel}>Total:</span>
            <span className={styles.totalAmount}>
              {formatPrice(total)}
            </span>
          </div>
        </div>
        
        {/* Footer */}
        <div className={styles.summaryFooter}>
          <button 
            className={`btn btn-success ${styles.btnCheckout}`}
            disabled={isEmpty}
            onClick={onProceedToCheckout}
          >
            <i className="bi bi-credit-card me-2"></i>
            Proceder al pago
          </button>
          
          {!isEmpty && (
            <button 
              className={`btn btn-outline-danger ${styles.btnEmptyCart} mt-2`}
              onClick={onClearCart}
            >
              <i className="bi bi-trash me-2"></i>
              Vaciar carrito
            </button>
          )}
        </div>
        
        {/* Información de seguridad */}
        <div className={styles.cartSecurityInfo}>
          <div className={styles.securityItem}>
            <i className="bi bi-shield-check text-success me-2"></i>
            <small>Compra 100% segura</small>
          </div>
          <div className={styles.securityItem}>
            <i className="bi bi-truck text-success me-2"></i>
            <small>Envío gratis en tu pedido</small>
          </div>
        </div>
      </div>
    </div>
  );
};

CartSummary.propTypes = {
  total: PropTypes.number.isRequired,
  itemCount: PropTypes.number.isRequired,
  isEmpty: PropTypes.bool.isRequired,
  onProceedToCheckout: PropTypes.func.isRequired,
  onClearCart: PropTypes.func.isRequired
};

export default CartSummary;
