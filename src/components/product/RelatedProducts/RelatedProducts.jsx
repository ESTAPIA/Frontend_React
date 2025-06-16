import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../../services/productService';
import { mockFeaturedProducts } from '../../../data/mockProducts';
import ProductCard from '../ProductCard/ProductCard';
import styles from './RelatedProducts.module.css';

const RelatedProducts = ({ currentProduct, limit = 4 }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!currentProduct) return;
      
      try {
        setLoading(true);
        setError(null);
          // Intentar obtener todos los productos de la API
        const response = await productService.getAllProducts();
        
        if (response.success && response.data && Array.isArray(response.data)) {
          // Verificar si el producto actual existe en la API
          const currentProductExistsInAPI = response.data.some(product => 
            (product.idProducto || product.id) === (currentProduct.idProducto || currentProduct.id)
          );
          
          // Solo mostrar productos relacionados si el producto actual existe en la API
          if (currentProductExistsInAPI) {
            // Filtrar productos por la misma categoría del producto actual
            const sameCategory = response.data.filter(product => {
              const productCategory = product.categoriaNombre || product.categoria;
              const currentCategory = currentProduct.categoriaNombre || currentProduct.categoria;
              
              return productCategory === currentCategory && 
                     (product.idProducto || product.id) !== (currentProduct.idProducto || currentProduct.id);
            });
            
            // Si hay productos de la misma categoría, usar esos
            if (sameCategory.length > 0) {
              setRelatedProducts(sameCategory.slice(0, limit));
            } else {
              // Si no hay productos de la misma categoría, obtener productos aleatorios de la API
              const otherProducts = response.data.filter(product => 
                (product.idProducto || product.id) !== (currentProduct.idProducto || currentProduct.id)
              );
              setRelatedProducts(otherProducts.slice(0, limit));
            }
          } else {
            // Si el producto actual no existe en la API, no mostrar productos relacionados
            console.warn('Producto actual no encontrado en la API, no se mostrarán productos relacionados');
            setRelatedProducts([]);
          }
        } else {
          // Solo usar mock si la API falla completamente
          console.warn('API falló, usando datos mock para productos relacionados');
          await loadMockRelatedProducts();
        }
      } catch (err) {
        console.error('Error fetching related products:', err);
        console.warn('Usando datos mock como fallback');
        await loadMockRelatedProducts();
      } finally {
        setLoading(false);
      }
    };

    const loadMockRelatedProducts = async () => {
      try {
        // Filtrar productos mock por la misma categoría
        const sameCategory = mockFeaturedProducts.filter(product => {
          const productCategory = product.categoriaNombre || product.categoria;
          const currentCategory = currentProduct.categoriaNombre || currentProduct.categoria;
          
          return productCategory === currentCategory && 
                 (product.idProducto || product.id) !== (currentProduct.idProducto || currentProduct.id);
        });
        
        // Si hay productos de la misma categoría en el mock, usar esos
        if (sameCategory.length > 0) {
          setRelatedProducts(sameCategory.slice(0, limit));
        } else {
          // Si no, usar productos aleatorios del mock
          const otherProducts = mockFeaturedProducts.filter(product => 
            (product.idProducto || product.id) !== (currentProduct.idProducto || currentProduct.id)
          );
          setRelatedProducts(otherProducts.slice(0, limit));
        }
      } catch (mockErr) {
        console.error('Error loading mock related products:', mockErr);
        setError('No se pudieron cargar los productos relacionados');
        setRelatedProducts([]);
      }
    };

    fetchRelatedProducts();
  }, [currentProduct, limit]);

  if (loading) {
    return (
      <div className={styles.relatedProducts}>
        <h3 className={styles.title}>
          <i className="fas fa-heart"></i>
          Productos Relacionados
        </h3>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando productos relacionados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.relatedProducts}>
        <h3 className={styles.title}>
          <i className="fas fa-heart"></i>
          Productos Relacionados
        </h3>
        <div className={styles.error}>
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return (
      <div className={styles.relatedProducts}>
        <h3 className={styles.title}>
          <i className="fas fa-heart"></i>
          Productos Relacionados
        </h3>
        <div className={styles.empty}>
          <i className="fas fa-search"></i>
          <p>No se encontraron productos relacionados</p>
          <Link to="/catalog" className={styles.catalogLink}>
            Ver todo el catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.relatedProducts}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <i className="fas fa-heart"></i>
          Productos Relacionados
        </h3>
        <Link to="/catalog" className={styles.viewAllLink}>
          Ver todos
          <i className="fas fa-arrow-right"></i>
        </Link>
      </div>      <div className={styles.productsGrid}>
        {relatedProducts.map(product => (
          <div key={product.idProducto || product.id} className={styles.productItem}>
            <ProductCard 
              product={product}
            />
          </div>
        ))}
      </div>
        {relatedProducts.length >= limit && (
        <div className={styles.footer}>
          <Link to={`/catalog?categoria=${encodeURIComponent(currentProduct.categoriaNombre || currentProduct.categoria || '')}`} className={styles.categoryLink}>
            Ver más productos en {currentProduct.categoriaNombre || currentProduct.categoria}
            <i className="fas fa-external-link-alt"></i>
          </Link>
        </div>
      )}
    </div>
  );
};

export default RelatedProducts;
