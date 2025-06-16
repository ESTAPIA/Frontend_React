// src/components/profile/ProfileBanner/ProfileBanner.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import styles from './ProfileBanner.module.css';

/**
 * Banner superior que motiva al usuario a completar su perfil
 * Replica exactamente el comportamiento del global.js original
 */
const ProfileBanner = () => {
  const { isAuthenticated, user, isProfileComplete } = useAuth();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);

  // No mostrar si:
  // - Usuario no autenticado
  // - Perfil ya está completo
  // - Estamos en la página de perfil
  // - Banner fue cerrado manualmente
  if (!isAuthenticated || 
      isProfileComplete() || 
      location.pathname === '/profile' || 
      !isVisible) {
    return null;
  }

  // Función para cerrar el banner con animación
  const handleCloseBanner = () => {
    const bannerElement = document.getElementById('profile-banner');
    if (bannerElement) {
      bannerElement.classList.add(styles.dismissing);
      
      setTimeout(() => {
        setIsVisible(false);
      }, 400); // Tiempo de la animación de salida
    }
  };

  // Obtener nombre del usuario para personalización
  const userName = user?.cliNombre || user?.nombre || 'Usuario';

  return (
    <div 
      className={`${styles.professionalProfileBanner}`} 
      role="alert" 
      id="profile-banner"
    >
      <div className="container d-flex align-items-center py-3">
        {/* Icono del banner */}
        <div className={styles.bannerIcon}>
          <i className="bi bi-person-fill-check"></i>
        </div>
        
        {/* Contenido del banner */}
        <div className={styles.bannerContent}>
          <h6 className={styles.bannerTitle}>
            ¡Hola {userName}, completa tu perfil para comenzar!
          </h6>
          <p className={styles.bannerSubtitle}>
            Añade tu información personal para desbloquear todas las funcionalidades y realizar compras.
          </p>
        </div>
        
        {/* Acciones del banner */}
        <div className={styles.bannerActions}>
          <Link 
            to="/profile" 
            className={styles.btnCompleteProfile}
          >
            <i className="bi bi-person-fill-gear"></i>
            Completar Ahora
          </Link>
          <button 
            type="button" 
            className={styles.btnCloseModern}
            onClick={handleCloseBanner}
            aria-label="Cerrar banner"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
      
      {/* Indicador de progreso (decorativo) */}
      <div className={styles.progressIndicator}></div>
    </div>
  );
};

export default ProfileBanner;
