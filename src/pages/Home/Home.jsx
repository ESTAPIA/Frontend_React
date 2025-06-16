// src/pages/Home/Home.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart'; // ✅ AÑADIR: Import useCart
import useProducts from '../../hooks/useProducts';
import AuthModal from '../../components/auth/AuthModal';
import ProductCard from '../../components/product/ProductCard';
import { mockFeaturedProducts } from '../../data/mockProducts';
import styles from './Home.module.css';

/**
 * Página principal de Motoshop
 * Replica exactamente el diseño del home.ejs original
 * 
 * Sub-iteraciones completadas:
 * 4.4: ✅ Sección de productos destacados (mock inicial)
 * 4.5: ✅ Integración API con fallback automático a mock
 * 4.6: ✅ Verificación y refinamiento final
 * 
 * Optimizaciones aplicadas en 4.6:
 * - Memoización con useMemo/useCallback para evitar re-renders
 * - Mejoras de accesibilidad (ARIA labels, roles, live regions)
 * - Estados de carga más informativos y con mejor UX
 * - Transiciones CSS suaves y animaciones optimizadas
 * - Código limpio y bien documentado
 * - Performance optimizada para producción
 */
const Home = () => {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart(); // ✅ AÑADIR: Hook del carrito
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Hook de productos con fallback automático
  const {
    products: apiProducts,
    loading: productsLoading,
    error: productsError,
    dataSource,
    apiAvailable,
    refresh: refreshProducts
  } = useProducts({
    fetchOnMount: true,
    useFallback: true
  });
  const handleShowAuthModal = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  const handleCloseAuthModal = useCallback(() => {
    setShowAuthModal(false);
  }, []);
  // Handler para agregar al carrito - Optimizado con useCallback
  const handleAddToCart = useCallback(async (product, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para agregar productos al carrito');
      setShowAuthModal(true);
      return;
    }
    
    try {
      console.log('🛒 Agregando al carrito desde Home:', {
        productId: product.idProducto,
        productName: product.prodNombre,
        quantity
      });

      // ✅ USAR CARTCONTEXT REAL en lugar de TODO
      const result = await addItem(product.idProducto, quantity);
      
      if (result.success) {
        console.log('✅ Producto agregado exitosamente al carrito');
        // El toast ya se muestra desde CartContext
      } else {
        console.error('❌ Error al agregar producto:', result.error);
      }
    } catch (error) {
      console.error('💥 Error inesperado al agregar al carrito:', error);
    }
  }, [isAuthenticated, addItem]);
  // Memoización de productos a mostrar para evitar re-renders innecesarios
  const displayProducts = useMemo(() => {
    const sourceProducts = (apiProducts && apiProducts.length > 0) ? apiProducts : mockFeaturedProducts;
    return sourceProducts ? sourceProducts.slice(0, 6) : [];
  }, [apiProducts]);

  // Memoización del estado de productos vacío
  const hasNoProducts = useMemo(() => {
    return (!apiProducts || apiProducts.length === 0) && (!mockFeaturedProducts || mockFeaturedProducts.length === 0);
  }, [apiProducts]);

  return (
    <>      <main className={`${styles.homePage} flex-grow-1`} role="main">
      {/* Hero Section */}
      <section className={`${styles.heroSection} hero-section`} aria-label="Sección principal">
        <div className={`${styles.heroBackground} hero-background`} aria-hidden="true">
          <div className="particles"></div>
          <div className="lightning-effect"></div>
        </div>
        
        <div className="container hero-content">
          <div className="row align-items-center min-vh-100">
            <div className="col-lg-6">
              <div className="hero-text">
                <h1 className="hero-title" role="banner">
                  <span className="text-gradient">FEEL THE</span>
                  <span className="text-thunder">THUNDER</span>
                </h1>
                <p className="hero-subtitle">Experimenta la potencia y velocidad en cada kilómetro</p>                
                <div className="hero-buttons" role="group" aria-label="Acciones principales">
                  {!isAuthenticated ? (
                    <button 
                      className="btn btn-primary btn-lg me-3"
                      onClick={handleShowAuthModal}
                      aria-label="Comenzar aventura - Iniciar sesión"
                    >
                      <i className="bi bi-rocket-takeoff me-2" aria-hidden="true"></i>Comenzar Aventura
                    </button>
                  ) : (
                    <Link 
                      to="/profile" 
                      className="btn btn-primary btn-lg me-3"
                      aria-label="Ir a mi perfil de usuario"
                    >
                      <i className="bi bi-person-circle me-2" aria-hidden="true"></i>Mi Perfil
                    </Link>
                  )}
                  <Link 
                    to="/catalog" 
                    className="btn btn-outline-light btn-lg"
                    aria-label="Explorar catálogo de productos"
                  >
                    <i className="bi bi-eye me-2" aria-hidden="true"></i>Ver Catálogo
                  </Link>
                </div>
              </div>
            </div>
              <div className="col-lg-6">
              <div className="hero-product">
                <div className="product-container">
                  <div className="product-glow" aria-hidden="true"></div>
                  {/* Placeholder para modelo 3D - implementaremos después */}
                  <div className={`${styles.modelPlaceholder} model-viewer-container`} role="img" aria-label="Vista previa de modelo 3D de motocicleta">
                    <div className={styles.placeholderContent}>
                      <i className="bi bi-motorcycle" style={{ fontSize: '8rem', color: 'var(--primary-green)' }} aria-hidden="true"></i>
                      <p className="text-muted mt-3">Modelo 3D - En desarrollo</p>
                    </div>
                  </div>
                  <div className="energy-rings" aria-hidden="true">
                    <div className="ring ring-1"></div>
                    <div className="ring ring-2"></div>
                    <div className="ring ring-3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>      {/* Features Section */}
      <section className={`${styles.featuresSection} features-section py-5`} aria-label="Características principales">
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="feature-card" role="article">
                <div className="feature-icon" aria-hidden="true">
                  <i className="bi bi-lightning-charge"></i>
                </div>
                <h3>Potencia Extrema</h3>
                <p>Motores de alta performance diseñados para la velocidad</p>
              </div>
            </div>
            
            <div className="col-md-4 mb-4">
              <div className="feature-card" role="article">
                <div className="feature-icon" aria-hidden="true">
                  <i className="bi bi-shield-check"></i>
                </div>
                <h3>Máxima Seguridad</h3>
                <p>Tecnología avanzada en sistemas de frenado y estabilidad</p>
              </div>
            </div>
            
            <div className="col-md-4 mb-4">
              <div className="feature-card" role="article">
                <div className="feature-icon" aria-hidden="true">
                  <i className="bi bi-award"></i>
                </div>
                <h3>Calidad Premium</h3>
                <p>Las mejores marcas y modelos del mercado</p>
              </div>
            </div>
          </div>
        </div>
      </section>      {/* Productos Destacados Section */}
      <section className={`${styles.featuredProducts} py-5 bg-light`} aria-label="Productos destacados">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="text-dark-green">
                <i className="bi bi-award me-3" aria-hidden="true"></i>Productos Destacados
              </h2>              
              <p className="text-muted">
                Descubre nuestras motocicletas más populares
                {dataSource === 'api' && <small className="text-success ms-2">(En vivo desde API)</small>}
                {dataSource === 'mock' && <small className="text-info ms-2">(Datos de demostración)</small>}
                {!apiAvailable && productsError && <small className="text-warning ms-2">(API no disponible)</small>}
              </p>
              <div className={styles.sectionDivider} aria-hidden="true"></div>
            </div>
          </div>          {/* Indicador de estado de carga mejorado */}
          {productsLoading && (
            <div className="row">
              <div className="col-12 text-center">
                <div className={styles.loadingState} role="status" aria-live="polite">
                  <div className="spinner-border text-primary" role="status" aria-hidden="true">
                    <span className="visually-hidden">Cargando productos...</span>
                  </div>
                  <p className="text-muted mt-3">
                    Conectando con el catálogo...
                    {!apiAvailable && <span className="text-warning ms-2">(Usando datos locales)</span>}
                  </p>
                  <small className="text-info">
                    {dataSource === 'api' ? 'Cargando desde servidor...' : 'Preparando datos de demostración...'}
                  </small>
                </div>
              </div>
            </div>
          )}

          {/* Información de error/recuperación mejorada */}
          {!productsLoading && productsError && !apiAvailable && (
            <div className="row">
              <div className="col-12">
                <div className="alert alert-info d-flex align-items-center" role="alert" aria-live="polite">
                  <i className="bi bi-info-circle me-2" aria-hidden="true"></i>
                  <div>
                    <small>
                      <strong>Modo sin conexión:</strong> Mostrando productos de demostración. 
                      <button 
                        className="btn btn-link btn-sm p-0 ms-2 text-decoration-none"
                        onClick={refreshProducts}
                        title="Intentar reconectar con el servidor"
                        aria-label="Reintentar conexión con API"
                      >
                        Reintentar conexión
                      </button>
                    </small>
                  </div>
                </div>
              </div>
            </div>
          )}          {/* Grid de productos - Con integración API y fallback optimizada */}
          {!productsLoading && (
            <div className="row g-4" role="region" aria-label="Lista de productos destacados">
              {/* Usar productos memoizados para evitar re-renders */}
              {displayProducts.map((product) => (
                <div key={product.idProducto} className="col-xl-4 col-lg-6 col-md-6 col-sm-12">
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    variant="featured"
                  />
                </div>
              ))}
              
              {/* Estado vacío optimizado - solo si no hay productos ni mock */}
              {hasNoProducts && (
                <div className="col-12 text-center">
                  <div className={styles.emptyState} role="status" aria-live="polite">
                    <i 
                      className="bi bi-exclamation-circle" 
                      style={{ fontSize: '3rem', color: 'var(--medium-gray)' }}
                      aria-hidden="true"
                    ></i>
                    <p className="text-muted mt-3">No hay productos destacados disponibles</p>
                    <button 
                      className="btn btn-outline-primary mt-2" 
                      onClick={refreshProducts}
                      aria-label="Reintentar carga de productos"
                    >
                      <i className="bi bi-arrow-clockwise me-2" aria-hidden="true"></i>Reintentar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Información de estado de conexión (solo en desarrollo) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="row mt-3">
              <div className="col-12 text-center">
                <small className="text-muted">
                  Estado API: {apiAvailable === null ? 'Verificando...' : apiAvailable ? '🟢 Conectado' : '🔴 Desconectado'} |
                  Fuente: {dataSource === 'api' ? '🌐 API' : dataSource === 'mock' ? '📦 Mock' : '❌ Sin datos'}
                  {productsError && <span className="text-warning ms-2">⚠️ {productsError}</span>}
                </small>
              </div>
            </div>
          )}          {/* Call to action mejorado */}
          <div className="row mt-5">
            <div className="col-12 text-center">
              <div className={styles.ctaSection} role="complementary">
                <h4 className="text-dark-green mb-3">¿Buscas algo específico?</h4>
                <p className="text-muted mb-4">
                  Explora nuestro catálogo completo con más de 500 modelos disponibles
                </p>
                <Link 
                  to="/catalog" 
                  className="btn btn-primary btn-lg"
                  aria-label="Explorar catálogo completo de productos"
                >
                  <i className="bi bi-grid-3x3-gap me-2" aria-hidden="true"></i>Ver Catálogo Completo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    {/* AuthModal */}
    <AuthModal
      show={showAuthModal}
      onClose={handleCloseAuthModal}
    />
  </>
);
};

export default Home;
