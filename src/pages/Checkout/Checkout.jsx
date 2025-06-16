import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCheckout } from '../../context/CheckoutContext';
import StepIndicator from './components/StepIndicator/StepIndicator';
import CheckoutStep from './components/CheckoutStep/CheckoutStep';
import AddressStep from './steps/AddressStep';
import PaymentStep from './steps/PaymentStep';
import ConfirmationStep from './steps/ConfirmationStep';
import styles from './Checkout.module.css';

/**
 * Página principal del proceso de checkout
 * Implementa stepper de 3 pasos con navegación inteligente
 */
const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const {
    steps,
    currentStep,
    flowType,
    loading,
    error,
    orderId,
    orderTotal,
    initializeCheckout,
    fetchOrderInfo
  } = useCheckout();

  // Verificar autenticación al montar
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login?redirect=/checkout');
      return;
    }

    // Obtener orderId de URL si existe
    const orderIdFromUrl = searchParams.get('orderId');
    
    // Inicializar checkout según el flujo
    initializeCheckout(orderIdFromUrl);

    // Si es flujo de pedido existente, cargar información
    if (orderIdFromUrl) {
      fetchOrderInfo(orderIdFromUrl);
    }
  }, [isAuthenticated, navigate, searchParams, initializeCheckout, fetchOrderInfo]);  // Renderizar contenido de cada paso
  const renderStepContent = (stepId) => {
    switch (stepId) {
      case 1:
        return <AddressStep />;
      case 2:
        return <PaymentStep />;      case 3:
        return <ConfirmationStep />;
      default:
        return null;
    }
  };

  // Estados de loading y error
  if (loading) {
    return (
      <main className={styles.checkoutPage}>
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Cargando checkout...</span>
            </div>
            <h4 className="text-muted">Preparando tu proceso de compra</h4>
            <p className="text-muted">Un momento por favor...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.checkoutPage}>
        <div className="container py-5">
          <div className="alert alert-danger text-center">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Error en el checkout:</strong> {error}
            <div className="mt-3">
              <button 
                className="btn btn-outline-danger me-2" 
                onClick={() => window.location.reload()}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>Reintentar
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/cart')}
              >
                <i className="bi bi-cart me-1"></i>Volver al Carrito
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.checkoutPage}>
      <div className="container">
        {/* Header de la página */}
        <div className={styles.checkoutHeader}>
          <h1 className={styles.pageTitle}>            <i className="bi bi-bag-check me-3" />
            Finalizar Compra
          </h1>
          
          {/* Información del flujo */}
          <div className={styles.flowInfo}>
            {flowType === 'EXISTING_ORDER' ? (
              <div className="alert alert-info mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Procesando pago para pedido #{orderId}
                {orderTotal > 0 && (
                  <span className="ms-2">
                    • Total: <strong>${orderTotal.toLocaleString()}</strong>
                  </span>
                )}
              </div>
            ) : (
              <p className="text-muted mb-0">
                Complete los siguientes pasos para finalizar su compra
              </p>
            )}
          </div>
        </div>

        {/* Indicador de progreso */}
        <StepIndicator 
          steps={steps}
          currentStep={currentStep}
          flowType={flowType}
        />

        {/* Contenido de los pasos */}
        <div className={styles.stepsContainer}>
          {steps.map((step) => (
            <CheckoutStep
              key={step.id}
              stepNumber={step.id}
              currentStep={currentStep}
              title={
                <>
                  <i className={`bi bi-${step.id === 1 ? 'geo-alt-fill' : step.id === 2 ? 'credit-card-fill' : 'check-circle-fill'} me-2`}></i>
                  {step.title}
                </>
              }
              subtitle={
                step.id === 1 ? 'Proporciona la dirección donde quieres recibir tu pedido' :
                step.id === 2 ? 'Elige la cuenta desde la cual realizarás el pago' :
                'Revisa los detalles de tu pedido antes de proceder con el pago'
              }
            >
              {renderStepContent(step.id)}
            </CheckoutStep>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Checkout;
