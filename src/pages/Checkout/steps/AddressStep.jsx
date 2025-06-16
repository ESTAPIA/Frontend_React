import React, { useState, useEffect } from 'react';
import { useCheckout } from '../../../context/CheckoutContext';
import styles from './AddressStep.module.css';

/**
 * Paso 1: Dirección de Entrega
 * Replica exactamente el comportamiento del form original
 */
const AddressStep = () => {
  const {
    shippingAddress,
    loading,
    setShippingAddress,
    createPendingOrder,
    nextStep
  } = useCheckout();

  // Estados locales
  const [address, setAddress] = useState(shippingAddress || '');
  const [addressError, setAddressError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validación en tiempo real
  useEffect(() => {
    const trimmedAddress = address.trim();
    
    if (trimmedAddress.length > 0) {
      setIsValid(true);
      setAddressError('');
    } else {
      setIsValid(false);
      if (address.length > 0) { // Solo mostrar error si el usuario escribió algo
        setAddressError('Por favor ingrese una dirección de entrega');
      }
    }
  }, [address]);

  // Handler para cambio de dirección
  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    
    // Limpiar error inmediatamente cuando el usuario empiece a escribir
    if (addressError && value.trim().length > 0) {
      setAddressError('');
    }
  };

  // Handler para envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedAddress = address.trim();
    
    // Validación final
    if (!trimmedAddress) {
      setAddressError('Por favor ingrese una dirección de entrega');
      return;
    }

    // Validación de longitud mínima
    if (trimmedAddress.length < 10) {
      setAddressError('La dirección debe ser más específica (mínimo 10 caracteres)');
      return;
    }

    setIsSubmitting(true);
    setAddressError('');

    try {
      // Actualizar dirección en el contexto
      setShippingAddress(trimmedAddress);
      
      // Crear pedido pendiente
      const result = await createPendingOrder(trimmedAddress);
      
      if (result.success) {
        // Avanzar al siguiente paso
        nextStep();
      } else {
        setAddressError(result.error || 'Error al procesar la dirección');
      }
    } catch (error) {
      console.error('Error en AddressStep:', error);
      setAddressError('Error inesperado. Por favor intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.addressStep}>
      <form onSubmit={handleSubmit} className={styles.addressForm}>
        <div className={styles.formGroup}>
          <label htmlFor="shipping-address" className={styles.formLabel}>
            <i className="bi bi-house-door me-2"></i>
            Dirección completa de entrega:
          </label>
          <textarea
            id="shipping-address"
            className={`form-control ${styles.addressTextarea} ${
              isValid ? 'is-valid' : addressError ? 'is-invalid' : ''
            }`}
            rows={3}
            placeholder="Ej: Calle 123 #45-67, Barrio Centro, Bogotá, Colombia"
            value={address}
            onChange={handleAddressChange}
            disabled={isSubmitting || loading}
            required
          />
          
          {/* Feedback visual */}
          {addressError && (
            <div className={`invalid-feedback ${styles.errorMessage}`}>
              <i className="bi bi-exclamation-circle me-1"></i>
              {addressError}
            </div>
          )}
          
          {isValid && !addressError && (
            <div className={`valid-feedback ${styles.successMessage}`}>
              <i className="bi bi-check-circle me-1"></i>
              Dirección válida
            </div>
          )}
          
          <small className={styles.helpText}>
            <i className="bi bi-info-circle me-1"></i>
            Incluye información completa: calle, número, barrio y ciudad
          </small>
        </div>

        {/* Área de acción */}
        <div className={styles.actionArea}>
          <button
            type="submit"
            className={`btn btn-success ${styles.submitBtn} ${
              isSubmitting ? styles.loading : ''
            }`}
            disabled={!isValid || isSubmitting || loading}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Procesando...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-right me-2"></i>
                Continuar al Paso 2
              </>
            )}
          </button>
          
          {/* Información adicional */}
          <div className={styles.additionalInfo}>
            <div className={styles.securityNote}>
              <i className="bi bi-shield-check text-success me-2"></i>
              <small>Tu información está protegida con SSL</small>
            </div>
            <div className={styles.deliveryNote}>
              <i className="bi bi-truck text-primary me-2"></i>
              <small>Entrega gratuita en toda Colombia</small>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddressStep;
