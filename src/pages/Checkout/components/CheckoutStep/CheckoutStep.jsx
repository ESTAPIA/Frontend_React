import React from 'react';
import PropTypes from 'prop-types';
import styles from './CheckoutStep.module.css';

/**
 * Wrapper para cada paso del checkout
 * Maneja la visibilidad y animaciones de transición
 */
const CheckoutStep = ({ 
  stepNumber, 
  currentStep, 
  title, 
  subtitle, 
  children, 
  className = '' 
}) => {
  const isVisible = stepNumber === currentStep;
  const stepId = `checkout-step-${stepNumber}`;

  return (
    <div 
      id={stepId}
      className={`
        ${styles.checkoutStep} 
        ${isVisible ? styles.visible : styles.hidden}
        ${className}
      `}
      data-step={stepNumber}
    >
      <div className={styles.card}>
        {(title || subtitle) && (
          <div className={styles.cardHeader}>
            {title && (
              <h3 className={styles.cardTitle}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={styles.cardSubtitle}>
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        <div className={styles.cardBody}>
          {children}
        </div>
      </div>
    </div>
  );
};

CheckoutStep.propTypes = {
  stepNumber: PropTypes.number.isRequired,
  currentStep: PropTypes.number.isRequired,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

export default CheckoutStep;
