import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import checkoutService from '../../../services/checkoutService';
import styles from './InvoiceModal.module.css';

/**
 * Modal de vista previa de factura
 */
const InvoiceModal = ({ isOpen, onClose, orderId }) => {
  const [facturaData, setFacturaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Cargar datos cuando se abre el modal
  useEffect(() => {
    const loadFacturaData = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('📄 Cargando factura para pedido:', orderId);
        const result = await checkoutService.getOrderDetails(orderId);

        if (result.success) {          console.log('✅ Factura cargada:', result.data);
          console.log('🔍 Estructura completa:', {
            tienePedido: !!result.data.pedido,
            propiedadesPedido: result.data.pedido ? Object.keys(result.data.pedido) : [],
            tieneDetallesFactura: !!result.data.detallesFactura,
            cantidadProductos: result.data.detallesFactura?.length || 0,
            primerProducto: result.data.detallesFactura?.[0] || null
          });
          setFacturaData(result.data);
        } else {
          setError(result.error);
          console.error('❌ Error al cargar factura:', result.error);
        }
      } catch (error) {
        setError('Error al cargar la factura');
        console.error('❌ Error inesperado:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && orderId) {
      loadFacturaData();
    }
  }, [isOpen, orderId]);

  // Controlar scroll del body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };  }, [isOpen]);

  /**
   * Formatear precio
   */
  const formatPrice = (price) => {
    if (price === undefined || price === null || isNaN(price)) return '0.00';
    return parseFloat(price).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  /**
   * Imprimir factura
   */
  const handlePrint = () => {
    if (!facturaData) return;

    const printContent = generatePrintContent(facturaData);
    
    const printWindow = window.open('', '', 'height=700,width=900');
    const printDocument = printWindow.document;

    printDocument.open();
    printDocument.write(printContent);
    printDocument.close();

    printWindow.onload = () => {
      printWindow.print();
      setTimeout(() => printWindow.close(), 100);
    };
  };

  /**
   * Generar contenido para impresión
   */
  const generatePrintContent = (data) => {
    const pedido = data.pedido || data;
    const fechaFactura = data.fechaEmision || pedido.fecha;    const nombreCliente = data.nombreCliente || 
                         (pedido.usuario?.cliente ? 
                          `${pedido.usuario.cliente.cliNombre} ${pedido.usuario.cliente.cliApellido}` : 
                          pedido.cliCedula);

    // Formatear fecha
    const fecha = new Date(fechaFactura);
    const fechaFormateada = fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });    // Generar tabla de productos
    let productosHtml = '';
    const detalles = data.detallesFactura || [];
    
    if (detalles && detalles.length > 0) {
      detalles.forEach(detalle => {
        const nombreProducto = detalle.producto?.prodNombre || 'Producto no disponible';
        const precio = parseFloat(detalle.precioUnitario) || 0;
        const cantidad = parseInt(detalle.cantidad) || 0;
        const subtotal = parseFloat(detalle.subtotal) || (precio * cantidad);

        productosHtml += `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${nombreProducto}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${cantidad}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${formatPrice(precio)}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${formatPrice(subtotal)}</td>
          </tr>
        `;
      });
    } else {
      productosHtml = `
        <tr>
          <td colspan="4" style="padding: 20px; text-align: center; color: #666;">
            No hay productos disponibles
          </td>
        </tr>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Factura - Pedido #${pedido.idPedido}</title>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2E7D32; padding-bottom: 20px; }
          .company-name { font-size: 28px; font-weight: bold; color: #2E7D32; margin-bottom: 10px; }
          .company-details { color: #666; font-size: 12px; }
          .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-section { flex: 1; }
          .info-section h4 { color: #2E7D32; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #f8f9fa; font-weight: bold; }
          .total-row { text-align: right; font-weight: bold; font-size: 16px; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">MotoShop</div>
          <div class="company-details">
            <p>Venta de Motocicletas y Accesorios</p>
            <p>RUC: 20-12345678-9 | Tel: (011) 4444-5555</p>
          </div>
        </div>

        <div class="invoice-info">
          <div class="info-section">
            <h4>Información del Pedido</h4>
            <p><strong>Número:</strong> #${pedido.idPedido}</p>
            <p><strong>Fecha:</strong> ${fechaFormateada}</p>
            <p><strong>Estado:</strong> ${pedido.estado}</p>
            <p><strong>Cliente ID:</strong> ${pedido.cliCedula}</p>
          </div>          <div class="info-section">
            <h4>Datos del Cliente</h4>
            <p><strong>Nombre:</strong> ${nombreCliente}</p>
            <p><strong>Dirección:</strong> ${pedido.direccionEntrega || 'No especificada'}</p>
          </div>
        </div>

        <h4>Detalle de Productos</h4>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th style="text-align: center;">Cantidad</th>
              <th style="text-align: right;">Precio Unit.</th>
              <th style="text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${productosHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="total-row">Total:</td>
              <td class="total-row">$${formatPrice(data.total || pedido.total)}</td>
            </tr>
          </tfoot>
        </table>

        <div class="footer">
          <p>Gracias por su compra - MotoShop</p>
          <p>Para consultas: ventas@motoshop.com</p>
          <p>Factura generada el ${new Date().toLocaleDateString('es-ES')}</p>
        </div>
      </body>
      </html>
    `;
  };

  /**
   * Formatear fecha para mostrar
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha no disponible';
      
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

  // No renderizar si no está abierto
  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h3 className={styles.title}>
            <i className="bi bi-receipt me-2"></i>
            Vista Previa de Factura
            {facturaData && (
              <span className={styles.orderNumber}>
                - Pedido #{orderId}
              </span>
            )}
          </h3>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.printButton}
              onClick={handlePrint}
              disabled={loading || error}
            >
              <i className="bi bi-printer me-2"></i>
              Imprimir
            </button>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {loading && (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Cargando factura...</p>
            </div>
          )}

          {error && (            <div className={styles.error}>
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
              <button 
                className="btn btn-outline-danger btn-sm mt-2"
                onClick={() => window.location.reload()}
              >
                Reintentar
              </button>
            </div>
          )}

          {facturaData && !loading && !error && (
            <div className={styles.invoice}>
              {/* Encabezado */}
              <div className={styles.invoiceHeader}>
                <div className={styles.companyInfo}>
                  <h2 className={styles.companyName}>MotoShop</h2>
                  <p className={styles.companyDetails}>
                    Venta de Motocicletas y Accesorios<br />
                    RUC: 20-12345678-9<br />
                    Tel: (011) 4444-5555
                  </p>
                </div>
                <div className={styles.invoiceInfo}>
                  <h3>FACTURA</h3>
                  <div className={styles.invoiceDetails}>
                    <p><strong>N° FAC-{orderId}</strong></p>
                    <p><strong>Fecha:</strong><br />
                       {formatDate(facturaData.fechaEmision || facturaData.pedido?.fecha)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información del cliente */}
              <div className={styles.customerInfo}>
                <h4>Datos del Cliente</h4>                <div className={styles.customerDetails}>
                  <div>
                    <p><strong>Nombre:</strong> {(() => {
                      const pedido = facturaData.pedido || facturaData;
                      return facturaData.nombreCliente || 
                             (pedido.usuario?.cliente ? 
                              `${pedido.usuario.cliente.cliNombre} ${pedido.usuario.cliente.cliApellido}` : 
                              pedido.cliCedula);
                    })()}</p>
                    <p><strong>Cliente ID:</strong> {(facturaData.pedido || facturaData).cliCedula}</p>
                  </div>
                  <div>
                    <p><strong>Dirección de Entrega:</strong></p>
                    <p>{(facturaData.pedido || facturaData).direccionEntrega || 'No especificada'}</p>
                  </div>
                </div>
              </div>

              {/* Información del pedido */}
              <div className={styles.orderInfo}>
                <h4>Detalles del Pedido</h4>
                <div className={styles.orderDetails}>
                  <p><strong>Pedido N°:</strong> #{(facturaData.pedido || facturaData).idPedido}</p>
                  <p><strong>Estado:</strong> 
                    <span className="badge bg-success ms-2">
                      {(facturaData.pedido || facturaData).estado}
                    </span>
                  </p>
                  <p><strong>Método de Pago:</strong> {facturaData.metodoPago || 'Transferencia Bancaria'}</p>
                </div>
              </div>

              {/* Tabla de productos */}
              <div className={styles.productsSection}>
                <h4>Productos</h4>
                <table className={styles.productsTable}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Precio Unit.</th>
                      <th>Cantidad</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>                  <tbody>
                    {(() => {
                      // ✅ CORRECCIÓN: Usar detallesFactura en lugar de pedido.detalles
                      const detalles = facturaData.detallesFactura || [];
                      
                      console.log('🔍 Productos en modal (corregido):', {
                        tieneDetallesFactura: !!facturaData.detallesFactura,
                        cantidadProductos: detalles.length,
                        primerProducto: detalles[0] || null
                      });
                      
                      if (detalles && detalles.length > 0) {
                        return detalles.map((detalle, index) => {
                          const producto = detalle.producto || {};
                          const precio = parseFloat(detalle.precioUnitario) || 0;
                          const cantidad = parseInt(detalle.cantidad) || 0;
                          const subtotal = parseFloat(detalle.subtotal) || (precio * cantidad);
                          
                          return (
                            <tr key={detalle.id || index}>
                              <td>
                                <strong>{producto.prodNombre || 'Producto no disponible'}</strong>
                                {producto.prodDescripcion && (
                                  <div className={styles.productDescription}>
                                    {producto.prodDescripcion}
                                  </div>
                                )}
                              </td>
                              <td>${formatPrice(precio)}</td>
                              <td>{cantidad}</td>
                              <td><strong>${formatPrice(subtotal)}</strong></td>
                            </tr>
                          );
                        });
                      } else {
                        return (
                          <tr>
                            <td colSpan="4" style={{textAlign: 'center', padding: '20px', color: '#666'}}>
                              No hay productos disponibles en esta factura
                            </td>
                          </tr>
                        );
                      }
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Totales */}
              <div className={styles.totalsSection}>
                <div className={styles.totalsContainer}>
                  <div className={styles.totalRow}>
                    <span>Subtotal:</span>
                    <span>${formatPrice(facturaData.total || (facturaData.pedido || facturaData).total)}</span>
                  </div>
                  <div className={styles.totalRow}>
                    <span>Envío:</span>
                    <span className="text-success">GRATIS</span>
                  </div>
                  <div className={styles.totalRow}>
                    <span>IVA incluido:</span>
                    <span>Sí</span>
                  </div>
                  <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                    <span><strong>Total:</strong></span>
                    <span><strong>${formatPrice(facturaData.total || (facturaData.pedido || facturaData).total)}</strong></span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className={styles.invoiceFooter}>
                <p><strong>¡Gracias por tu compra!</strong></p>
                <p>Para consultas: ventas@motoshop.com</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

InvoiceModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  orderId: PropTypes.number
};

InvoiceModal.defaultProps = {
  orderId: null
};

export default InvoiceModal;
