// src/components/profile/ProfileForm/ProfileForm.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import apiClient from '../../../services/api';
import styles from './ProfileForm.module.css';

/**
 * Componente de formulario para editar perfil de usuario
 * Replicando funcionalidad del profile.js original
 */
const ProfileForm = ({ onClose, onSuccess }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    password: ''
  });
  
  const [validation, setValidation] = useState({
    nombre: { isValid: true, message: '' },
    apellido: { isValid: true, message: '' },
    telefono: { isValid: true, message: '' },
    email: { isValid: true, message: '' },
    password: { isValid: true, message: '' }
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    if (user) {
      setFormData({
        cedula: user.cedula || '',
        nombre: user.cliNombre || '',
        apellido: user.cliApellido || '',
        telefono: user.cliTelefono || '',
        email: user.cliCorreo || '',
        password: ''
      });
    }
  }, [user]);

  // Función de validación en tiempo real
  const validateField = (fieldName, value) => {
    let isValid = true;
    let message = '';

    switch (fieldName) {
      case 'nombre':
      case 'apellido':
        if (!value.trim()) {
          isValid = false;
          message = 'Este campo es requerido';
        } else if (value.trim().length < 2) {
          isValid = false;
          message = 'Debe tener al menos 2 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          isValid = false;
          message = 'Solo se permiten letras y espacios';
        } else {
          message = '✓ Válido';
        }
        break;

      case 'telefono':
        if (!value.trim()) {
          isValid = false;
          message = 'Este campo es requerido';        } else if (!/^[0-9\-+() ]+$/.test(value)) {
          isValid = false;
          message = 'Formato de teléfono inválido';
        } else if (value.replace(/\D/g, '').length < 10) {
          isValid = false;
          message = 'Debe tener al menos 10 dígitos';
        } else {
          message = '✓ Válido';
        }
        break;

      case 'email':
        if (!value.trim()) {
          isValid = false;
          message = 'Este campo es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          isValid = false;
          message = 'Formato de email inválido';
        } else {
          message = '✓ Válido';
        }
        break;

      case 'password':
        if (value && value.length > 0) {
          if (value.length < 6) {
            isValid = false;
            message = 'Debe tener al menos 6 caracteres';
          } else {
            message = '✓ Válido';
          }
        } else {
          message = 'Dejar vacío para mantener actual';
        }
        break;

      default:
        break;
    }

    setValidation(prev => ({
      ...prev,
      [fieldName]: { isValid, message }
    }));

    return isValid;
  };

  // Manejar cambios en los campos
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar campo en tiempo real
    validateField(name, value);
  };

  // Validar todos los campos
  const validateAllFields = () => {
    const fieldsToValidate = ['nombre', 'apellido', 'telefono', 'email'];
    let allValid = true;

    fieldsToValidate.forEach(field => {
      const isValid = validateField(field, formData[field]);
      if (!isValid) allValid = false;
    });

    // Validar password solo si tiene valor
    if (formData.password) {
      const isPasswordValid = validateField('password', formData.password);
      if (!isPasswordValid) allValid = false;
    }

    return allValid;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar todos los campos antes de enviar
    if (!validateAllFields()) {
      toast.error('Por favor corrige los errores en el formulario', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#FFF3E0',
          color: '#E65100',
          border: '1px solid #FFB74D',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500'
        }
      });
      return;
    }

    setIsLoading(true);

    try {
      // Preparar datos para enviar
      const userData = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        telefono: formData.telefono.trim(),
        email: formData.email.trim()
      };      // Añadir password solo si se proporcionó (usando el campo correcto para el backend)
      if (formData.password && formData.password.trim()) {
        userData.nuevaPassword = formData.password.trim();
      }

      console.log('🔄 Actualizando perfil de usuario...', userData);

      // ✅ CORRECCIÓN: Usar el endpoint correcto como en el frontend original
      const response = await apiClient.put('/usuarios/actualizar-cliente', userData);      const result = response.data;
      console.log('✅ Perfil actualizado exitosamente:', result);

      // ✅ Verificar respuesta exitosa del backend
      if (result.mensaje && (result.mensaje.includes('actualizado') || result.mensaje.includes('éxito'))) {
        // Actualizar el contexto de usuario con los datos devueltos por el backend
        const updatedUserData = {
          ...user,
          cliNombre: result.nombre || userData.nombre,
          cliApellido: result.apellido || userData.apellido,
          cliTelefono: result.telefono || userData.telefono,
          cliCorreo: result.email || userData.email
        };

        updateUser(updatedUserData);

        // Actualizar localStorage para profileComplete
        const isProfileComplete = Boolean(
          updatedUserData.cliNombre && 
          updatedUserData.cliApellido && 
          updatedUserData.cliTelefono && 
          updatedUserData.cliCorreo
        );
        localStorage.setItem('profileComplete', isProfileComplete.toString());

        // Mostrar notificación de éxito
        toast.success(result.mensaje || '¡Perfil actualizado exitosamente!', {
          duration: 4000,
          position: 'top-center',
          icon: '🎉',
          style: {
            background: '#E8F5E8',
            color: '#2E7D32',
            border: '2px solid #4CAF50',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            padding: '16px'
          }
        });

        // Llamar callback de éxito
        if (onSuccess) {
          onSuccess(updatedUserData);
        }

        // Cerrar formulario después de un breve delay
        setTimeout(() => {
          if (onClose) {
            onClose();
          }
        }, 1500);

      } else {
        throw new Error(result.error || 'Error inesperado al actualizar perfil');
      }    } catch (error) {
      console.error('❌ Error al actualizar perfil:', error);
      
      let errorMessage = 'Error al actualizar perfil';
      
      // Manejo específico de errores de Axios
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#FFF3E0',
          color: '#E65100',
          border: '1px solid #FFB74D',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.profileFormContainer}>
      <div className={styles.editFormHeader}>
        <h4 className={styles.editTitle}>
          <i className="bi bi-pencil-square"></i> 
          Editar Información Personal
        </h4>
        <p className={styles.editSubtitle}>
          Actualiza tus datos para mantener tu perfil al día
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.modernForm}>
        <div className="row g-4">
          {/* Cédula (solo lectura) */}
          <div className="col-md-6">
            <div className={styles.modernFormGroup}>
              <label htmlFor="cedula" className={styles.modernLabel}>
                <i className="bi bi-card-text me-2"></i>
                Cédula de Identidad
              </label>
              <input 
                type="text" 
                className={`${styles.modernInput} ${styles.disabledInput}`}
                id="cedula"
                name="cedula"
                value={formData.cedula}
                disabled
              />
              <small className={styles.formHelp}>
                La cédula no se puede modificar
              </small>
            </div>
          </div>
          
          {/* Nombre */}
          <div className="col-md-6">
            <div className={styles.modernFormGroup}>
              <label htmlFor="nombre" className={styles.modernLabel}>
                <i className="bi bi-person me-2"></i>
                Nombre *
              </label>
              <input 
                type="text" 
                className={`${styles.modernInput} ${
                  validation.nombre.isValid ? styles.validInput : styles.invalidInput
                }`}
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />
              <div className={`${styles.validationFeedback} ${
                validation.nombre.isValid ? styles.validFeedback : styles.invalidFeedback
              }`}>
                {validation.nombre.message}
              </div>
            </div>
          </div>
          
          {/* Apellido */}
          <div className="col-md-6">
            <div className={styles.modernFormGroup}>
              <label htmlFor="apellido" className={styles.modernLabel}>
                <i className="bi bi-person me-2"></i>
                Apellido *
              </label>
              <input 
                type="text" 
                className={`${styles.modernInput} ${
                  validation.apellido.isValid ? styles.validInput : styles.invalidInput
                }`}
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                required
              />
              <div className={`${styles.validationFeedback} ${
                validation.apellido.isValid ? styles.validFeedback : styles.invalidFeedback
              }`}>
                {validation.apellido.message}
              </div>
            </div>
          </div>
          
          {/* Teléfono */}
          <div className="col-md-6">
            <div className={styles.modernFormGroup}>
              <label htmlFor="telefono" className={styles.modernLabel}>
                <i className="bi bi-telephone me-2"></i>
                Teléfono *
              </label>
              <input 
                type="tel" 
                className={`${styles.modernInput} ${
                  validation.telefono.isValid ? styles.validInput : styles.invalidInput
                }`}
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                required
              />
              <div className={`${styles.validationFeedback} ${
                validation.telefono.isValid ? styles.validFeedback : styles.invalidFeedback
              }`}>
                {validation.telefono.message}
              </div>
            </div>
          </div>
          
          {/* Email */}
          <div className="col-md-6">
            <div className={styles.modernFormGroup}>
              <label htmlFor="email" className={styles.modernLabel}>
                <i className="bi bi-envelope me-2"></i>
                Correo Electrónico *
              </label>
              <input 
                type="email" 
                className={`${styles.modernInput} ${
                  validation.email.isValid ? styles.validInput : styles.invalidInput
                }`}
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <div className={`${styles.validationFeedback} ${
                validation.email.isValid ? styles.validFeedback : styles.invalidFeedback
              }`}>
                {validation.email.message}
              </div>
            </div>
          </div>
          
          {/* Password */}
          <div className="col-md-6">
            <div className={styles.modernFormGroup}>
              <label htmlFor="password" className={styles.modernLabel}>
                <i className="bi bi-lock me-2"></i>
                Nueva Contraseña
              </label>
              <input 
                type="password" 
                className={`${styles.modernInput} ${
                  validation.password.isValid ? styles.validInput : styles.invalidInput
                }`}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Dejar vacío para mantener actual"
              />
              <div className={`${styles.validationFeedback} ${
                validation.password.isValid ? styles.validFeedback : styles.invalidFeedback
              }`}>
                {validation.password.message}
              </div>
              <small className={styles.formHelp}>
                Mínimo 6 caracteres si decides cambiarla
              </small>
            </div>
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className={styles.formActions}>
          <button 
            type="button" 
            className={styles.btnModernSecondary}
            onClick={onClose}
            disabled={isLoading}
          >
            <i className="bi bi-x-circle me-2"></i>
            Cancelar
          </button>
          
          <button 
            type="submit" 
            className={styles.btnModernPrimary}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Guardando...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

ProfileForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};

export default ProfileForm;
