// src/components/common/Pagination/Pagination.jsx
import React from 'react';
import styles from './Pagination.module.css';

/**
 * Componente de paginación reutilizable
 * Sub-iteración 5.2: Sistema de filtros y paginación
 */
const Pagination = ({
  currentPage = 0,
  totalPages = 1,
  totalElements = 0,
  pageSize = 12,
  onPageChange,
  loading = false,
  className = ''
}) => {
  // No mostrar paginación si hay una sola página o menos
  if (totalPages <= 1) {
    return null;
  }

  // Calcular páginas a mostrar (máximo 5 páginas visibles)
  const getVisiblePages = () => {
    const maxVisible = 5;
    const halfVisible = Math.floor(maxVisible / 2);
    
    let startPage = Math.max(0, currentPage - halfVisible);
    let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);
    
    // Ajustar si estamos cerca del final
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(0, endPage - maxVisible + 1);
    }
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  const handlePageClick = (page) => {
    if (page >= 0 && page < totalPages && page !== currentPage && !loading) {
      onPageChange?.(page);
    }
  };

  return (
    <div className={`${styles.pagination} ${className}`}>
      {/* Información de elementos */}
      <div className="row align-items-center">
        <div className="col-12 col-md-6">
          <div className={styles.pageInfo}>
            <small className="text-muted">
              Mostrando <strong>{startItem}</strong> a <strong>{endItem}</strong> de{' '}
              <strong>{totalElements}</strong> producto{totalElements !== 1 ? 's' : ''}
            </small>
          </div>
        </div>
        
        <div className="col-12 col-md-6">
          <nav aria-label="Navegación de páginas">
            <ul className="pagination pagination-sm justify-content-md-end justify-content-center mb-0">
              {/* Botón Primera página */}
              <li className={`page-item ${currentPage === 0 || loading ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageClick(0)}
                  disabled={currentPage === 0 || loading}
                  aria-label="Primera página"
                >
                  <i className="bi bi-chevron-double-left"></i>
                </button>
              </li>
              
              {/* Botón Página anterior */}
              <li className={`page-item ${currentPage === 0 || loading ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageClick(currentPage - 1)}
                  disabled={currentPage === 0 || loading}
                  aria-label="Página anterior"
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
              </li>
              
              {/* Ellipsis inicial si es necesario */}
              {visiblePages[0] > 0 && (
                <>
                  <li className="page-item">
                    <button
                      className="page-link"
                      onClick={() => handlePageClick(0)}
                      disabled={loading}
                    >
                      1
                    </button>
                  </li>
                  {visiblePages[0] > 1 && (
                    <li className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  )}
                </>
              )}
              
              {/* Páginas visibles */}
              {visiblePages.map(page => (
                <li 
                  key={page} 
                  className={`page-item ${page === currentPage ? 'active' : ''} ${loading ? 'disabled' : ''}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageClick(page)}
                    disabled={loading}
                    aria-label={`Página ${page + 1}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page + 1}
                  </button>
                </li>
              ))}
              
              {/* Ellipsis final si es necesario */}
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <>
                  {visiblePages[visiblePages.length - 1] < totalPages - 2 && (
                    <li className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  )}
                  <li className="page-item">
                    <button
                      className="page-link"
                      onClick={() => handlePageClick(totalPages - 1)}
                      disabled={loading}
                    >
                      {totalPages}
                    </button>
                  </li>
                </>
              )}
              
              {/* Botón Página siguiente */}
              <li className={`page-item ${currentPage === totalPages - 1 || loading ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageClick(currentPage + 1)}
                  disabled={currentPage === totalPages - 1 || loading}
                  aria-label="Página siguiente"
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </li>
              
              {/* Botón Última página */}
              <li className={`page-item ${currentPage === totalPages - 1 || loading ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageClick(totalPages - 1)}
                  disabled={currentPage === totalPages - 1 || loading}
                  aria-label="Última página"
                >
                  <i className="bi bi-chevron-double-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      
      {/* Indicador de carga */}
      {loading && (
        <div className="text-center mt-2">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pagination;
