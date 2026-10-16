const db = require('./db');

// Constantes de roles y estados permitidos para el sistema
const ROLES_VALIDOS = ['Admin', 'empleado'];
const ESTADOS_VALIDOS = ['activo', 'inactivo', 'desactivado', 'suspendido'];

 //obtener usuarios(con filtros opcionales de rol o estado)
function obtenerUsuarios({ rol, estado } = {}) {
  let resultado = db.users;

  if (rol) {
    resultado = resultado.filter(
      (u) => u.rol.toLowerCase() === rol.toLowerCase()
    );
  }

  if (estado) {
    resultado = resultado.filter(
      (u) => u.estado.toLowerCase() === estado.toLowerCase()
    );
  }

  return resultado;
}

function obtenerUsuarioPorId(id) {
  const usuario = db.users.find((u) => u.id === Number(id));
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }
  return usuario;
}

//crear user
function crearUsuario({ nombre, edad, telefono, rol }) {
  // Validaciones básicas de campos obligatorios
  if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
    throw new Error('El nombre es obligatorio');
  }

  if (edad === undefined || edad === null || isNaN(Number(edad)) || Number(edad) <= 0) {
    throw new Error('La edad debe ser un número mayor a 0');
  }

  if (!telefono || !String(telefono).trim()) {
    throw new Error('El teléfono es obligatorio');
  }

  if (!rol || !ROLES_VALIDOS.includes(rol)) {
    throw new Error(`El rol es obligatorio y debe ser: ${ROLES_VALIDOS.join(' o ')}`);
  }

  
  const nuevoUsuario = {
    id: db.getNextUserId(),
    nombre: nombre.trim(),
    edad: Number(edad),
    telefono: String(telefono).trim(),
    rol: rol, // 'Admin' o 'empleado'
    estado: 'activo', // Las cuentas nuevas inician activas
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString(),
  };

  db.users.push(nuevoUsuario);

  return nuevoUsuario;
}

//editar user por id
function editarUsuario(id, { nombre, edad, telefono, rol }) {
  const usuario = db.users.find((u) => u.id === Number(id));

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  // Si se envió un nuevo nombre, lo actualizamos
  if (nombre !== undefined) {
    if (typeof nombre !== 'string' || !nombre.trim()) {
      throw new Error('El nombre no puede estar vacío');
    }
    usuario.nombre = nombre.trim();
  }

  // Si se envió una nueva edad, la validamos y actualizamos
  if (edad !== undefined) {
    if (isNaN(Number(edad)) || Number(edad) <= 0) {
      throw new Error('La edad debe ser un número mayor a 0');
    }
    usuario.edad = Number(edad);
  }

  // Si se envió un nuevo teléfono, lo actualizamos
  if (telefono !== undefined) {
    if (!String(telefono).trim()) {
      throw new Error('El teléfono no puede estar vacío');
    }
    usuario.telefono = String(telefono).trim();
  }

  // Si se envió un nuevo rol, lo validamos y asignamos
  if (rol !== undefined) {
    if (!ROLES_VALIDOS.includes(rol)) {
      throw new Error(`Rol inválido. Debe ser: ${ROLES_VALIDOS.join(' o ')}`);
    }

    usuario.rol = rol;
  }

  usuario.fechaActualizacion = new Date().toISOString();

  return usuario;
}

/**
 * Cambiar estado de cuentas
 * Recibe: id y el nuevoEstado ('activo', 'desactivado' / 'inactivo', 'suspendido')
 */
function cambiarEstadoUsuario(id, nuevoEstado) {
  const usuario = db.users.find((u) => u.id === Number(id));

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  if (!nuevoEstado || typeof nuevoEstado !== 'string') {
    throw new Error('Debe especificar un estado válido');
  }

  const estadoLimpio = nuevoEstado.trim().toLowerCase();

  let estadoFinal = estadoLimpio;
  if (estadoFinal === 'desactivar') estadoFinal = 'desactivado';
  if (estadoFinal === 'suspender') estadoFinal = 'suspendido';
  if (estadoFinal === 'activar') estadoFinal = 'activo';

  if (!ESTADOS_VALIDOS.includes(estadoFinal)) {
    throw new Error(
      `Estado inválido. Los estados permitidos son: 'activo', 'desactivado' (o 'inactivo'), 'suspendido'`
    );
  }

  usuario.estado = estadoFinal;
  usuario.fechaActualizacion = new Date().toISOString();
  
  return usuario;
}

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  editarUsuario,
  cambiarEstadoUsuario,
  ROLES_VALIDOS,
  ESTADOS_VALIDOS,
};
