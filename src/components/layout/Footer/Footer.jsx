// src/components/layout/Footer/Footer.jsx
import React from 'react';
import styles from './Footer.module.css';

/**
 * Componente Footer de Motoshop
 * Información de contacto, enlaces y derechos de autor
 */
const Footer = () => {
  return (
    <footer className={`${styles.footer} mt-auto`}>
      <div className="container">
        <div className="row">
          {/* Información de la empresa */}
          <div className="col-lg-4 col-md-6 mb-4">
            <h5 className={styles.footerTitle}>
              <i className="bi bi-gear-fill me-2"></i>
              Motoshop
            </h5>
            <p className={styles.footerText}>
              Tu tienda especializada en motocicletas y accesorios. 
              Calidad y confianza desde hace más de 10 años.
            </p>            <div className={styles.socialLinks}>
              <button className={`${styles.socialLink} me-3`} onClick={() => window.open('https://facebook.com', '_blank')}>
                <i className="bi bi-facebook"></i>
              </button>
              <button className={`${styles.socialLink} me-3`} onClick={() => window.open('https://instagram.com', '_blank')}>
                <i className="bi bi-instagram"></i>
              </button>
              <button className={`${styles.socialLink} me-3`} onClick={() => window.open('https://twitter.com', '_blank')}>
                <i className="bi bi-twitter"></i>
              </button>
              <button className={styles.socialLink} onClick={() => window.open('https://wa.me/50622223333', '_blank')}>
                <i className="bi bi-whatsapp"></i>
              </button>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className={styles.footerSubtitle}>Enlaces Rápidos</h6>
            <ul className={styles.footerLinks}>
              <li><a href="/">Inicio</a></li>
              <li><a href="/catalog">Catálogo</a></li>
              <li><a href="/about">Nosotros</a></li>
              <li><a href="/contact">Contacto</a></li>
            </ul>
          </div>

          {/* Categorías */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h6 className={styles.footerSubtitle}>Categorías</h6>
            <ul className={styles.footerLinks}>
              <li><a href="/catalog?category=motocicletas">Motocicletas</a></li>
              <li><a href="/catalog?category=cascos">Cascos</a></li>
              <li><a href="/catalog?category=accesorios">Accesorios</a></li>
              <li><a href="/catalog?category=repuestos">Repuestos</a></li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h6 className={styles.footerSubtitle}>Contacto</h6>
            <div className={styles.contactInfo}>
              <p>
                <i className="bi bi-geo-alt-fill me-2"></i>
                San José, Costa Rica
              </p>
              <p>
                <i className="bi bi-telephone-fill me-2"></i>
                +506 2222-3333
              </p>
              <p>
                <i className="bi bi-envelope-fill me-2"></i>
                info@motoshop.cr
              </p>
              <p>
                <i className="bi bi-clock-fill me-2"></i>
                Lun-Vie: 8:00-17:00
              </p>
            </div>
          </div>
        </div>

        {/* Separador y derechos de autor */}
        <hr className={styles.footerDivider} />
        <div className="row">
          <div className="col-md-6">
            <p className={styles.copyright}>
              © 2025 Motoshop. Todos los derechos reservados.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className={styles.poweredBy}>
              Desarrollado con <i className="bi bi-heart-fill text-danger"></i> por el equipo Motoshop
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
