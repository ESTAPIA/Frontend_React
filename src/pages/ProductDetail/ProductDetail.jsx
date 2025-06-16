// src/pages/ProductDetail/ProductDetail.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart'; // ✅ AÑADIR: Import useCart
import productService from '../../services/productService';
import { formatPrice, getStockStatus } from '../../data/mockProducts';
import AuthModal from '../../components/auth/AuthModal';
import ImageGallery from '../../components/product/ImageGallery';
import QuantitySelector from '../../components/product/QuantitySelector';
import RelatedProducts from '../../components/product/RelatedProducts';
import ProductSpecifications from '../../components/product/ProductSpecifications';
import styles from './ProductDetail.module.css';

/**
 * Página de detalles de producto
 * Sub-iteración 5.3: Diseño responsivo con galería, información detallada y funcionalidades
 */
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart(); // ✅ AÑADIR: Hook del carrito

  // Estados
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);  // Cargar detalles del producto
  const loadProductDetails = useCallback(async () => {
    if (!id) {
      setError('ID de producto no válido');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Intentar obtener de la API
      const response = await productService.getProductById(id);
      
      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        // Fallback: buscar en datos mock
        console.warn('API no disponible, usando datos mock');
        const { mockFeaturedProducts } = await import('../../data/mockProducts');
        const mockProduct = mockFeaturedProducts.find(p => p.idProducto.toString() === id.toString());
        
        if (mockProduct) {
          setProduct(mockProduct);
        } else {
          throw new Error('Producto no encontrado');
        }
      }
    } catch (err) {
      console.error('Error al cargar producto:', err);
      
      // Último intento: buscar en mock
      try {
        const { mockFeaturedProducts } = await import('../../data/mockProducts');
        const mockProduct = mockFeaturedProducts.find(p => p.idProducto.toString() === id.toString());
        
        if (mockProduct) {
          setProduct(mockProduct);
          console.log('Producto cargado desde datos mock');
        } else {
          setError('Producto no encontrado. Puede que no exista o haya un problema de conexión.');
        }
      } catch (mockErr) {
        setError('No se pudo cargar el producto. Puede que no exista o haya un problema de conexión.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);
  // Cargar producto al montar
  useEffect(() => {
    loadProductDetails();
  }, [loadProductDetails]);

  // Handlers
  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!product || quantity <= 0) {
      return;
    }    try {
      setAddingToCart(true);
      
      console.log('🛒 Agregando al carrito desde ProductDetail:', {
        productId: product.idProducto,
        productName: product.prodNombre,
        quantity,
        price: product.prodPrecio
      });

      // ✅ USAR CARTCONTEXT REAL en lugar de TODO
      const result = await addItem(product.idProducto, quantity);
      
      if (result.success) {
        console.log('✅ Producto agregado exitosamente al carrito');
        // El toast ya se muestra desde CartContext
        
        // Opcional: resetear cantidad después de agregar
        setQuantity(1);
      } else {
        console.error('❌ Error al agregar producto:', result.error);
      }
      
    } catch (err) {
      console.error('💥 Error inesperado al agregar al carrito:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // TODO: Implementar compra directa
    console.log('Compra directa:', { product, quantity });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Datos calculados
  const stockStatus = product ? getStockStatus(product.prodStock) : null;
  const formattedPrice = product ? formatPrice(product.prodPrecio) : '';
  const isOutOfStock = product?.prodStock === 0;
  const maxQuantity = product?.prodStock || 1;

  // Estados de renderizado
  if (loading) {
    return (
      <main className={`${styles.productDetailPage} py-4`}>
        <div className="container">
          <div className={styles.loadingState}>
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">Cargando producto...</span>
              </div>
              <h4 className="text-muted mb-2">Cargando detalles</h4>
              <p className="text-muted">Obteniendo información del producto...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className={`${styles.productDetailPage} py-4`}>
        <div className="container">
          <div className={styles.errorState}>
            <div className="text-center py-5">
              <i className="bi bi-exclamation-triangle" style={{ fontSize: '4rem', color: 'var(--medium-gray)' }}></i>
              <h4 className="text-muted mt-3 mb-2">Producto no encontrado</h4>
              <p className="text-muted mb-4">{error}</p>
              <div className="d-flex gap-3 justify-content-center">
                <button 
                  className="btn btn-outline-primary"
                  onClick={handleGoBack}
                >
                  <i className="bi bi-arrow-left me-2"></i>Volver
                </button>
                <Link to="/catalog" className="btn btn-primary">
                  <i className="bi bi-grid-3x3-gap me-2"></i>Ver Catálogo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className={`${styles.productDetailPage} py-4`}>
        <div className="container">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none">
                  <i className="bi bi-house-door me-1"></i>Inicio
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/catalog" className="text-decoration-none">Catálogo</Link>
              </li>
              <li className="breadcrumb-item">
                <span className="text-muted">{product.categoriaNombre}</span>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {product.prodNombre}
              </li>
            </ol>
          </nav>

          {/* Contenido principal del producto */}
          <div className="row">
            {/* Galería de imágenes */}
            <div className="col-lg-6 mb-4">
              <ImageGallery 
                images={product.imagenesUrl || []}
                productName={product.prodNombre}
                className={styles.productGallery}
              />
            </div>

            {/* Información del producto */}
            <div className="col-lg-6">
              <div className={styles.productInfo}>
                {/* Header del producto */}
                <div className={styles.productHeader}>
                  <h1 className={styles.productTitle}>{product.prodNombre}</h1>
                  <div className={styles.productMeta}>
                    <span className="badge bg-secondary me-2">{product.categoriaNombre}</span>
                    <span className={`badge ${stockStatus?.class.replace('text-', 'bg-')}`}>
                      {stockStatus?.text}
                    </span>
                  </div>
                </div>

                {/* Precio */}
                <div className={styles.priceSection}>
                  <div className={styles.currentPrice}>
                    {formattedPrice}
                  </div>
                  <small className="text-muted">Precio incluye IVA</small>
                </div>                {/* Especificaciones básicas */}
                {product.prodDescripcion && (
                  <div className={styles.descriptionSection}>
                    <h5>Descripción</h5>
                    <p className="text-muted">{product.prodDescripcion}</p>
                  </div>
                )}

                {/* Selector de cantidad y botones */}
                <div className={styles.purchaseSection}>
                  {!isOutOfStock && (
                    <div className="mb-3">
                      <QuantitySelector
                        quantity={quantity}
                        onQuantityChange={handleQuantityChange}
                        min={1}
                        max={maxQuantity}
                        stock={product.prodStock}
                        disabled={addingToCart}
                      />
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className={styles.actionButtons}>
                    {isOutOfStock ? (
                      <button className="btn btn-outline-secondary btn-lg w-100" disabled>
                        <i className="bi bi-x-circle me-2"></i>
                        Producto agotado
                      </button>
                    ) : (
                      <div className="d-grid gap-2">
                        <button 
                          className="btn btn-primary btn-lg"
                          onClick={handleAddToCart}
                          disabled={addingToCart}
                        >
                          {addingToCart ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Agregando...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-cart-plus me-2"></i>
                              Agregar al carrito
                            </>
                          )}
                        </button>
                        
                        <button 
                          className="btn btn-success btn-lg"
                          onClick={handleBuyNow}
                          disabled={addingToCart}
                        >
                          <i className="bi bi-lightning-fill me-2"></i>
                          Comprar ahora
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Call to action para usuarios no autenticados */}
                {!isAuthenticated && (
                  <div className={styles.authCta}>
                    <div className="alert alert-info d-flex align-items-center">
                      <i className="bi bi-info-circle me-2"></i>
                      <div>
                        <strong>¿Quieres comprar?</strong> 
                        <button 
                          className="btn btn-link p-0 ms-1"
                          onClick={() => setShowAuthModal(true)}
                        >
                          Inicia sesión
                        </button> 
                        para agregar productos a tu carrito.
                      </div>
                    </div>
                  </div>
                )}
              </div>            </div>
          </div>

          {/* Especificaciones técnicas */}
          <div className="row mt-5">
            <div className="col-12">
              <ProductSpecifications 
                product={product}
              />
            </div>
          </div>

          {/* Productos relacionados */}
          <div className="row mt-5">
            <div className="col-12">
              <RelatedProducts 
                currentProduct={product}
                onAddToCart={handleAddToCart}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modal de autenticación */}
      <AuthModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default ProductDetail;
