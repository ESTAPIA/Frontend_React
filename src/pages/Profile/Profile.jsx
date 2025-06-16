// src/pages/Profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ProfileForm from '../../components/profile/ProfileForm';
import styles from './Profile.module.css';

/**
 * Página de Perfil de Usuario Completa
 * Replicando funcionalidad del profile.ejs original
 */
const Profile = () => {
  const { user, isProfileComplete } = useAuth();
  const [showEditForm, setShowEditForm] = useState(false);
  const [profileStats, setProfileStats] = useState({
    memberSince: '',
    completionPercentage: 0,
    userLevel: 'Nuevo',
    status: 'Activo'
  });

  // Calcular estadísticas del perfil
  useEffect(() => {
    if (user) {
      // Simular fecha de miembro (podrías obtenerlo del backend)
      const memberDate = new Date(2024, 0, 1); // Ejemplo: enero 2024
      const memberSince = memberDate.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long' 
      });

      // Calcular porcentaje de completitud
      const requiredFields = ['cliNombre', 'cliApellido', 'cliTelefono', 'cliCorreo'];
      const completedFields = requiredFields.filter(field => 
        user[field] && user[field].toString().trim().length > 0
      );
      const completionPercentage = Math.round((completedFields.length / requiredFields.length) * 100);

      // Determinar nivel del usuario basado en completitud
      let userLevel = 'Nuevo';
      if (completionPercentage === 100) userLevel = 'Completo';
      else if (completionPercentage >= 75) userLevel = 'Avanzado';
      else if (completionPercentage >= 50) userLevel = 'Intermedio';

      setProfileStats({
        memberSince,
        completionPercentage,
        userLevel,
        status: 'Activo'
      });
    }
  }, [user]);

  // Función para obtener nombre completo del usuario
  const getDisplayName = () => {
    if (user?.cliNombre && user?.cliApellido) {
      return `${user.cliNombre} ${user.cliApellido}`;
    }
    if (user?.cliNombre) return user.cliNombre;
    if (user?.cedula) return `Usuario ${user.cedula}`;
    return 'Usuario';
  };

  // Función para obtener rol legible
  const getRoleDisplay = () => {
    if (user?.role === 'ROLE_ADMIN') return 'Administrador';
    if (user?.role === 'ROLE_USER') return 'Cliente';
    return 'Usuario';
  };
  const handleEditProfile = () => {
    setShowEditForm(!showEditForm);
  };

  // Manejar éxito de actualización del perfil
  const handleProfileUpdateSuccess = (updatedUserData) => {
    console.log('✅ Perfil actualizado con éxito:', updatedUserData);
    // El formulario se cierra automáticamente después del éxito
    // Podrías agregar lógica adicional aquí si es necesario
  };

  return (
    <div className={`${styles.profilePage} container py-5`}>
      {/* Fondo animado */}
      <div className={styles.profileBackground}>
        <div className={styles.particles}></div>
        <div className={styles.lightningEffect}></div>
      </div>

      <div className="row">
        <div className="col-md-10 offset-md-1">
          {/* Header del Perfil Modernizado */}
          <div className={`${styles.profileModernHeader} mb-4`}>
            <div className={styles.profileAvatarSection}>
              <div className={styles.profileAvatar}>
                <i className="bi bi-person-circle"></i>
                <div className={styles.avatarStatusIndicator}></div>
              </div>
              <div className={styles.profileHeaderInfo}>
                <h1 className={styles.profileName}>{getDisplayName()}</h1>
                <p className={styles.profileSubtitle}>{getRoleDisplay()}</p>
                <div className={styles.profileCompletionIndicator}>
                  <span className={styles.completionText}>Completitud del perfil:</span>
                  <div className={styles.completionBar}>
                    <div 
                      className={styles.completionProgress}
                      style={{ width: `${profileStats.completionPercentage}%` }}
                    ></div>
                  </div>
                  <span className={styles.completionPercentage}>
                    {profileStats.completionPercentage}%
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.profileQuickActions}>
              <button 
                className={styles.btnModernEdit}
                onClick={handleEditProfile}
              >
                <i className="bi bi-pencil-fill"></i>
                Editar Perfil
              </button>
            </div>
          </div>

          {/* Tarjeta Principal */}
          <div className={`${styles.cardShadowPremium} card`}>
            <div className={styles.cardHeaderModern}>
              <div className={styles.headerContent}>
                <h2 className="mb-0">
                  <i className="bi bi-person-gear me-2"></i>
                  Información Personal
                </h2>
                <div className={styles.headerBadges}>
                  <span className={`badge ${isProfileComplete() ? 'bg-success' : 'bg-warning'}`}>
                    {isProfileComplete() ? 'Perfil Completo' : 'Perfil Incompleto'}
                  </span>
                </div>
              </div>
            </div>            <div className="card-body">
              {!showEditForm ? (
                // ✅ VISTA NORMAL DEL PERFIL
                <>
                  {/* Estadísticas del Usuario */}
                  <div className={`${styles.userStatsSection} mb-4`}>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <div className={styles.statCard}>
                          <div className={styles.statIcon}>
                            <i className="bi bi-calendar-check"></i>
                          </div>
                          <div className={styles.statNumber}>{profileStats.memberSince}</div>
                          <div className={styles.statLabel}>Miembro desde</div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className={styles.statCard}>
                          <div className={styles.statIcon}>
                            <i className="bi bi-star-fill"></i>
                          </div>
                          <div className={styles.statNumber}>{profileStats.userLevel}</div>
                          <div className={styles.statLabel}>Nivel</div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className={styles.statCard}>
                          <div className={styles.statIcon}>
                            <i className="bi bi-check-circle-fill"></i>
                          </div>
                          <div className={styles.statNumber}>{profileStats.status}</div>
                          <div className={styles.statLabel}>Estado</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información Personal */}
                  <div className={`${styles.profileInfoSection} mb-4`}>
                    <h4 className={styles.sectionTitle}>
                      <i className="bi bi-person-vcard"></i> 
                      Datos Personales
                    </h4>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className={styles.infoField}>
                          <label className={styles.fieldLabel}>
                            <i className="bi bi-card-text me-2"></i>
                            Cédula
                          </label>
                          <div className={styles.fieldValue}>
                            {user?.cedula || 'No especificado'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className={styles.infoField}>
                          <label className={styles.fieldLabel}>
                            <i className="bi bi-person me-2"></i>
                            Nombre Completo
                          </label>
                          <div className={styles.fieldValue}>
                            {getDisplayName()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className={styles.infoField}>
                          <label className={styles.fieldLabel}>
                            <i className="bi bi-telephone me-2"></i>
                            Teléfono
                          </label>
                          <div className={styles.fieldValue}>
                            {user?.cliTelefono || 'No especificado'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className={styles.infoField}>
                          <label className={styles.fieldLabel}>
                            <i className="bi bi-envelope me-2"></i>
                            Correo Electrónico
                          </label>
                          <div className={styles.fieldValue}>
                            {user?.cliCorreo || 'No especificado'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alertas según completitud del perfil */}
                  {!isProfileComplete() && (
                    <div className="alert alert-warning mt-3">
                      <div className="d-flex align-items-center">
                        <div className="flex-grow-1">
                          <i className="bi bi-info-circle-fill me-2"></i>
                          <strong>Información incompleta:</strong> Por favor complete su información de perfil para acceder a todas las funcionalidades.
                        </div>
                        <div>
                          <button 
                            className="btn btn-sm btn-warning"
                            onClick={handleEditProfile}
                          >
                            <i className="bi bi-pencil me-1"></i>
                            Completar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {isProfileComplete() && (
                    <div className="alert alert-success mt-3">
                      <div className="d-flex align-items-center">
                        <div className="flex-grow-1">
                          <i className="bi bi-check-circle-fill me-2"></i>
                          <strong>Perfil Completo</strong> - Su información está actualizada.
                        </div>
                        <div>
                          <button 
                            className="btn btn-sm btn-success"
                            onClick={handleEditProfile}
                          >
                            <i className="bi bi-pencil me-1"></i>
                            Editar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Acceso Rápido */}
                  <div className={`${styles.quickAccessSection} mt-4 pt-4`}>
                    <h4 className={styles.sectionTitle}>
                      <i className="bi bi-lightning"></i> 
                      Acceso Rápido
                    </h4>
                    <div className="row g-4">
                      <div className="col-md-4">
                        <div className={styles.quickAccessCard}>
                          <div className={`${styles.cardIcon} ${styles.ordersIcon}`}>
                            <i className="bi bi-bag-check"></i>
                          </div>
                          <div className={styles.cardContent}>
                            <h5>Mis Pedidos</h5>
                            <p>Ver historial de compras</p>
                            <div className={styles.cardStats}>
                              <span className={styles.statsBadge}>Próximamente</span>
                            </div>
                          </div>
                          <a href="/orders" className={styles.cardAction}>
                            <i className="bi bi-arrow-right"></i>
                          </a>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className={styles.quickAccessCard}>
                          <div className={`${styles.cardIcon} ${styles.catalogIcon}`}>
                            <i className="bi bi-grid-3x3-gap"></i>
                          </div>
                          <div className={styles.cardContent}>
                            <h5>Catálogo</h5>
                            <p>Explorar productos</p>
                            <div className={styles.cardStats}>
                              <span className={styles.statsBadge}>Disponible</span>
                            </div>
                          </div>
                          <a href="/catalog" className={styles.cardAction}>
                            <i className="bi bi-arrow-right"></i>
                          </a>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className={styles.quickAccessCard}>
                          <div className={`${styles.cardIcon} ${styles.cartIcon}`}>
                            <i className="bi bi-cart"></i>
                          </div>
                          <div className={styles.cardContent}>
                            <h5>Mi Carrito</h5>
                            <p>Ver productos seleccionados</p>
                            <div className={styles.cardStats}>
                              <span className={styles.statsBadge}>Próximamente</span>
                            </div>
                          </div>
                          <a href="/cart" className={styles.cardAction}>
                            <i className="bi bi-arrow-right"></i>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // ✅ VISTA DEL FORMULARIO DE EDICIÓN (REEMPLAZA TODO)
                <ProfileForm 
                  onClose={() => setShowEditForm(false)}
                  onSuccess={handleProfileUpdateSuccess}
                />
              )}
            </div>
          </div>

          {/* Espaciador antes del footer */}
          <div className="spacer-before-footer mb-5 pb-4"></div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
