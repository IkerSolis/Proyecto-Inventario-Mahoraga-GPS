//Valores para pruebas, mas adelante se hara migracion a postgresql 

let products = [
  { id: 1, nombre: "Playera básica", categoria: "Ropa", stock: 40, stock_minimo: 10, stock_maximo: 100 },
  { id: 2, nombre: "Pantalón mezclilla", categoria: "Ropa", stock: 0, stock_minimo: 5, stock_maximo: 60 },
  { id: 3, nombre: "Laptop 14''", categoria: "Electrónica", stock: 8, stock_minimo: 3, stock_maximo: 20 },
  { id: 4, nombre: "Mouse inalámbrico", categoria: "Electrónica", stock: 95, stock_minimo: 15, stock_maximo: 100 },
  { id: 5, nombre: "Cuaderno profesional", categoria: "Papelería", stock: 12, stock_minimo: 20, stock_maximo: 150 },
];

// Simula la tabla "stock_movements"
// Columnas: id, product_id, tipo_movimiento, cantidad,
//           stock_previo, stock_resultante, timestamp
let stockMovements = [];
let nextMovementId = 1;

module.exports = {
  products,
  stockMovements,
  getNextMovementId: () => nextMovementId++,
};
