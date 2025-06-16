// src/pages/Catalog/Catalog.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart'; // ✅ AÑADIR: Import useCart
import ProductCard from '../../components/product/ProductCard';
import ProductFilters from '../../components/product/ProductFilters';
import Pagination from '../../components/common/Pagination';
import AuthModal from '../../components/auth/AuthModal';
import { mockFeaturedProducts } from '../../data/mockProducts';
import styles from './Catalog.module.css';

/**
 * Página de Catálogo de Productos
 * Sub-iteración 5.2: Sistema completo con filtros y paginación
 */
const Catalog = () => {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart(); // ✅ AÑADIR: Hook del carrito
  const [showAuthModal, setShowAuthModal] = useState(false);
  // Estados para filtros y paginación
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priceMin: '',
    priceMax: '',
    sortBy: 'name'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;// Hook de productos para CATÁLOGO - usar fetchAllProducts para obtener TODOS los productos
  const {
    products: apiProducts,
    loading: productsLoading,
    error: productsError,
    dataSource,
    apiAvailable,
    fetchAllProducts // Función para cargar todos los productos
  } = useProducts({
    fetchOnMount: false, // No cargar automáticamente los destacados
    useFallback: true
  });
  // Cargar todos los productos al montar el componente (no solo 6 destacados)
  React.useEffect(() => {
    fetchAllProducts(); // Llamar a fetchAllProducts en lugar de fetchFeaturedProducts
  }, [fetchAllProducts]);

  // Productos base (API o mock)
  const baseProducts = useMemo(() => {
    if (apiProducts && apiProducts.length > 0) {
      return apiProducts;
    }
    return mockFeaturedProducts || [];
  }, [apiProducts]);
  // Productos filtrados y ordenados
  const filteredProducts = useMemo(() => {
    let filtered = [...baseProducts];

    // Filtro por búsqueda
    if (filters.search) {
      filtered = filtered.filter(product => 
        product.prodNombre.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.prodDescripcion.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.prodProveedor.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filtro por categoría
    if (filters.category) {
      filtered = filtered.filter(product => 
        product.categoriaNombre === filters.category
      );
    }

    // Filtro por rango de precio
    if (filters.priceMin !== '' && filters.priceMin !== null) {
      const minPrice = parseFloat(filters.priceMin) || 0;
      filtered = filtered.filter(product => product.prodPrecio >= minPrice);
    }
    
    if (filters.priceMax !== '' && filters.priceMax !== null) {
      const maxPrice = parseFloat(filters.priceMax);
      if (!isNaN(maxPrice)) {
        filtered = filtered.filter(product => product.prodPrecio <= maxPrice);
      }
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.prodNombre.localeCompare(b.prodNombre);
        case 'name_desc':
          return b.prodNombre.localeCompare(a.prodNombre);
        case 'price':
          return a.prodPrecio - b.prodPrecio;
        case 'price_desc':
          return b.prodPrecio - a.prodPrecio;
        case 'newest':
          return b.idProducto - a.idProducto; // Asumiendo que ID más alto = más nuevo
        default:
          return a.prodNombre.localeCompare(b.prodNombre);
      }
    });

    return filtered;
  }, [baseProducts, filters]);

  // Productos paginados
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Datos de paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const totalProducts = filteredProducts.length;

  // Categorías únicas para filtros
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(baseProducts.map(p => p.categoriaNombre))];
    return uniqueCategories.filter(Boolean);
  }, [baseProducts]);
  // Handlers
  const handleShowAuthModal = () => setShowAuthModal(true);
  const handleCloseAuthModal = () => setShowAuthModal(false);  // Handlers para filtros y paginación
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset a la primera página al cambiar filtros
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    // Scroll hacia arriba al cambiar página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      priceMin: '',
      priceMax: '',
      sortBy: 'name'
    });
    setCurrentPage(1);
  }, []);
  const handleAddToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      handleShowAuthModal();
      return;
    }
    
    try {
      console.log('🛒 Agregando al carrito desde Catalog:', { 
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
  };

  return (
    <>
      <main className={`${styles.catalogPage} py-4`}>
        <div className="container">
          {/* Header del catálogo */}
          <div className="row mb-5">
            <div className="col-12">
              <div className={styles.catalogHeader}>
                <div className="d-flex justify-content-between align-items-start flex-wrap">
                  <div>
                    <h1 className={`text-dark-green mb-2 ${styles.catalogTitle}`}>
                      <i className="bi bi-grid-3x3-gap me-3"></i>
                      Catálogo de Productos
                    </h1>
                    <p className="text-muted mb-1">
                      Descubre nuestra amplia selección de motocicletas
                      {dataSource === 'api' && <small className="text-success ms-2">(Catálogo actualizado)</small>}
                      {dataSource === 'mock' && <small className="text-info ms-2">(Catálogo de demostración)</small>}
                    </p>                    {totalProducts > 0 && (
                      <small className="text-muted">
                        {totalProducts} producto{totalProducts !== 1 ? 's' : ''} disponible{totalProducts !== 1 ? 's' : ''}
                        {totalProducts !== baseProducts.length && (
                          <span className="text-info ms-1">
                            (filtrado{totalProducts !== 1 ? 's' : ''} de {baseProducts.length})
                          </span>
                        )}
                      </small>
                    )}
                  </div>
                  
                  {/* Botón de actualizar */}                  <div className="ms-auto">
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={fetchAllProducts}
                      disabled={productsLoading}
                      title="Actualizar catálogo"
                    >
                      {productsLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Cargando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-arrow-clockwise me-2"></i>
                          Actualizar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>          </div>

          {/* Sección de Filtros y Búsqueda */}
          {!productsLoading && baseProducts.length > 0 && (
            <div className="row mb-4">              <div className="col-12">
                <div className={styles.filtersSection}>
                  {/* Filtros integrados con búsqueda */}
                  <ProductFilters
                    categories={categories}
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    loading={productsLoading}
                    totalProducts={totalProducts}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Indicador de estado de conexión */}
          {!productsLoading && productsError && !apiAvailable && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="alert alert-info d-flex align-items-center" role="alert">
                  <i className="bi bi-info-circle me-2"></i>
                  <div>
                    <small>
                      <strong>Modo sin conexión:</strong> Mostrando catálogo de demostración.                      <button 
                        className="btn btn-link btn-sm p-0 ms-2 text-decoration-none"
                        onClick={fetchAllProducts}
                        title="Intentar reconectar"
                      >
                        Reintentar conexión
                      </button>
                    </small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {productsLoading && (
            <div className="row">
              <div className="col-12 text-center py-5">
                <div className={styles.loadingState}>
                  <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Cargando catálogo...</span>
                  </div>
                  <h4 className="text-muted mb-2">Cargando catálogo</h4>
                  <p className="text-muted">Obteniendo los productos más recientes...</p>
                </div>
              </div>
            </div>
          )}          {/* Grid de productos */}
          {!productsLoading && (
            <div className="row">
              {paginatedProducts.length > 0 ? (
                <>
                  {/* Productos */}
                  <div className="col-12">
                    <div className="row g-4">
                      {paginatedProducts.map((product) => (
                        <div key={product.idProducto} className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
                          <ProductCard
                            product={product}
                            onAddToCart={handleAddToCart}
                            variant="default"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="col-12 mt-5">
                      <div className={styles.paginationSection}>
                        <div className="row align-items-center">
                          <div className="col-md-6 col-12 text-center text-md-start mb-3 mb-md-0">
                            <p className="text-muted mb-0">
                              <i className="bi bi-info-circle me-2"></i>
                              Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalProducts)} de {totalProducts} productos
                            </p>
                          </div>
                          <div className="col-md-6 col-12">
                            <Pagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageChange={handlePageChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Estado vacío */
                <div className="col-12 text-center py-5">
                  <div className={styles.emptyState}>
                    {filteredProducts.length === 0 && baseProducts.length > 0 ? (
                      /* No hay resultados para los filtros */
                      <>
                        <i className="bi bi-search" style={{ fontSize: '4rem', color: 'var(--medium-gray)' }}></i>
                        <h4 className="text-muted mt-3 mb-2">No se encontraron productos</h4>
                        <p className="text-muted mb-4">
                          Intenta ajustar los filtros o términos de búsqueda.
                        </p>
                        <button 
                          className="btn btn-outline-primary"
                          onClick={handleClearFilters}
                        >
                          <i className="bi bi-x-circle me-2"></i>
                          Limpiar Filtros
                        </button>
                      </>
                    ) : (
                      /* No hay productos en general */
                      <>
                        <i className="bi bi-bag-x" style={{ fontSize: '4rem', color: 'var(--medium-gray)' }}></i>
                        <h4 className="text-muted mt-3 mb-2">No hay productos disponibles</h4>
                        <p className="text-muted mb-4">
                          No se pudieron cargar los productos en este momento.
                        </p>
                        <button 
                          className="btn btn-primary"
                          onClick={fetchAllProducts}
                        >
                          <i className="bi bi-arrow-clockwise me-2"></i>
                          Intentar de nuevo
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Call to action para usuarios no autenticados */}
          {!isAuthenticated && paginatedProducts.length > 0 && (
            <div className="row mt-5">
              <div className="col-12">
                <div className={`${styles.ctaSection} text-center p-4 bg-light rounded`}>
                  <h4 className="text-dark-green mb-3">¿Listo para comprar?</h4>
                  <p className="text-muted mb-4">
                    Inicia sesión para agregar productos a tu carrito y realizar pedidos
                  </p>
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={handleShowAuthModal}
                  >
                    <i className="bi bi-person-circle me-2"></i>
                    Iniciar Sesión
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal de autenticación */}
      <AuthModal
        show={showAuthModal}
        onClose={handleCloseAuthModal}
      />
    </>
  );
};

export default Catalog;
