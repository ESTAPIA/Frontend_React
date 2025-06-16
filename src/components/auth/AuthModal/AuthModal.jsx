// src/components/auth/AuthModal/AuthModal.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Nav, Tab } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import authService from '../../../services/authService';
import styles from './AuthModal.module.css';

/**
 * Modal de autenticación con tabs Login/Register
 * Replica exactamente el modal del frontend original
 */
const AuthModal = ({ show, onClose, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  // Form para Login
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLogin
  } = useForm();

  // Form para Register
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetRegister,
    watch
  } = useForm();

  const password = watch('newPassword');

  // Manejar cierre del modal
  const handleClose = () => {
    resetLogin();
    resetRegister();
    setActiveTab('login');
    setIsLoading(false);
    onClose();
  };

  // Manejar login
  const onLoginSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const result = await authService.login({
        cedula: data.cedula,
        password: data.password
      });

      if (result.success) {
        login(result.data);
        toast.success('¡Bienvenido a Motoshop!');
        handleClose();
        if (onLoginSuccess) {
          onLoginSuccess(result.data.user);
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar registro
  const onRegisterSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const result = await authService.register({
        cedula: data.newCedula,
        password: data.newPassword,
        confirmPassword: data.confirmPassword
      });

      if (result.success) {
        toast.success('¡Registro exitoso! Bienvenido a Motoshop');
        login(result.data);
        handleClose();
        if (onLoginSuccess) {
          onLoginSuccess(result.data.user);
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (    <Modal 
      show={show} 
      onHide={handleClose}
      centered
      backdrop="static"
      className={styles.authModal}
    >
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title>
          <i className="bi bi-shield-lock-fill me-2"></i>
          Acceso al Sistema
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className={styles.modalBody}>
        {/* Pestañas de navegación */}
        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="login" className={styles.tabLink}>
                <i className="bi bi-box-arrow-in-right me-1"></i>
                Iniciar Sesión
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="register" className={styles.tabLink}>
                <i className="bi bi-person-plus-fill me-1"></i>
                Registrarse
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            {/* Pestaña de Login */}
            <Tab.Pane eventKey="login">
              <form onSubmit={handleLoginSubmit(onLoginSubmit)}>
                <div className="mb-3">
                  <label htmlFor="cedula" className="form-label">
                    <i className="bi bi-person-badge me-1"></i>
                    Cédula
                  </label>
                  <input
                    type="text"
                    className={`form-control ${loginErrors.cedula ? 'is-invalid' : ''}`}
                    id="cedula"
                    placeholder="Ingresa tu número de cédula"
                    {...registerLogin('cedula', {
                      required: 'La cédula es requerida',
                      minLength: {
                        value: 8,
                        message: 'La cédula debe tener al menos 8 dígitos'
                      }
                    })}
                  />
                  {loginErrors.cedula && (
                    <div className="invalid-feedback">
                      {loginErrors.cedula.message}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    <i className="bi bi-lock-fill me-1"></i>
                    Contraseña
                  </label>
                  <input
                    type="password"
                    className={`form-control ${loginErrors.password ? 'is-invalid' : ''}`}
                    id="password"
                    placeholder="Ingresa tu contraseña"
                    {...registerLogin('password', {
                      required: 'La contraseña es requerida'
                    })}
                  />
                  {loginErrors.password && (
                    <div className="invalid-feedback">
                      {loginErrors.password.message}
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary-green w-100"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Ingresando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Ingresar
                    </>
                  )}
                </button>
              </form>
            </Tab.Pane>

            {/* Pestaña de Registro */}
            <Tab.Pane eventKey="register">
              <form onSubmit={handleRegisterSubmit(onRegisterSubmit)}>
                <div className="mb-3">
                  <label htmlFor="newCedula" className="form-label">
                    <i className="bi bi-person-badge me-1"></i>
                    Cédula
                  </label>
                  <input
                    type="text"
                    className={`form-control ${registerErrors.newCedula ? 'is-invalid' : ''}`}
                    id="newCedula"
                    placeholder="Número de cédula sin guiones"
                    {...registerRegister('newCedula', {
                      required: 'La cédula es requerida',
                      pattern: {
                        value: /^[0-9]+$/,
                        message: 'La cédula solo debe contener números'
                      },
                      minLength: {
                        value: 8,
                        message: 'La cédula debe tener al menos 8 dígitos'
                      }
                    })}
                  />
                  <div className="form-text">
                    Ingresa tu número de cédula sin guiones ni espacios.
                  </div>
                  {registerErrors.newCedula && (
                    <div className="invalid-feedback">
                      {registerErrors.newCedula.message}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">
                    <i className="bi bi-lock-fill me-1"></i>
                    Contraseña
                  </label>
                  <input
                    type="password"
                    className={`form-control ${registerErrors.newPassword ? 'is-invalid' : ''}`}
                    id="newPassword"
                    placeholder="Crea una contraseña segura"
                    {...registerRegister('newPassword', {
                      required: 'La contraseña es requerida',
                      minLength: {
                        value: 6,
                        message: 'La contraseña debe tener al menos 6 caracteres'
                      }
                    })}
                  />
                  {registerErrors.newPassword && (
                    <div className="invalid-feedback">
                      {registerErrors.newPassword.message}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    <i className="bi bi-shield-check me-1"></i>
                    Confirmar contraseña
                  </label>
                  <input
                    type="password"
                    className={`form-control ${registerErrors.confirmPassword ? 'is-invalid' : ''}`}
                    id="confirmPassword"
                    placeholder="Confirma tu contraseña"
                    {...registerRegister('confirmPassword', {
                      required: 'Debes confirmar la contraseña',
                      validate: value =>
                        value === password || 'Las contraseñas no coinciden'
                    })}
                  />
                  {registerErrors.confirmPassword && (
                    <div className="invalid-feedback">
                      {registerErrors.confirmPassword.message}
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary-green w-100"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Registrando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus-fill me-2"></i>
                      Registrarse
                    </>
                  )}
                </button>
              </form>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>
    </Modal>
  );
};

AuthModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onLoginSuccess: PropTypes.func,
};

export default AuthModal;
