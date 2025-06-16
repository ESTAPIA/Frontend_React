import React, { useState, useEffect } from 'react';
import { useCheckout } from '../../../context/CheckoutContext';
import checkoutService from '../../../services/checkoutService';
import { formatPrice } from '../../../utils/cartHelpers';
import styles from './PaymentStep.module.css';

/**
 * Paso 2: Método de Pago
 * Replica exactamente la verificación y selección de cuentas bancarias del original
 */
const PaymentStep = () => {
  const {
    orderId,
    orderTotal,
    paymentMethod,
    loading: checkoutLoading,
    setPaymentMethod,
    nextStep,
    prevStep
  } = useCheckout();

  // Estados locales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accountsWithBalance, setAccountsWithBalance] = useState([]);
  const [accountsWithoutBalance, setAccountsWithoutBalance] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(paymentMethod);
  const [hasAccounts, setHasAccounts] = useState(false);
  // Cargar cuentas bancarias al montar
  useEffect(() => {
    if (orderId) {
      loadBankAccounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // Función para cargar cuentas bancarias
  const loadBankAccounts = async () => {
    if (!orderId) {
      setError('ID de pedido no disponible para cargar cuentas');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`🏦 Cargando cuentas bancarias para pedido ID: ${orderId}. Total: ${orderTotal}`);
      
      const result = await checkoutService.verifyBankAccounts(orderId);
      
      if (result.success) {
        const data = result.data;
        
        if (data.tieneCuentas) {
          setAccountsWithBalance(data.cuentasConSaldo || []);
          setAccountsWithoutBalance(data.cuentasSinSaldo || []);
          setHasAccounts(true);
          
          console.log('✅ Cuentas cargadas:', {
            conSaldo: data.cuentasConSaldo?.length || 0,
            sinSaldo: data.cuentasSinSaldo?.length || 0
          });
        } else {
          setHasAccounts(false);
          console.warn('⚠️ No se encontraron cuentas bancarias');
        }
      } else {
        setError(result.error);
        console.error('❌ Error al verificar cuentas:', result.error);
      }
    } catch (error) {
      const errorMsg = 'Error al cargar las cuentas bancarias';
      setError(errorMsg);
      console.error('❌ Error inesperado:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handler para seleccionar cuenta
  const handleAccountSelect = (account) => {
    // Verificar que la cuenta tenga saldo suficiente
    if (account.saldo < orderTotal) {
      // Mostrar feedback visual de error (ya manejado en el CSS)
      return;
    }

    // Actualizar selección
    const accountData = {
      cuentaId: account.cuentaId,
      tipoCuenta: account.tipoCuenta,
      saldo: account.saldo
    };

    setSelectedAccount(accountData);
    setPaymentMethod(accountData);
    
    console.log('✅ Cuenta seleccionada:', accountData);
  };

  // Handler para continuar al siguiente paso
  const handleContinue = () => {
    if (!selectedAccount) {
      console.warn('⚠️ Intento de continuar sin seleccionar cuenta');
      return;
    }
    
    console.log('➡️ Continuando al paso 3 con cuenta:', selectedAccount);
    nextStep();
  };

  // Handler para volver al paso anterior
  const handleBack = () => {
    prevStep();
  };

  // Renderizar estado de loading
  if (loading || checkoutLoading) {
    return (
      <div className={styles.paymentStep}>
        <div className={styles.loadingState}>
          <div className="text-center py-4">
            <div className="spinner-border text-primary mb-3">
              <span className="visually-hidden">Cargando cuentas bancarias...</span>
            </div>
            <p className="mb-0">Verificando tus cuentas bancarias...</p>
            <small className="text-muted">Esto puede tomar unos segundos</small>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar estado de error
  if (error) {
    return (
      <div className={styles.paymentStep}>
        <div className="alert alert-danger">
          <div className="d-flex align-items-center">
            <i className="bi bi-x-circle-fill me-3 fs-4"></i>
            <div>
              <strong>Error al cargar cuentas</strong>
              <p className="mb-2">{error}</p>
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={loadBankAccounts}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Reintentar
              </button>
            </div>
          </div>
        </div>
        
        {/* Botón de retroceso */}
        <div className={styles.actionArea}>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleBack}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Volver a la Dirección
          </button>
        </div>
      </div>
    );
  }

  // Renderizar cuando no hay cuentas
  if (!hasAccounts) {
    return (
      <div className={styles.paymentStep}>
        <div className="alert alert-warning">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
            <div>
              <strong>No hay cuentas disponibles</strong>
              <p className="mb-0">No se encontraron cuentas bancarias. Por favor contacta con soporte.</p>
            </div>
          </div>
        </div>
        
        {/* Botón de retroceso */}
        <div className={styles.actionArea}>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleBack}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Volver a la Dirección
          </button>
        </div>
      </div>
    );
  }

  // Renderizar lista de cuentas
  const hasAnySufficientFundsAccount = accountsWithBalance.length > 0;

  return (
    <div className={styles.paymentStep}>
      <div className={styles.paymentForm}>
        {/* Header de la sección */}
        <div className={styles.sectionHeader}>
          <h5>
            <i className="bi bi-bank me-2"></i>
            Tus Cuentas Bancarias
          </h5>
          <p className="text-muted mb-0">
            Selecciona la cuenta desde la cual realizarás el pago:
          </p>
        </div>

        {/* Grid de cuentas bancarias */}
        <div className={styles.accountsGrid}>
          {/* Cuentas CON saldo suficiente */}
          {accountsWithBalance.map((account) => (
            <div
              key={`sufficient-${account.cuentaId}`}
              className={`
                ${styles.accountOption}
                ${selectedAccount?.cuentaId === account.cuentaId ? styles.selected : ''}
              `}
              onClick={() => handleAccountSelect(account)}
            >
              <div className={styles.selectionIndicator}></div>
              <div className={styles.accountHeader}>
                <div className={styles.accountType}>{account.tipoCuenta}</div>
              </div>
              <div className={styles.accountNumber}>
                <i className="bi bi-credit-card me-2"></i>
                ID: {account.cuentaId}
              </div>
              <div className={styles.accountBalance}>
                <span className={styles.balanceLabel}>Saldo disponible:</span>
                <span className={styles.balanceAmount}>
                  {formatPrice(account.saldo)}
                </span>
              </div>
            </div>
          ))}

          {/* Cuentas SIN saldo suficiente */}
          {accountsWithoutBalance.map((account) => (
            <div
              key={`insufficient-${account.cuentaId}`}
              className={`${styles.accountOption} ${styles.insufficientFunds}`}
            >
              <div className={styles.selectionIndicator}></div>
              <div className={styles.accountHeader}>
                <div className={styles.accountType}>{account.tipoCuenta}</div>
              </div>
              <div className={styles.accountNumber}>
                <i className="bi bi-credit-card me-2"></i>
                ID: {account.cuentaId}
              </div>
              <div className={styles.accountBalance}>
                <span className={styles.balanceLabel}>Saldo disponible:</span>
                <span className={`${styles.balanceAmount} ${styles.balanceInsufficient}`}>
                  {formatPrice(account.saldo)}
                </span>
              </div>
              <div className="mt-2">
                <small className="text-danger">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  Saldo insuficiente (necesitas {formatPrice(orderTotal)})
                </small>
              </div>
            </div>
          ))}
        </div>

        {/* Nota de seguridad */}
        {hasAnySufficientFundsAccount && (
          <div className={styles.securityNote}>
            <i className="bi bi-shield-check"></i>
            <p>El pago se procesará de forma segura desde la cuenta seleccionada</p>
          </div>
        )}

        {/* Mensaje cuando solo hay cuentas sin saldo */}
        {!hasAnySufficientFundsAccount && accountsWithoutBalance.length > 0 && (
          <div className="alert alert-warning mt-3">
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
              <div>
                <strong>Fondos insuficientes</strong>
                <p className="mb-0">
                  Ninguna de tus cuentas tiene saldo suficiente para este pedido 
                  ({formatPrice(orderTotal)}). Por favor, recarga una cuenta o contacta soporte.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Área de navegación */}
        <div className={styles.actionArea}>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleBack}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Volver a la Dirección
          </button>
          
          <button
            type="button"
            className={`btn btn-primary ${styles.continueBtn}`}
            onClick={handleContinue}
            disabled={!selectedAccount}
          >
            {selectedAccount ? (
              <>
                <i className="bi bi-check2 me-2"></i>
                Continuar con {selectedAccount.tipoCuenta}
                <i className="bi bi-arrow-right ms-2"></i>
              </>
            ) : (
              <>
                <i className="bi bi-check2 me-2"></i>
                Continuar al Resumen
                <i className="bi bi-arrow-right ms-2"></i>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;
