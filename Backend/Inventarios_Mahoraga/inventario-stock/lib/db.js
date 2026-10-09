//Valores para pruebas, mas adelante se hara migracion a postgresql

// Next.js (modo desarrollo) puede volver a evaluar este modulo en cada ruta de la API.
// Guardamos el "estado de la base de datos" en globalThis para que productos y
// movimientos se compartan entre todas las rutas y sobrevivan a los hot-reloads.
if (!globalThis.__mahoragaDb) {
  const productosIniciales = [
    { id: 1, nombre: "Playera básica", categoria: "Ropa", stock: 40, stock_minimo: 10, stock_maximo: 100 },
    { id: 2, nombre: "Pantalón mezclilla", categoria: "Ropa", stock: 0, stock_minimo: 5, stock_maximo: 60 },
    { id: 3, nombre: "Laptop 14''", categoria: "Electrónica", stock: 8, stock_minimo: 3, stock_maximo: 20 },
    { id: 4, nombre: "Mouse inalámbrico", categoria: "Electrónica", stock: 95, stock_minimo: 15, stock_maximo: 100 },
    { id: 5, nombre: "Cuaderno profesional", categoria: "Papelería", stock: 12, stock_minimo: 20, stock_maximo: 150 },
  ].map((p) => ({
    descripcion: "",
    estado_inicial: "Disponible",
    precio_venta: null,
    imagen: null,
    created_at: new Date().toISOString(),
    ...p,
  }));

  globalThis.__mahoragaDb = {
    products: productosIniciales,
    // Simula la tabla "stock_movements"
    // Columnas: id, product_id, tipo_movimiento, cantidad,
    //           stock_previo, stock_resultante, timestamp
    stockMovements: [],
    nextMovementId: 1,
    nextProductId: productosIniciales.length + 1,
  };
}

const store = globalThis.__mahoragaDb;

module.exports = {
  products: store.products,
  stockMovements: store.stockMovements,
  getNextMovementId: () => store.nextMovementId++,
  getNextProductId: () => store.nextProductId++,
};
