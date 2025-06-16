import React from 'react';
import PropTypes from 'prop-types';
import styles from './StepIndicator.module.css';

/**
 * Indicador visual de progreso del checkout
 * Replica exactamente el diseño del checkout original
 */
const StepIndicator = ({ steps, currentStep, flowType }) => {
  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  const isStepAccessible = (stepId) => {
    // En flujo de pedido existente, paso 1 no es accesible
    if (flowType === 'EXISTING_ORDER' && stepId === 1) {
      return false;
    }
    return true;
  };

  return (
    <div className={styles.checkoutSteps}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div 
            className={`
              ${styles.step} 
              ${styles[getStepStatus(step.id)]}
              ${!isStepAccessible(step.id) ? styles.disabled : ''}
            `}
          >
            <div className={styles.stepIcon}>
              {getStepStatus(step.id) === 'completed' ? (
                <i className="bi bi-check-lg"></i>
              ) : (
                step.icon
              )}
            </div>
            <div className={styles.stepText}>
              {step.title}
            </div>
          </div>
          
          {/* Línea de conexión (no mostrar después del último paso) */}
          {index < steps.length - 1 && (
            <div 
              className={`
                ${styles.stepLine} 
                ${getStepStatus(step.id) === 'completed' ? styles.completed : ''}
              `}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

StepIndicator.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired
  })).isRequired,
  currentStep: PropTypes.number.isRequired,
  flowType: PropTypes.oneOf(['NEW_ORDER', 'EXISTING_ORDER']).isRequired
};

export default StepIndicator;
