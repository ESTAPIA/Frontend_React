// src/components/common/ProductCard/ProductCard.jsx
import React from 'react';
import { formatPrice, generateStars } from '../../../data/mockProducts';
import styles from './ProductCard.module.css';

/**
 * Componente de tarjeta de producto
 * Muestra información básica del producto con diseño responsivo
 */
const ProductCard = ({ product, onAddToCart, onViewDetails }) => {
  const stars = generateStars(product.rating);
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product);
    }
  };

  return (
    <div className={`${styles.productCard} card h-100`} onClick={handleViewDetails}>
      {/* Badges */}
      <div className={styles.badges}>
        {product.isNew && (
          <span className={`${styles.badge} ${styles.badgeNew}`}>
            <i className="bi bi-star-fill me-1"></i>Nuevo
          </span>
        )}
        {hasDiscount && (
          <span className={`${styles.badge} ${styles.badgeDiscount}`}>
            -{discountPercentage}%
          </span>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className={`${styles.badge} ${styles.badgeLowStock}`}>
            <i className="bi bi-exclamation-triangle-fill me-1"></i>Últimas unidades
          </span>
        )}
      </div>

      {/* Imagen del producto */}
      <div className={styles.imageContainer}>
        <div className={styles.imagePlaceholder}>
          <i className="bi bi-motorcycle" style={{ fontSize: '3rem', color: 'var(--primary-green)' }}></i>
          <p className="text-muted mt-2 mb-0">{product.category}</p>
        </div>
        
        {/* Overlay de acciones rápidas */}
        <div className={styles.imageOverlay}>
          <button 
            className={`${styles.quickAction} btn btn-light btn-sm`}
            title="Vista rápida"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleViewDetails();
            }}
          >
            <i className="bi bi-eye"></i>
          </button>
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="card-body d-flex flex-column">
        {/* Información principal */}
        <div className={styles.productInfo}>
          <h5 className={`${styles.productName} card-title`}>{product.name}</h5>
          <p className={`${styles.productDescription} card-text text-muted`}>
            {product.description}
          </p>
        </div>

        {/* Rating y reviews */}
        <div className={styles.ratingSection}>
          <div className={styles.stars}>
            {stars.map((star, index) => (
              <i 
                key={index}
                className={`bi ${
                  star === 'full' ? 'bi-star-fill' : 
                  star === 'half' ? 'bi-star-half' : 'bi-star'
                }`}
              ></i>
            ))}
          </div>
          <span className={styles.rating}>{product.rating}</span>
          <span className={styles.reviews}>({product.reviews} reseñas)</span>
        </div>

        {/* Especificaciones técnicas */}
        <div className={styles.specs}>
          <div className={styles.spec}>
            <i className="bi bi-gear me-1"></i>
            <span>{product.specs.engine}</span>
          </div>
          <div className={styles.spec}>
            <i className="bi bi-lightning me-1"></i>
            <span>{product.specs.power}</span>
          </div>
          <div className={styles.spec}>
            <i className="bi bi-speedometer me-1"></i>
            <span>{product.specs.weight}</span>
          </div>
        </div>

        {/* Precio y acciones */}
        <div className={`${styles.priceSection} mt-auto`}>
          <div className={styles.priceContainer}>
            {hasDiscount && (
              <span className={styles.originalPrice}>
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className={styles.currentPrice}>
              {formatPrice(product.price)}
            </span>
            <small className={styles.priceNote}>*Sin IVA</small>
          </div>

          {/* Stock */}
          <div className={styles.stockInfo}>
            {product.stock > 0 ? (
              <span className={`${styles.inStock} text-success`}>
                <i className="bi bi-check-circle-fill me-1"></i>
                {product.stock} disponibles
              </span>
            ) : (
              <span className={`${styles.outStock} text-danger`}>
                <i className="bi bi-x-circle-fill me-1"></i>
                Agotado
              </span>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className={styles.actions}>
          <button 
            className={`${styles.btnAddCart} btn btn-primary flex-grow-1`}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <i className="bi bi-cart-plus me-2"></i>
            {product.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
          </button>
          <button 
            className={`${styles.btnDetails} btn btn-outline-primary`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleViewDetails();
            }}
          >
            <i className="bi bi-info-circle"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
