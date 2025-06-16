// src/components/layout/Layout/Layout.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import ProfileBanner from '../../profile/ProfileBanner/ProfileBanner';
import { ApiStatus } from '../../dev';
import styles from './Layout.module.css';

/**
 * Componente Layout principal de la aplicación Motoshop
 * Proporciona la estructura base: Navbar + Main Content + Footer
 */
const Layout = ({ children }) => {  return (
    <div className={`${styles.layout} d-flex flex-column min-vh-100`}>
      {/* Navegación principal */}
      <Navbar />
      
      {/* Banner de perfil incompleto */}
      <ProfileBanner />
      
      {/* Contenido principal */}
      <main className={`${styles.mainContent} flex-grow-1`}>
        {children}
      </main>
      
      {/* Pie de página */}
      <Footer />
      
      {/* Componente de desarrollo - API Status */}
      <ApiStatus />
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
