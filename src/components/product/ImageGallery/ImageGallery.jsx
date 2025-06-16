// src/components/product/ImageGallery/ImageGallery.jsx
import React, { useState } from 'react';
import styles from './ImageGallery.module.css';

/**
 * Componente ImageGallery - Galería de imágenes de producto con carousel
 * @param {Array} images - URLs de las imágenes
 * @param {string} productName - Nombre del producto para alt text
 * @param {string} className - Clases CSS adicionales
 */
const ImageGallery = ({ 
  images = [], 
  productName = '', 
  className = '',
  ...props 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState({});

  // Imagen por defecto si no hay imágenes o fallan
  const defaultImage = '/images/no-image.png';
  
  // Preparar imágenes válidas
  const validImages = images.length > 0 ? images : [defaultImage];

  const handleImageError = (index) => {
    setImageError(prev => ({ ...prev, [index]: true }));
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  const goToPrevious = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? validImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex(prev => 
      prev === validImages.length - 1 ? 0 : prev + 1
    );
  };

  const getImageSrc = (imageSrc, index) => {
    if (imageError[index]) {
      return defaultImage;
    }
    
    // Si la imagen empieza con '/', es una ruta relativa del public
    if (imageSrc.startsWith('/')) {
      return imageSrc;
    }
    
    // Si no es una URL completa, usar imagen por defecto
    if (!imageSrc.startsWith('http')) {
      return defaultImage;
    }
    
    return imageSrc;
  };

  return (
    <div className={`${styles.imageGallery} ${className}`} {...props}>
      {/* Imagen principal */}
      <div className={styles.mainImageContainer}>
        <img
          src={getImageSrc(validImages[currentImageIndex], currentImageIndex)}
          alt={`${productName} - Vista ${currentImageIndex + 1}`}
          className={styles.mainImage}
          onError={() => handleImageError(currentImageIndex)}
          loading="lazy"
        />
        
        {/* Controles de navegación para múltiples imágenes */}
        {validImages.length > 1 && (
          <>
            <button
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={goToPrevious}
              aria-label="Imagen anterior"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            
            <button
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={goToNext}
              aria-label="Imagen siguiente"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
            
            {/* Indicadores */}
            <div className={styles.indicators}>
              {validImages.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.indicator} ${
                    index === currentImageIndex ? styles.active : ''
                  }`}
                  onClick={() => goToImage(index)}
                  aria-label={`Ir a imagen ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails para múltiples imágenes */}
      {validImages.length > 1 && (
        <div className={styles.thumbnailsContainer}>
          <div className={styles.thumbnails}>
            {validImages.map((image, index) => (
              <button
                key={index}
                className={`${styles.thumbnail} ${
                  index === currentImageIndex ? styles.activeThumbnail : ''
                }`}
                onClick={() => goToImage(index)}
                aria-label={`Ver imagen ${index + 1}`}
              >
                <img
                  src={getImageSrc(image, index)}
                  alt={`${productName} - Miniatura ${index + 1}`}
                  onError={() => handleImageError(index)}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Badge de cantidad de imágenes */}
      {validImages.length > 1 && (
        <div className={styles.imageCounter}>
          <span className="badge bg-dark">
            {currentImageIndex + 1} / {validImages.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
