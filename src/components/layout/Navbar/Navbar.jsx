// src/components/layout/Navbar/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { useCart } from '../../../hooks/useCart';
import AuthModal from '../../auth/AuthModal';
import MiniCart from '../../cart/MiniCart/MiniCart';
import styles from './Navbar.module.css';

/**
 * Componente Navbar principal con autenticación integrada
 * Cambia dinámicamente entre navbar-guest y navbar-user según el estado de autenticación
 */
const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { itemCount, loadCart } = useCart(); // ✅ NUEVO: Hook del carrito
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMiniCart, setShowMiniCart] = useState(false); // ✅ NUEVO: Estado del mini-carrito  // 🔧 LÓGICA MEJORADA PARA OBTENER NOMBRE REAL DEL USUARIO
  const getUserDisplayName = (user) => {
    if (!user) return 'Usuario';
    
    // Opción 1: Nombre completo del cliente
    if (user.cliNombre) {
      return user.cliApellido ? `${user.cliNombre} ${user.cliApellido}` : user.cliNombre;
    }
    
    // Opción 2: Campos alternativos
    if (user.nombre) {
      return user.apellido ? `${user.nombre} ${user.apellido}` : user.nombre;
    }
    
    // Opción 3: Usar cédula como fallback amigable
    if (user.cedula) {
      return user.cedula;
    }
    
    // Opción 4: Obtener cédula de múltiples fuentes
    const cedula = user.username || 
                   localStorage.getItem('cedula') || 
                   localStorage.getItem('username');
    
    if (cedula) {
      return cedula;
    }
    
    // Fallback final
    return 'Usuario';
  };

  // ✅ NUEVO: Handlers del mini-carrito
  const handleCartClick = (e) => {
    e.preventDefault();
    setShowMiniCart(true);
  };

  const handleCloseMiniCart = () => {
    setShowMiniCart(false);
  };

  // ✅ NUEVO: Cargar carrito al montar el componente
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    }
  }, [isAuthenticated, loadCart]);
    // Verificación de roles y datos del usuario
  const userIsAdmin = isAdmin();
  const userName = getUserDisplayName(user);
  
  // 🔍 LOGGING TEMPORAL PARA DEBUGGING (remover después)
  React.useEffect(() => {
    if (user) {
      console.log('👤 Datos del usuario en Navbar:', user);
      console.log('🏷️ Nombre mostrado:', userName);
    }
  }, [user, userName]);
  
  // Función para obtener enlaces dinámicos según rol
  const getNavLinks = () => {
    const baseLinks = [
      { to: '/catalog', icon: 'bi-grid-3x3-gap', text: 'Catálogo' }
    ];
    
    if (userIsAdmin) {
      return [
        ...baseLinks,
        { to: '/admin', icon: 'bi-speedometer2', text: 'Dashboard Admin' },
        { to: '/admin/products', icon: 'bi-box-seam', text: 'Productos' },
        { to: '/admin/orders', icon: 'bi-receipt-cutoff', text: 'Pedidos Admin' },
        { to: '/profile', icon: 'bi-person-circle', text: 'Mi Perfil' }
      ];
    }
    
    return [
      ...baseLinks,
      { to: '/profile', icon: 'bi-person-circle', text: 'Mi Perfil' },
      { to: '/orders', icon: 'bi-receipt', text: 'Mis Pedidos' },
      { to: '/facturas', icon: 'bi-file-earmark-text', text: 'Facturas' }
    ];
  };

  const navLinks = getNavLinks();

  const handleAuthClick = () => {
    setShowAuthModal(true);
  };

  const handleCloseModal = () => {
    setShowAuthModal(false);
  };
  const handleLogout = () => {
    logout();
    toast.success('¡Sesión cerrada correctamente!');
  };

  // Renderizar navbar para usuarios invitados
  if (!isAuthenticated) {
    return (
      <>
        <nav className={`${styles.navbar} ${styles.navbarGuest} navbar navbar-expand-lg navbar-guest-modern sticky-top`}>
          <div className="container">
            {/* Brand mejorado con ícono */}
            <Link className={`${styles.brandEnhanced} navbar-brand brand-enhanced`} to="/">
              <i className="bi bi-motorcycle me-2"></i>
              <span className="brand-text">MotoShop</span>
            </Link>
            
            {/* Botón hamburguesa mejorado */}
            <button 
              className="navbar-toggler custom-toggler" 
              type="button" 
              data-bs-toggle="collapse"
              data-bs-target="#guestNav" 
              aria-controls="guestNav" 
              aria-expanded="false" 
              aria-label="Menú de navegación"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            
            {/* Navegación colapsable */}
            <div className="collapse navbar-collapse" id="guestNav">
              {/* Enlaces de navegación */}
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <Link className="nav-link nav-link-enhanced" to="/catalog">
                    <i className="bi bi-shop me-1"></i>
                    Catálogo
                  </Link>
                </li>
              </ul>
              
              {/* Botones de autenticación mejorados */}
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <button
                    className={`${styles.btnAuthGuest} btn btn-auth-guest`}
                    onClick={handleAuthClick}
                  >
                    <i className="bi bi-person-circle me-2"></i>
                    <span className="auth-text">
                      <span className="auth-primary">Iniciar Sesión</span>
                      <span className="auth-secondary">/ Registrarse</span>
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>        {/* Modal de autenticación */}
        <AuthModal
          show={showAuthModal}
          onClose={handleCloseModal}
        />
      </>
    );
  }
  // Renderizar navbar para usuarios autenticados
  return (
    <nav className={`${styles.navbar} ${styles.navbarUser} ${userIsAdmin ? styles.navbarAdmin : ''} navbar navbar-expand-lg navbar-user-modern sticky-top`}>
      <div className="container">
        {/* Brand mejorado con ícono */}
        <Link className={`${styles.brandEnhanced} navbar-brand brand-enhanced`} to="/">
          <i className="bi bi-motorcycle me-2"></i>
          <span className="brand-text">MotoShop</span>
          {userIsAdmin && <span className={`${styles.adminBadge} badge bg-warning ms-2`}>Admin</span>}
        </Link>
        
        {/* Botón hamburguesa mejorado */}
        <button 
          className="navbar-toggler custom-toggler" 
          type="button" 
          data-bs-toggle="collapse"
          data-bs-target="#userNav" 
          aria-controls="userNav" 
          aria-expanded="false" 
          aria-label="Menú de navegación"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        {/* Navegación colapsable */}
        <div className="collapse navbar-collapse" id="userNav">          {/* Enlaces de navegación dinámicos según rol */}
          <ul className="navbar-nav me-auto">
            {navLinks.map((link, index) => (
              <li key={index} className="nav-item">
                <Link className="nav-link nav-link-enhanced" to={link.to}>
                  <i className={`${link.icon} me-1`}></i> {link.text}
                </Link>
              </li>
            ))}
          </ul>
            {/* Menú de usuario y carrito */}
          <ul className="navbar-nav ms-auto">
            {/* Carrito modernizado */}
            <li className="nav-item" id="cart-icon-container">
              <button
                className={`${styles.navCartModern} nav-link nav-cart-modern position-relative`}
                onClick={handleCartClick}
                title="Mi Carrito"
                aria-label="Abrir carrito de compras"
              >
                <i className="bi bi-cart3"></i>
                <span 
                  className={`cart-badge badge rounded-pill ${itemCount > 0 ? styles.hasItems : ''}`}
                  id="cart-counter"
                >
                  {itemCount}
                  <span className="visually-hidden">productos en carrito</span>
                </span>
              </button>
            </li>
              {/* Dropdown de usuario profesional */}
            <li className="nav-item dropdown">              <button
                className={`${styles.userDropdownModern} nav-link dropdown-toggle user-dropdown-modern`}
                id="userDropdown" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <div className="user-avatar">
                  <i className="bi bi-person-circle"></i>
                </div>
                <div className="user-info">
                  <span className="user-cedula">{userName}</span>
                  <small className={`user-role ${userIsAdmin ? styles.adminRole : styles.userRole}`}>
                    {userIsAdmin ? 'Administrador' : 'Cliente'}
                  </small>
                </div>
              </button>              <ul className="dropdown-menu dropdown-menu-end user-dropdown-menu" aria-labelledby="userDropdown">
                <li className="dropdown-header">
                  <div className="dropdown-user-info">
                    <i className="bi bi-person-circle user-avatar-large"></i>
                    <div>
                      <div className="dropdown-username">{userName}</div>
                      <small className={`dropdown-role ${userIsAdmin ? styles.adminRoleText : styles.userRoleText}`}>
                        {userIsAdmin ? 'Administrador del Sistema' : 'Cliente Registrado'}
                        {userIsAdmin && <i className="bi bi-shield-check ms-1"></i>}
                      </small>
                    </div>
                  </div>
                </li>
                <li><hr className="dropdown-divider"></hr></li>
                <li>
                  <Link className="dropdown-item dropdown-item-modern" to="/profile">
                    <i className="bi bi-person-gear me-2"></i>
                    <span>Mi Perfil</span>
                  </Link>
                </li>
                {!userIsAdmin && (
                  <>
                    <li>
                      <Link className="dropdown-item dropdown-item-modern" to="/orders">
                        <i className="bi bi-bag-check me-2"></i>
                        <span>Mis Pedidos</span>
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item dropdown-item-modern" to="/facturas">
                        <i className="bi bi-receipt me-2"></i>
                        <span>Mis Facturas</span>
                      </Link>
                    </li>
                  </>
                )}
                <li>
                  <Link className="dropdown-item dropdown-item-modern" to="/cart">
                    <i className="bi bi-cart3 me-2"></i>
                    <span>Ver Carrito</span>
                  </Link>
                </li>
                {userIsAdmin && (
                  <>
                    <li><hr className="dropdown-divider"></hr></li>
                    <li className="dropdown-header">
                      <small className="text-muted">Panel de Administración</small>
                    </li>
                    <li>
                      <Link className="dropdown-item dropdown-item-modern" to="/admin">
                        <i className="bi bi-speedometer2 me-2"></i>
                        <span>Dashboard</span>
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item dropdown-item-modern" to="/admin/products">
                        <i className="bi bi-box-seam me-2"></i>
                        <span>Gestión Productos</span>
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item dropdown-item-modern" to="/admin/orders">
                        <i className="bi bi-receipt-cutoff me-2"></i>
                        <span>Gestión Pedidos</span>
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item dropdown-item-modern" to="/admin/users">
                        <i className="bi bi-people me-2"></i>
                        <span>Gestión Usuarios</span>
                      </Link>
                    </li>
                  </>
                )}
                <li><hr className="dropdown-divider"></hr></li>                <li>
                  <button
                    className="dropdown-item dropdown-item-logout"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    <span>Cerrar Sesión</span>
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
      
      {/* MiniCart Modal */}
      <MiniCart 
        show={showMiniCart}
        onClose={handleCloseMiniCart}
      />
    </nav>
  );
};

export default Navbar;
