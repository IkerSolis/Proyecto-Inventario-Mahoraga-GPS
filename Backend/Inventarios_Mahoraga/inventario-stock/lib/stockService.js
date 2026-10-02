const db = require('./db');

// Calculo de min,max,normal
function calcularEstado(producto) {
  if (producto.stock <= 0) return 'agotado';
  if (producto.stock < producto.stock_minimo) return 'bajo';
  if (producto.stock >= producto.stock_maximo) return 'lleno';
  return 'normal';
}

// Devuelve la lista de productos con estado (opcional)
function obtenerProductos({ categoria, estado } = {}) {
  return db.products
    .map((p) => ({ ...p, estado: calcularEstado(p) }))
    .filter((p) => {
      if (categoria && p.categoria !== categoria) return false;
      if (estado && p.estado !== estado) return false;
      return true;
    });
}

// Registra movimientos y los guarda en historial
function registrarMovimiento({ product_id, tipo_movimiento, cantidad }) {
  const producto = db.products.find((p) => p.id === Number(product_id));

  if (!producto) {
    throw new Error('Producto no encontrado');
  }
  if (!['compra', 'venta'].includes(tipo_movimiento)) {
    throw new Error('tipo_movimiento inválido, debe ser "compra" o "venta"');
  }
  if (!cantidad || Number(cantidad) <= 0) {
    throw new Error('La cantidad debe ser mayor a 0');
  }

  const stock_previo = producto.stock;

  if (tipo_movimiento === 'compra') {
    // Compra = entrada de mercancía
    producto.stock += Number(cantidad);
  } else {
    // Venta = salida de mercancía
    if (producto.stock < Number(cantidad)) {
      throw new Error('No hay suficiente stock para esta venta');
    }
    producto.stock -= Number(cantidad);
  }

  const movimiento = {
    id: db.getNextMovementId(),
    product_id: producto.id,
    tipo_movimiento,
    cantidad: Number(cantidad),
    stock_previo,
    stock_resultante: producto.stock,
    timestamp: new Date().toISOString(),
    // user_id: se agrega más adelante cuando exista login
  };

  db.stockMovements.push(movimiento);
  return movimiento;
}

// Devuelve el historial de movimientos
function obtenerHistorial({ product_id } = {}) {
  let historial = db.stockMovements;

  if (product_id) {
    historial = historial.filter((m) => m.product_id === Number(product_id));
  }

  return [...historial].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
}

module.exports = {
  obtenerProductos,
  registrarMovimiento,
  obtenerHistorial,
  calcularEstado,
};
