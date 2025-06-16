// src/data/mockProducts.js
/**
 * Datos mock para productos destacados - Sub-iteración 4.4
 * Estructura basada en ProductoDetallesDTO del backend
 */

export const mockFeaturedProducts = [
  {
    idProducto: 1,
    prodNombre: "Yamaha FZ25",
    prodDescripcion: "Motocicleta deportiva urbana con motor de 249cc, perfecta para la ciudad y carretera.",
    prodPrecio: 15500000.0,
    prodStock: 5,
    prodProveedor: "Yamaha Motor",
    idCategoria: 1,
    categoriaNombre: "Deportivas",
    imagenesUrl: [
      "/images/yamaha-fz25-1.jpg",
      "/images/yamaha-fz25-2.jpg"
    ]
  },
  {
    idProducto: 2,
    prodNombre: "Honda CB160F",
    prodDescripcion: "Motocicleta naked de 162cc, ideal para principiantes con excelente economía de combustible.",
    prodPrecio: 8900000.0,
    prodStock: 8,
    prodProveedor: "Honda Motors",
    idCategoria: 2,
    categoriaNombre: "Urbanas",
    imagenesUrl: [
      "/images/honda-cb160f-1.jpg",
      "/images/honda-cb160f-2.jpg"
    ]
  },
  {
    idProducto: 3,
    prodNombre: "Kawasaki Ninja 400",
    prodDescripcion: "Supersport de 399cc, diseñada para velocidad y adrenalina en pista y carretera.",
    prodPrecio: 22800000.0,
    prodStock: 3,
    prodProveedor: "Kawasaki Heavy Industries",
    idCategoria: 1,
    categoriaNombre: "Deportivas",
    imagenesUrl: [
      "/images/kawasaki-ninja400-1.jpg",
      "/images/kawasaki-ninja400-2.jpg"
    ]
  },
  {
    idProducto: 4,
    prodNombre: "Suzuki V-Strom 250",
    prodDescripcion: "Adventure touring con motor de 248cc, perfecta para aventuras on-road y off-road ligero.",
    prodPrecio: 18200000.0,
    prodStock: 6,
    prodProveedor: "Suzuki Motor Corporation",
    idCategoria: 3,
    categoriaNombre: "Adventure",
    imagenesUrl: [
      "/images/suzuki-vstrom250-1.jpg",
      "/images/suzuki-vstrom250-2.jpg"
    ]
  },
  {
    idProducto: 5,
    prodNombre: "KTM Duke 200",
    prodDescripcion: "Naked bike de 199cc con carácter agresivo, ideal para riders que buscan emociones fuertes.",
    prodPrecio: 12400000.0,
    prodStock: 4,
    prodProveedor: "KTM AG",
    idCategoria: 2,
    categoriaNombre: "Urbanas",
    imagenesUrl: [
      "/images/ktm-duke200-1.jpg",
      "/images/ktm-duke200-2.jpg"
    ]
  },
  {
    idProducto: 6,
    prodNombre: "Royal Enfield Classic 350",
    prodDescripcion: "Cruiser retro de 349cc con estilo vintage británico y construcción robusta.",
    prodPrecio: 19800000.0,
    prodStock: 7,
    prodProveedor: "Royal Enfield",
    idCategoria: 4,
    categoriaNombre: "Cruiser",
    imagenesUrl: [
      "/images/royal-enfield-classic350-1.jpg",
      "/images/royal-enfield-classic350-2.jpg"
    ]
  }
];

/**
 * Utilidades para formatear datos de productos
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price);
};

export const getStockStatus = (stock) => {
  if (stock === 0) return { status: 'out-of-stock', text: 'Agotado', class: 'text-danger' };
  if (stock <= 3) return { status: 'low-stock', text: `Quedan ${stock}`, class: 'text-warning' };
  return { status: 'in-stock', text: 'Disponible', class: 'text-success' };
};

export const getProductRating = (productId) => {
  // Mock de ratings - en la implementación real vendría de la API
  const ratings = {
    1: 4.5,
    2: 4.2,
    3: 4.8,
    4: 4.3,
    5: 4.6,
    6: 4.4
  };
  return ratings[productId] || 4.0;
};

export const getDiscountPercentage = (productId) => {
  // Mock de descuentos - en la implementación real vendría de la API
  const discounts = {
    2: 10, // Honda CB160F - 10% descuento
    5: 15  // KTM Duke 200 - 15% descuento
  };
  return discounts[productId] || 0;
};
