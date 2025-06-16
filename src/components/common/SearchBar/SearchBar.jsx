// src/components/common/SearchBar/SearchBar.jsx
import React, { useState, useCallback } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import styles from './SearchBar.module.css';

/**
 * Componente SearchBar - Barra de búsqueda con debounce
 * @param {Function} onSearch - Callback que se ejecuta al buscar
 * @param {string} placeholder - Texto placeholder
 * @param {number} debounceDelay - Delay para el debounce (default: 500ms)
 * @param {string} className - Clases CSS adicionales
 */
const SearchBar = ({ 
  onSearch, 
  placeholder = "Buscar...", 
  debounceDelay = 500,
  className = '',
  ...props 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Debounce del término de búsqueda
  const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay);

  // Ejecutar callback cuando cambie el término debounced
  React.useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const handleInputChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSearch(searchTerm);
  }, [searchTerm, onSearch]);

  return (
    <div className={`${styles.searchBar} ${className}`} {...props}>
      <form onSubmit={handleSubmit} className="position-relative">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleInputChange}
            aria-label="Buscar"
          />
          {searchTerm && (
            <button
              type="button"
              className="btn btn-outline-secondary border-start-0"
              onClick={handleClear}
              aria-label="Limpiar búsqueda"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
