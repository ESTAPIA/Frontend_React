import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../hooks/useCart';
import { useCheckout } from '../../../context/CheckoutContext';
import checkoutService from '../../../services/checkoutService';
import { formatPrice } from '../../../utils/cartHelpers';
import InvoiceModal from '../../../components/modals/InvoiceModal/InvoiceModal';
import styles from './ConfirmationStep.module.css';

/**
 * Paso 3: Confirmación Final
 * Replica exactamente el resumen, confirmación y modal de éxito del original
 */
const ConfirmationStep = () => {
  const navigate = useNavigate();
  const { items, total, loadCart } = useCart();
  const {
    orderId,
    orderTotal,
    shippingAddress,
    paymentMethod,
    shouldClearCart,
    prevStep,
    resetCheckout
  } = useCheckout();
  // Estados locales
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Validar que tenemos toda la información necesaria
  useEffect(() => {
    if (!orderId || !paymentMethod || !shippingAddress) {
      console.warn('⚠️ Información faltante en confirmación:', {
        orderId,
        paymentMethod: !!paymentMethod,
        shippingAddress: !!shippingAddress
      });
    }
  }, [orderId, paymentMethod, shippingAddress]);

  // Handler para confirmar pago
  const handleConfirmPayment = async () => {
    if (!orderId || !paymentMethod) {
      console.error('❌ No se puede procesar el pago: información faltante');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('🔄 Iniciando confirmación de pago:', {
        orderId,
        paymentMethod,
        shouldClearCart
      });

      const result = await checkoutService.confirmPayment(orderId, {
        cuentaId: paymentMethod.cuentaId,
        tipoCuenta: paymentMethod.tipoCuenta,
        clearCart: shouldClearCart
      });

      if (result.success) {
        // Éxito: Mostrar modal de confirmación
        setConfirmationData({
          orderId,
          total: orderTotal,
          paymentMethod: paymentMethod.tipoCuenta
        });
        setShowSuccessModal(true);        // Actualizar carrito si es necesario
        if (shouldClearCart) {
          loadCart();
        }

        console.log('✅ Pago procesado exitosamente');
      } else {
        console.error('❌ Error en el pago:', result.error);
        // El error se maneja en el UI con el estado isProcessing
      }
    } catch (error) {
      console.error('❌ Error inesperado en confirmación:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  // Handler para cerrar modal y navegar
  const handleModalClose = (destination = '/orders') => {
    setShowSuccessModal(false);
    resetCheckout();
    navigate(destination);
  };

  // Handler para abrir modal de factura
  const handleShowInvoice = () => {
    setShowInvoiceModal(true);
  };

  // Handler para cerrar modal de factura
  const handleCloseInvoice = () => {
    setShowInvoiceModal(false);
  };

  // Handler para volver al paso anterior
  const handleBack = () => {
    prevStep();
  };

  return (
    <div className={styles.confirmationStep}>
      <div className="row">
        {/* Columna izquierda: Resumen del pedido */}
        <div className="col-lg-7">
          <div className={styles.confirmationSection}>
            <div className={styles.sectionHeader}>
              <h5>
                <i className="bi bi-receipt me-2"></i>
                Resumen del Pedido
              </h5>
              <p className="text-muted mb-0">Productos incluidos en tu compra</p>
            </div>
            
            <div className={styles.orderSummaryCard}>
              {items.length > 0 ? (
                <div className={styles.orderSummary}>
                  {items.map((item) => (
                    <div key={item.idProducto} className={styles.summaryItem}>
                      <div className={styles.itemImage}>
                        <img 
                          src={item.imagen || '/images/placeholder-product.jpg'} 
                          alt={item.nombre}
                          loading="lazy"
                        />
                      </div>
                      <div className={styles.itemInfo}>
                        <h6 className={styles.itemName}>{item.nombre}</h6>
                        <p className={styles.itemDescription}>{item.descripcion}</p>
                        <div className={styles.itemDetails}>
                          <span className={styles.itemQuantity}>
                            Cantidad: <strong>{item.cantidad}</strong>
                          </span>
                          <span className={styles.itemPrice}>
                            {formatPrice(item.precio)} c/u
                          </span>
                        </div>
                      </div>
                      <div className={styles.itemTotal}>
                        {formatPrice(item.subtotal)}
                      </div>
                    </div>
                  ))}
                  
                  <div className={styles.summaryTotal}>
                    <div className={styles.totalRow}>
                      <span>Subtotal:</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className={styles.totalRow}>
                      <span>Envío:</span>
                      <span className="text-success">Gratis</span>
                    </div>
                    <div className={`${styles.totalRow} ${styles.finalTotal}`}>
                      <span>Total:</span>
                      <span>{formatPrice(orderTotal || total)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" />
                  <p className="mt-3 mb-0">Cargando resumen del pedido...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha: Información de confirmación */}
        <div className="col-lg-5">
          <div className={styles.confirmationInfoSticky}>
            {/* Card de información de entrega */}
            <div className={`${styles.confirmationCard} ${styles.deliveryCard}`}>
              <div className={styles.cardHeader}>
                <h6>
                  <i className="bi bi-truck me-2"></i>
                  Información de Entrega
                </h6>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.deliveryAddress}>
                  <strong>Dirección:</strong>
                  <p className={styles.addressText}>{shippingAddress}</p>
                </div>
                <div className={styles.deliveryEstimate}>
                  <div className={styles.estimateItem}>
                    <i className="bi bi-clock me-2"></i>
                    <span>Tiempo estimado: <strong>2-3 días hábiles</strong></span>
                  </div>
                  <div className={styles.estimateItem}>
                    <i className="bi bi-shield-check me-2"></i>
                    <span>Envío asegurado incluido</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card de método de pago */}
            <div className={`${styles.confirmationCard} ${styles.paymentCard}`}>
              <div className={styles.cardHeader}>
                <h6>
                  <i className="bi bi-credit-card me-2"></i>
                  Método de Pago
                </h6>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.paymentAccount}>
                  <strong>Cuenta seleccionada:</strong>
                  <p className={styles.accountText}>
                    {paymentMethod ? 
                      `${paymentMethod.tipoCuenta} (ID: ${paymentMethod.cuentaId})` : 
                      'Cargando información...'
                    }
                  </p>
                </div>
                <div className={styles.paymentTotal}>
                  <div className={styles.totalAmount}>
                    <span>Total a pagar:</span>
                    <strong className={styles.amount}>
                      {formatPrice(orderTotal || total)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Aviso importante */}
            <div className={`alert alert-warning ${styles.confirmationWarning}`}>
              <div className="d-flex align-items-start">
                <i className="bi bi-exclamation-triangle-fill me-3 mt-1"></i>
                <div>
                  <strong>Importante:</strong>
                  <p className="mb-0">
                    Al confirmar, el pago se procesará inmediatamente desde la cuenta 
                    seleccionada y no podrás cancelar la transacción.
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className={styles.confirmationActions}>
              <div className="d-flex justify-content-between align-items-center pt-4 border-top">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary btn-modern"
                  onClick={handleBack}
                  disabled={isProcessing}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Modificar Pago
                </button>
                
                <button 
                  type="button" 
                  id="confirm-payment-btn"
                  className={`btn btn-success btn-modern btn-confirm ${styles.confirmBtn} ${
                    isProcessing ? styles.btnLoading : ''
                  }`}
                  onClick={handleConfirmPayment}
                  disabled={isProcessing || !paymentMethod}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Procesando pago...
                      <i className="bi bi-lock-fill ms-2"></i>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-shield-check me-2"></i>
                      Confirmar y Pagar
                      <i className="bi bi-arrow-right ms-2"></i>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>      {/* Modal de éxito */}
      {showSuccessModal && confirmationData && (
        <SuccessModal 
          data={confirmationData}
          onClose={handleModalClose}
          onShowInvoice={handleShowInvoice}
        />
      )}

      {/* Modal de vista previa de factura */}
      {showInvoiceModal && confirmationData && (
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={handleCloseInvoice}
          orderId={confirmationData.orderId}
        />
      )}
    </div>
  );
};

/**
 * Modal de confirmación de éxito
 * Replica exactamente el modal del original
 */
const SuccessModal = ({ data, onClose, onShowInvoice }) => {
  const { orderId, total } = data;

  useEffect(() => {
    // Animación de entrada para el ícono
    const timer = setTimeout(() => {
      const successIcon = document.querySelector(`.${styles.successIcon}`);
      if (successIcon) {
        successIcon.classList.add(styles.animateSuccess);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);
  return (
    <div className={`modal fade show ${styles.successModal}`} style={{ display: 'block' }}>
      <div className={`modal-backdrop fade show ${styles.successBackdrop}`}></div>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className={`modal-content ${styles.orderSuccessContent}`}>
          <div className={`modal-header ${styles.successHeader}`}>
            <div className={styles.successIconContainer}>
              <i className={`bi bi-check-circle-fill ${styles.successIcon}`}></i>
            </div>
            <div className={styles.successText}>
              <h4 className="modal-title">¡Pedido Confirmado Exitosamente!</h4>
              <p className={styles.successSubtitle}>Tu compra ha sido procesada correctamente</p>
            </div>
          </div>
          
          <div className={`modal-body ${styles.successBody}`}>
            <div className={styles.orderSuccessDetails}>
              <div className={styles.orderInfoCard}>
                <div className={styles.orderNumberSection}>
                  <div className={styles.orderLabel}>Número de Pedido</div>
                  <div className={styles.orderNumber}>#{orderId}</div>
                </div>
                <div className={styles.orderAmountSection}>
                  <div className={styles.amountLabel}>Total Pagado</div>
                  <div className={styles.amountValue}>{formatPrice(total)}</div>
                </div>
              </div>
              
              <div className={styles.successMessage}>
                <div className={styles.messageIcon}>
                  <i className="bi bi-bag-check-fill"></i>
                </div>
                <div className={styles.messageContent}>
                  <h5>¡Gracias por tu compra!</h5>
                  <p>
                    Hemos recibido tu pedido y pronto comenzaremos a prepararlo. 
                    Recibirás un email de confirmación con todos los detalles.
                  </p>
                </div>
              </div>
              
              <div className={styles.nextSteps}>
                <h6>
                  <i className="bi bi-clock-history me-2"></i>
                  ¿Qué sigue?
                </h6>
                <div className={styles.stepsList}>
                  <div className={styles.stepItem}>
                    <div className={styles.stepIcon}>
                      <i className="bi bi-envelope-check"></i>
                    </div>
                    <div className={styles.stepText}>
                      <strong>Email de confirmación</strong>
                      <span>Recibirás los detalles en tu correo</span>
                    </div>
                  </div>
                  <div className={styles.stepItem}>
                    <div className={styles.stepIcon}>
                      <i className="bi bi-box-seam"></i>
                    </div>
                    <div className={styles.stepText}>
                      <strong>Preparación del pedido</strong>
                      <span>Empezamos a preparar tu orden</span>
                    </div>
                  </div>
                  <div className={styles.stepItem}>
                    <div className={styles.stepIcon}>
                      <i className="bi bi-truck"></i>
                    </div>
                    <div className={styles.stepText}>
                      <strong>Envío en 2-3 días hábiles</strong>
                      <span>Tu pedido llegará pronto</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`modal-footer ${styles.successFooter}`}>
            <div className={styles.footerActions}>              <button 
                type="button" 
                className="btn btn-success btn-modern btn-action"
                onClick={onShowInvoice}
              >
                <i className="bi bi-receipt"></i>
                {' '}Ver mi factura
              </button>
              <button 
                type="button"
                className="btn btn-primary btn-modern btn-action"
                onClick={() => onClose('/orders')}
              >
                <i className="bi bi-list-check me-2"></i>
                Ver Mis Pedidos
              </button>
              <button 
                type="button"
                className="btn btn-outline-secondary btn-modern btn-action"
                onClick={() => onClose('/catalog')}
              >
                <i className="bi bi-shop me-2"></i>
                Seguir Comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>);
};

SuccessModal.propTypes = {
  data: PropTypes.shape({
    orderId: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    paymentMethod: PropTypes.string
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onShowInvoice: PropTypes.func.isRequired
};

export default ConfirmationStep;
