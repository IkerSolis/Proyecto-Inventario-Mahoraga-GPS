const db = require('./db');

// Error de validación con código HTTP (400 = datos inválidos, 409 = conflicto)
class ValidationError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'ValidationError';
    this.status = status;
  }
}

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

// ---------------------------------------------------------------------------
// Alta de productos
// ---------------------------------------------------------------------------

const IMAGEN_MAX_BYTES = 5 * 1024 * 1024; // 5 MB, igual que el texto del formulario
const IMAGEN_REGEX = /^data:image\/(png|jpe?g);base64,([A-Za-z0-9+/=]+)$/;

// Convierte "1,250.50", "$ 99" o 10 en número. Devuelve null si no es válido.
function aNumero(valor) {
  if (valor === undefined || valor === null || valor === '') return undefined;
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null;
  const limpio = String(valor).replace(/[$,\s]/g, '');
  if (limpio === '') return undefined;
  const n = Number(limpio);
  return Number.isFinite(n) ? n : null;
}

// Entero >= 0 (opcional: si viene vacío usa "porDefecto")
function enteroNoNegativo(valor, campo, porDefecto) {
  const n = aNumero(valor);
  if (n === undefined) return porDefecto;
  if (n === null || !Number.isInteger(n) || n < 0) {
    throw new ValidationError(`${campo} debe ser un número entero mayor o igual a 0`);
  }
  return n;
}

function validarImagen(imagen) {
  if (imagen === undefined || imagen === null || imagen === '') return null;

  const match = typeof imagen === 'string' ? imagen.match(IMAGEN_REGEX) : null;
  if (!match) {
    throw new ValidationError('La imagen debe ser PNG o JPG');
  }

  // Tamaño real de los bytes decodificados
  const base64 = match[2];
  const relleno = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  const bytes = Math.floor((base64.length * 3) / 4) - relleno;
  if (bytes > IMAGEN_MAX_BYTES) {
    throw new ValidationError('La imagen no debe pesar más de 5MB');
  }

  return imagen;
}

// Crea un producto nuevo. Si trae stock inicial lo deja registrado en el historial.
function crearProducto(datos = {}) {
  const nombre = typeof datos.nombre === 'string' ? datos.nombre.trim() : '';
  if (!nombre) throw new ValidationError('El nombre del producto es obligatorio');
  if (nombre.length > 120) throw new ValidationError('El nombre no debe pasar de 120 caracteres');

  const categoria = typeof datos.categoria === 'string' ? datos.categoria.trim() : '';
  if (!categoria) throw new ValidationError('La categoría es obligatoria');

  const descripcion = typeof datos.descripcion === 'string' ? datos.descripcion.trim() : '';
  if (descripcion.length > 1000) {
    throw new ValidationError('La descripción no debe pasar de 1000 caracteres');
  }

  const estado_inicial =
    typeof datos.estado_inicial === 'string' && datos.estado_inicial.trim()
      ? datos.estado_inicial.trim()
      : 'Disponible';

  const precio = aNumero(datos.precio_venta);
  if (precio === null || (precio !== undefined && precio < 0)) {
    throw new ValidationError('El precio de venta debe ser un número mayor o igual a 0');
  }
  const precio_venta = precio === undefined ? null : Math.round(precio * 100) / 100;

  const stock = enteroNoNegativo(datos.stock, 'La cantidad disponible', 0);
  const stock_minimo = enteroNoNegativo(datos.stock_minimo, 'El stock mínimo', 0);

  // El formulario no pide stock máximo: si no viene se calcula uno razonable
  let stock_maximo = enteroNoNegativo(datos.stock_maximo, 'El stock máximo', undefined);
  if (stock_maximo === undefined) {
    stock_maximo = Math.max(stock_minimo * 10, stock * 2, 100);
  } else if (stock_maximo < stock_minimo) {
    throw new ValidationError('El stock máximo no puede ser menor al stock mínimo');
  }

  const imagen = validarImagen(datos.imagen);

  const existe = db.products.some((p) => p.nombre.toLowerCase() === nombre.toLowerCase());
  if (existe) {
    throw new ValidationError('Ya existe un producto con ese nombre', 409);
  }

  const producto = {
    id: db.getNextProductId(),
    nombre,
    descripcion,
    categoria,
    estado_inicial,
    precio_venta,
    stock,
    stock_minimo,
    stock_maximo,
    imagen,
    created_at: new Date().toISOString(),
  };

  db.products.push(producto);

  // El stock con el que nace el producto queda en el historial (0 -> stock)
  if (stock > 0) {
    db.stockMovements.push({
      id: db.getNextMovementId(),
      product_id: producto.id,
      tipo_movimiento: 'stock_inicial',
      cantidad: stock,
      stock_previo: 0,
      stock_resultante: stock,
      timestamp: producto.created_at,
    });
  }

  return { ...producto, estado: calcularEstado(producto) };
}

// ---------------------------------------------------------------------------
// Movimientos
// ---------------------------------------------------------------------------

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
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp) || b.id - a.id
  );
}

module.exports = {
  obtenerProductos,
  crearProducto,
  registrarMovimiento,
  obtenerHistorial,
  calcularEstado,
  ValidationError,
};
