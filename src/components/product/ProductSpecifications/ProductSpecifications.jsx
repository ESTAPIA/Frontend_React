import React from 'react';
import styles from './ProductSpecifications.module.css';

const ProductSpecifications = ({ product }) => {
  if (!product) return null;

  // Construir especificaciones desde los datos del producto
  const specifications = [
    {
      label: 'Marca',
      value: product.marca || 'No especificado'
    },
    {
      label: 'Modelo',
      value: product.modelo || 'No especificado'
    },
    {
      label: 'Categoría',
      value: product.categoria || 'No especificado'
    },
    {
      label: 'Precio',
      value: product.precio ? `$${product.precio.toLocaleString()}` : 'Consultar'
    },
    {
      label: 'Stock disponible',
      value: product.stock !== undefined ? `${product.stock} unidades` : 'No especificado'
    }
  ];

  // Agregar especificaciones adicionales si existen
  if (product.especificaciones) {
    if (product.especificaciones.motor) {
      specifications.push({
        label: 'Motor',
        value: product.especificaciones.motor
      });
    }
    if (product.especificaciones.cilindrada) {
      specifications.push({
        label: 'Cilindrada',
        value: product.especificaciones.cilindrada
      });
    }
    if (product.especificaciones.potencia) {
      specifications.push({
        label: 'Potencia',
        value: product.especificaciones.potencia
      });
    }
    if (product.especificaciones.transmision) {
      specifications.push({
        label: 'Transmisión',
        value: product.especificaciones.transmision
      });
    }
    if (product.especificaciones.combustible) {
      specifications.push({
        label: 'Combustible',
        value: product.especificaciones.combustible
      });
    }
    if (product.especificaciones.peso) {
      specifications.push({
        label: 'Peso',
        value: product.especificaciones.peso
      });
    }
    if (product.especificaciones.dimensiones) {
      specifications.push({
        label: 'Dimensiones',
        value: product.especificaciones.dimensiones
      });
    }
  }
  // Filtrar especificaciones vacías
  const validSpecifications = specifications.filter(spec => 
    spec.value && spec.value !== 'No especificado' && spec.value !== 'Consultar'
  );

  // Si no hay especificaciones válidas, no renderizar nada
  if (validSpecifications.length === 0) {
    return null;
  }

  return (
    <div className={styles.specifications}>
      <h3 className={styles.title}>
        <i className="fas fa-cogs"></i>
        Especificaciones Técnicas
      </h3>
      
      <div className={styles.table}>
        {validSpecifications.map((spec, index) => (
          <div key={index} className={styles.row}>
            <div className={styles.label}>
              {spec.label}
            </div>
            <div className={styles.value}>
              {spec.value}
            </div>
          </div>
        ))}
      </div>
      
      {product.descripcion && (
        <div className={styles.description}>
          <h4 className={styles.descriptionTitle}>Descripción</h4>
          <p className={styles.descriptionText}>
            {product.descripcion}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductSpecifications;
