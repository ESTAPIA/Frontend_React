import React from 'react';
import styles from './QuantitySelector.module.css';

const QuantitySelector = ({ 
  quantity, 
  onQuantityChange, 
  min = 1, 
  max = 99, 
  disabled = false,
  stock = null 
}) => {
  const handleDecrease = () => {
    if (quantity > min && !disabled) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    const maxAllowed = stock ? Math.min(max, stock) : max;
    if (quantity < maxAllowed && !disabled) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= min) {
      const maxAllowed = stock ? Math.min(max, stock) : max;
      const finalValue = Math.min(value, maxAllowed);
      onQuantityChange(finalValue);
    }
  };

  const maxAllowed = stock ? Math.min(max, stock) : max;
  const isDecreaseDisabled = disabled || quantity <= min;
  const isIncreaseDisabled = disabled || quantity >= maxAllowed;

  return (
    <div className={styles.quantitySelector}>
      <label className={styles.label}>Cantidad:</label>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.button}
          onClick={handleDecrease}
          disabled={isDecreaseDisabled}
          aria-label="Disminuir cantidad"
        >
          <i className="fas fa-minus"></i>
        </button>
        
        <input
          type="number"
          className={styles.input}
          value={quantity}
          onChange={handleInputChange}
          min={min}
          max={maxAllowed}
          disabled={disabled}
          aria-label="Cantidad"
        />
        
        <button
          type="button"
          className={styles.button}
          onClick={handleIncrease}
          disabled={isIncreaseDisabled}
          aria-label="Aumentar cantidad"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>
      
      {stock && (
        <small className={styles.stockInfo}>
          {stock > 0 ? (
            <span className={styles.inStock}>
              <i className="fas fa-check-circle"></i>
              {stock} disponibles
            </span>
          ) : (
            <span className={styles.outOfStock}>
              <i className="fas fa-times-circle"></i>
              Sin stock
            </span>
          )}
        </small>
      )}
    </div>
  );
};

export default QuantitySelector;
