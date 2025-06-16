import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/globals.css';
import './App.css';

// Importar Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CheckoutProvider } from './context/CheckoutContext';
import { NotificationProvider } from './context/NotificationContext';

// Importar Layout
import Layout from './components/layout/Layout';

// Importar componentes de protección
import ProtectedRoute from './components/auth/ProtectedRoute';

// Importar páginas
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout/Checkout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <CheckoutProvider>
            <NotificationProvider>
              <div className="App">
                <Layout>
              <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/catalog/product/:id" element={<ProductDetail />} />
              
              {/* Rutas protegidas - requieren autenticación */}
              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_ADMIN']}>
                  <Profile />
                </ProtectedRoute>
              } />
              
              <Route path="/orders" element={
                <ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_ADMIN']}>
                  <div className="container text-center py-5">
                    <h2 className="text-primary-green">Mis Pedidos</h2>
                    <p>Aquí verás tu historial de pedidos.</p>
                    <small className="text-muted">Página en desarrollo</small>
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/cart" element={
                <ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_ADMIN']}>
                  <Cart />
                </ProtectedRoute>
              } />
              
              <Route path="/checkout" element={
                <ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_ADMIN']}>
                  <Checkout />
                </ProtectedRoute>
              } />
              
              <Route path="/facturas" element={
                <ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_ADMIN']}>
                  <div className="container text-center py-5">
                    <h2 className="text-primary-green">Mis Facturas</h2>
                    <p>Aquí verás tus facturas.</p>
                    <small className="text-muted">Página en desarrollo</small>
                  </div>
                </ProtectedRoute>
              } />
              
              {/* Ruta protegida SOLO para admin */}
              <Route path="/admin" element={
                <ProtectedRoute 
                  requireAdmin={true}
                  allowedRoles={['ROLE_ADMIN']}
                  fallbackPath="/profile"
                >
                  <div className="container text-center py-5">
                    <h2 className="text-warning">Panel de Administración</h2>
                    <p>Bienvenido al panel de administración.</p>
                    <small className="text-muted">Página en desarrollo</small>
                  </div>
                </ProtectedRoute>
              } />
              
              {/* Página 404 */}
              <Route path="*" element={
                <div className="container text-center py-5">
                  <h2 className="text-primary-green">Página no encontrada</h2>
                  <p>La página que buscas no existe.</p>
                </div>
              } />
            </Routes>
          </Layout>
          
          {/* Toast notifications */}
          <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{
              top: 20,
              left: 20,
              right: 20,
            }}
            toastOptions={{
              // Configuración por defecto para todos los toasts
              duration: 4000,
              style: {
                background: 'var(--primary-cream)',
                color: 'var(--dark-green)',
                border: '2px solid var(--primary-green)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                maxWidth: '500px',
                padding: '16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              },
              // Toast de éxito
              success: {
                duration: 3000,
                iconTheme: {
                  primary: 'var(--secondary-green)',
                  secondary: 'var(--primary-cream)',
                },
                style: {
                  background: '#E8F5E8',
                  color: '#2E7D32',
                  border: '2px solid #4CAF50',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  maxWidth: '500px',
                  padding: '16px',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
                }
              },
              // Toast de error
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#D32F2F',
                  secondary: '#FFF3E0',
                },
                style: {
                  background: '#FFF3E0',
                  color: '#E65100',
                  border: '2px solid #FFB74D',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  maxWidth: '500px',
                  padding: '16px',
                  boxShadow: '0 4px 12px rgba(255, 183, 77, 0.3)',
                }
              },
              // Toast de loading
              loading: {
                duration: Infinity,
                style: {
                  background: '#F5F5F5',
                  color: '#424242',
                  border: '2px solid #BDBDBD',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  maxWidth: '500px',
                  padding: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }
              }
            }}
          />
        </div>
      </NotificationProvider>
      </CheckoutProvider>
      </CartProvider>
    </AuthProvider>
    </Router>
  );
}

export default App;
