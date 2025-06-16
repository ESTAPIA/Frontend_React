// src/components/product/ProductFilters/ProductFilters.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import styles from './ProductFilters.module.css';

/**
 * Componente de filtros para productos
 * Sub-iteración 5.2: Sistema de filtros y paginación
 */
const ProductFilters = ({ 
  categories = [],
  filters = {},
  onFiltersChange, 
  loading = false,
  totalProducts = 0
}) => {
  // Estados locales de filtros - inicializados con los filtros actuales
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
  const [priceRange, setPriceRange] = useState({
    min: filters.priceMin || '',
    max: filters.priceMax || ''
  });
  const [sortBy, setSortBy] = useState(filters.sortBy || 'name');
  // Debounce para búsqueda (evitar llamadas excesivas)
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Preparar categorías para el select
  const categoryOptions = useMemo(() => {
    const options = [{ id: '', name: 'Todas las categorías' }];
    categories.forEach(categoryName => {
      if (categoryName && !options.find(opt => opt.name === categoryName)) {
        options.push({ id: categoryName, name: categoryName });
      }
    });
    return options;
  }, [categories]);

  // Opciones de ordenamiento
  const sortOptions = [
    { value: 'name', label: 'Nombre A-Z' },
    { value: 'name_desc', label: 'Nombre Z-A' },
    { value: 'price', label: 'Precio: Menor a Mayor' },
    { value: 'price_desc', label: 'Precio: Mayor a Menor' },
    { value: 'newest', label: 'Más Recientes' },
  ];
  // Efecto para enviar cambios al componente padre
  useEffect(() => {
    const newFilters = {
      search: debouncedSearchTerm,
      category: selectedCategory,
      priceMin: priceRange.min,
      priceMax: priceRange.max,
      sortBy: sortBy
    };

    onFiltersChange?.(newFilters);
  }, [debouncedSearchTerm, selectedCategory, priceRange, sortBy, onFiltersChange]);

  // Handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handlePriceRangeChange = (field, value) => {
    setPriceRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSortBy('name');
  };

  const hasActiveFilters = searchTerm || selectedCategory || priceRange.min || priceRange.max || sortBy !== 'name';

  return (
    <div className={`${styles.productFilters} bg-light rounded p-4 mb-4`}>
      <div className="row g-3">
        {/* Header */}
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="text-dark-green mb-0">
              <i className="bi bi-funnel me-2"></i>
              Filtros de Búsqueda
            </h5>
            {hasActiveFilters && (
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={handleClearFilters}
                disabled={loading}
              >
                <i className="bi bi-x-circle me-1"></i>
                Limpiar
              </button>
            )}
          </div>
          
          {/* Contador de resultados */}
          <div className="text-muted mb-3">
            <small>
              {totalProducts > 0 ? (
                <>
                  <i className="bi bi-check-circle text-success me-1"></i>
                  {totalProducts} producto{totalProducts !== 1 ? 's' : ''} encontrado{totalProducts !== 1 ? 's' : ''}
                </>
              ) : (
                <>
                  <i className="bi bi-search me-1"></i>
                  Usa los filtros para encontrar productos
                </>
              )}
            </small>
          </div>
        </div>

        {/* Búsqueda por texto */}
        <div className="col-lg-4 col-md-6">
          <label htmlFor="searchInput" className="form-label small fw-bold">
            <i className="bi bi-search me-1"></i>
            Buscar producto
          </label>
          <div className="position-relative">
            <input
              id="searchInput"
              type="text"
              className="form-control"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={handleSearchChange}
              disabled={loading}
            />
            {searchTerm && (
              <button
                className="btn btn-sm btn-outline-secondary position-absolute top-50 end-0 translate-middle-y me-2"
                style={{ zIndex: 10 }}
                onClick={() => setSearchTerm('')}
                disabled={loading}
              >
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
        </div>

        {/* Filtro por categoría */}
        <div className="col-lg-3 col-md-6">
          <label htmlFor="categorySelect" className="form-label small fw-bold">
            <i className="bi bi-tag me-1"></i>
            Categoría
          </label>          <select
            id="categorySelect"
            className="form-select"
            value={selectedCategory}
            onChange={handleCategoryChange}
            disabled={loading}
          >
            {categoryOptions.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Rango de precios */}
        <div className="col-lg-3 col-md-6">
          <label className="form-label small fw-bold">
            <i className="bi bi-currency-dollar me-1"></i>
            Rango de precio
          </label>
          <div className="row g-2">            <div className="col-6">
              <input
                type="number"
                className="form-control form-control-sm"
                placeholder="Precio mín."
                value={priceRange.min}
                onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                disabled={loading}
                min="0"
                step="100000"
              />
            </div>
            <div className="col-6">
              <input
                type="number"
                className="form-control form-control-sm"
                placeholder="Precio máx."
                value={priceRange.max}
                onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                disabled={loading}
                min="0"
                step="100000"
              />
            </div>
          </div>
        </div>

        {/* Ordenamiento */}
        <div className="col-lg-2 col-md-6">
          <label htmlFor="sortSelect" className="form-label small fw-bold">
            <i className="bi bi-sort-down me-1"></i>
            Ordenar por
          </label>
          <select
            id="sortSelect"
            className="form-select"
            value={sortBy}
            onChange={handleSortChange}
            disabled={loading}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-top">
          <div className="d-flex flex-wrap gap-2">
            <small className="text-muted">Filtros activos:</small>
            
            {searchTerm && (
              <span className="badge bg-primary">
                Buscar: "{searchTerm}"
                <button
                  className="btn-close btn-close-white ms-1"
                  style={{ fontSize: '0.6em' }}
                  onClick={() => setSearchTerm('')}
                  disabled={loading}
                ></button>
              </span>
            )}
              {selectedCategory && (
              <span className="badge bg-secondary">
                Categoría: {categoryOptions.find(c => c.id === selectedCategory)?.name}
                <button
                  className="btn-close btn-close-white ms-1"
                  style={{ fontSize: '0.6em' }}
                  onClick={() => setSelectedCategory('')}
                  disabled={loading}
                ></button>
              </span>
            )}
            
            {(priceRange.min || priceRange.max) && (
              <span className="badge bg-info">
                Precio: ${priceRange.min || '0'} - ${priceRange.max || '∞'}
                <button
                  className="btn-close btn-close-white ms-1"
                  style={{ fontSize: '0.6em' }}
                  onClick={() => setPriceRange({ min: '', max: '' })}
                  disabled={loading}
                ></button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
