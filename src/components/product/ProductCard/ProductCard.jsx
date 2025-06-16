// src/components/product/ProductCard/ProductCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { formatPrice, getStockStatus, getProductRating, getDiscountPercentage } from '../../../data/mockProducts';
import styles from './ProductCard.module.css';

/**
 * Componente ProductCard - Tarjeta de producto
 * Muestra información del producto con funcionalidades de interacción
 * @param {Object} product - Datos del producto (estructura ProductoDetallesDTO)
 * @param {Function} onAddToCart - Callback para agregar al carrito
 * @param {string} variant - Variante visual ('default' | 'compact' | 'featured')
 */
const ProductCard = ({ 
  product, 
  onAddToCart, 
  variant = 'default',
  className = '',
  ...props 
}) => {
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // Datos calculados
  const stockStatus = getStockStatus(product.prodStock);
  const rating = getProductRating(product.idProducto);
  const discount = getDiscountPercentage(product.idProducto);
  const hasDiscount = discount > 0;
  const discountedPrice = hasDiscount ? product.prodPrecio * (1 - discount / 100) : product.prodPrecio;

  // Handlers
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      // TODO: Abrir modal de autenticación
      return;
    }

    if (product.prodStock === 0) {
      return;
    }

    setLoading(true);
    try {
      await onAddToCart?.(product, quantity);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    const maxQuantity = Math.min(product.prodStock, 10);
    const validQuantity = Math.max(1, Math.min(newQuantity, maxQuantity));
    setQuantity(validQuantity);
  };

  // Imagen principal (primera del array o placeholder)
  const primaryImage = product.imagenesUrl?.[0] || '/images/no-image.png';

  // Classes CSS dinámicas
  const cardClasses = [
    styles.productCard,
    styles[variant],
    stockStatus.status === 'out-of-stock' ? styles.outOfStock : '',
    loading ? styles.loading : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} {...props}>
      {/* Badge de descuento */}
      {hasDiscount && (
        <div className={styles.discountBadge}>
          -{discount}%
        </div>
      )}

      {/* Badge de stock */}
      {stockStatus.status === 'low-stock' && (
        <div className={styles.stockBadge}>
          <i className="bi bi-exclamation-triangle"></i>
          {stockStatus.text}
        </div>
      )}

      {/* Imagen del producto */}
      <div className={styles.imageContainer}>
        <Link to={`/catalog/product/${product.idProducto}`} className={styles.imageLink}>
          <img
            src={primaryImage}
            alt={product.prodNombre}
            className={styles.productImage}
            onError={(e) => {
              e.target.src = '/images/no-image.png';
            }}
          />
        </Link>
        
        {/* Overlay con acción rápida */}
        <div className={styles.imageOverlay}>
          <Link 
            to={`/catalog/product/${product.idProducto}`}
            className="btn btn-sm btn-outline-light"
          >
            <i className="bi bi-eye me-1"></i>
            Ver Detalles
          </Link>
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className={styles.cardBody}>
        {/* Categoría */}
        <span className={styles.category}>
          {product.categoriaNombre}
        </span>

        {/* Título del producto */}
        <h5 className={styles.productTitle}>
          <Link to={`/catalog/product/${product.idProducto}`} className={styles.titleLink}>
            {product.prodNombre}
          </Link>
        </h5>

        {/* Descripción */}
        <p className={styles.productDescription}>
          {product.prodDescripcion}
        </p>

        {/* Rating */}
        <div className={styles.rating}>
          {[...Array(5)].map((_, index) => (
            <i
              key={index}
              className={`bi ${index < Math.floor(rating) ? 'bi-star-fill' : 'bi-star'}`}
            ></i>
          ))}
          <span className={styles.ratingText}>({rating})</span>
        </div>

        {/* Precio */}
        <div className={styles.priceContainer}>
          {hasDiscount && (
            <span className={styles.originalPrice}>
              {formatPrice(product.prodPrecio)}
            </span>
          )}
          <span className={styles.currentPrice}>
            {formatPrice(discountedPrice)}
          </span>
        </div>

        {/* Estado de stock */}
        <div className={styles.stockInfo}>
          <span className={stockStatus.class}>
            <i className={`bi ${stockStatus.status === 'in-stock' ? 'bi-check-circle' : 
                              stockStatus.status === 'low-stock' ? 'bi-exclamation-triangle' : 
                              'bi-x-circle'}`}></i>
            {stockStatus.text}
          </span>
        </div>
      </div>

      {/* Acciones */}
      <div className={styles.cardActions}>
        {/* Control de cantidad */}
        {product.prodStock > 0 && (
          <div className={styles.quantityControl}>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >
              <i className="bi bi-dash"></i>
            </button>
            <span className={styles.quantityValue}>{quantity}</span>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= Math.min(product.prodStock, 10)}
            >
              <i className="bi bi-plus"></i>
            </button>
          </div>
        )}

        {/* Botón agregar al carrito */}
        <button
          type="button"
          className={`btn ${product.prodStock > 0 ? 'btn-primary' : 'btn-secondary'} ${styles.addToCartButton}`}
          onClick={handleAddToCart}
          disabled={product.prodStock === 0 || loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Agregando...
            </>
          ) : product.prodStock === 0 ? (
            <>
              <i className="bi bi-x-circle me-2"></i>
              Agotado
            </>
          ) : (
            <>
              <i className="bi bi-cart-plus me-2"></i>
              Agregar al Carrito
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);
