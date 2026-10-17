const db = require('./db');
const {
  ROLE_HIERARCHY,
  ROLES_VALIDOS,
  ESTADOS_VALIDOS,
  canAssignRole,
  canManageUser,
  hashPassword,
  generateToken
} = require('./authCrypto');
const { registrarActividad, sanitizeUser } = require('./authService');

/**
 * Obtener lista de usuarios (con filtros opcionales de búsqueda, rol o estado)
 */
function obtenerUsuarios({ rol, estado, busqueda } = {}) {
  let resultado = db.users;

  if (rol) {
    resultado = resultado.filter(
      (u) => u.rol && u.rol.toLowerCase() === rol.toLowerCase()
    );
  }

  if (estado) {
    resultado = resultado.filter(
      (u) => u.estado && u.estado.toLowerCase() === estado.toLowerCase()
    );
  }

  if (busqueda) {
    const q = busqueda.toLowerCase().trim();
    resultado = resultado.filter(
      (u) =>
        (u.nombre && u.nombre.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
    );
  }

  return resultado.map(sanitizeUser);
}

/**
 * Obtener usuario por ID
 */
function obtenerUsuarioPorId(id) {
  const usuario = db.users.find((u) => u.id === Number(id));
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }
  return sanitizeUser(usuario);
}

/**
 * Crear e invitar a un nuevo usuario al sistema
 * Previene que alguien asigne privilegios superiores a los que puede administrar.
 */
function crearUsuario({
  nombre,
  email,
  edad,
  telefono,
  rol,
  password,
  solicitanteRol,
  solicitanteId
}) {
  // Validaciones básicas de campos obligatorios
  if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
    throw new Error('El nombre es obligatorio');
  }

  // Si se incluye edad, validarla
  if (edad !== undefined && edad !== null) {
    if (isNaN(Number(edad)) || Number(edad) <= 0) {
      throw new Error('La edad debe ser un número mayor a 0');
    }
  }

  // Rol obligatorio y válido
  if (!rol) {
    throw new Error(`El rol es obligatorio y debe ser uno de: ${ROLES_VALIDOS.join(', ')}`);
  }

  const rolNormalizado = ROLES_VALIDOS.find((r) => r.toLowerCase() === rol.toLowerCase());
  if (!rolNormalizado) {
    throw new Error(`Rol inválido. Debe ser uno de: ${ROLES_VALIDOS.join(', ')}`);
  }

  // REGLA DE SEGURIDAD: Evitar que alguien asigne privilegios superiores o iguales a los suyos
  if (solicitanteRol) {
    if (!canAssignRole(solicitanteRol, rolNormalizado)) {
      throw new Error(
        `Restricción de privilegios: Un usuario con rol "${solicitanteRol}" no puede asignar el rol "${rolNormalizado}".`
      );
    }
  }

  // Generar o validar email
  let emailFinal = email ? email.trim().toLowerCase() : null;
  if (emailFinal) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFinal)) {
      throw new Error('El formato del correo electrónico es inválido');
    }

    const emailExiste = db.users.some(
      (u) => u.email && u.email.toLowerCase() === emailFinal
    );
    if (emailExiste) {
      throw new Error(`El correo "${emailFinal}" ya se encuentra registrado en el sistema`);
    }
  } else {
    // Para compatibilidad con tests iniciales donde solo se envía nombre
    const slug = nombre.trim().toLowerCase().replace(/\s+/g, '.');
    emailFinal = `${slug}@mahoraga.com`;
  }

  // Generación de contraseña o invitación
  const passwordInicial = password || generateToken(8);
  const { hash, salt } = hashPassword(passwordInicial);
  const tokenInvitacion = generateToken(24);

  const nuevoUsuario = {
    id: db.getNextUserId(),
    nombre: nombre.trim(),
    email: emailFinal,
    edad: edad !== undefined && edad !== null ? Number(edad) : null,
    telefono: telefono ? String(telefono).trim() : '',
    rol: rolNormalizado,
    estado: 'activo',
    passwordHash: hash,
    salt: salt,
    invitacionPendiente: !password,
    tokenInvitacion: !password ? tokenInvitacion : null,
    ultimoAcceso: 'Nunca',
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  };

  db.users.push(nuevoUsuario);

  // Registrar en historial de actividad
  const solicitante = solicitanteId ? db.users.find((u) => u.id === Number(solicitanteId)) : null;
  const autor = solicitante ? solicitante.nombre : 'Sistema';
  registrarActividad(
    'create',
    `<strong>${autor}</strong> invitó al usuario <strong>${nuevoUsuario.nombre}</strong> con rol <strong>${nuevoUsuario.rol}</strong>`,
    solicitante ? solicitante.id : null
  );

  return sanitizeUser(nuevoUsuario);
}

/**
 * Editar datos de usuario y/o asignar rol
 * Valida jerarquía para evitar que alguien se asigne privilegios superiores
 */
function editarUsuario(id, { nombre, email, edad, telefono, rol }, solicitanteRol, solicitanteId) {
  const usuario = db.users.find((u) => u.id === Number(id));

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  const isSelf = solicitanteId && Number(solicitanteId) === usuario.id;

  // Validar permisos de gestión si se especificó el rol del solicitante
  if (solicitanteRol && !isSelf) {
    if (!canManageUser(solicitanteRol, usuario.rol, false)) {
      throw new Error(
        `No tienes permisos suficientes para modificar a un usuario con rol "${usuario.rol}".`
      );
    }
  }

  // Si se envió un nuevo nombre
  if (nombre !== undefined) {
    if (typeof nombre !== 'string' || !nombre.trim()) {
      throw new Error('El nombre no puede estar vacío');
    }
    usuario.nombre = nombre.trim();
  }

  // Si se envió un nuevo correo
  if (email !== undefined) {
    const emailLimpio = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio)) {
      throw new Error('El formato del correo electrónico es inválido');
    }
    const duplicado = db.users.some(
      (u) => u.id !== usuario.id && u.email && u.email.toLowerCase() === emailLimpio
    );
    if (duplicado) {
      throw new Error(`El correo "${emailLimpio}" ya pertenece a otro usuario`);
    }
    usuario.email = emailLimpio;
  }

  // Si se envió una nueva edad
  if (edad !== undefined) {
    if (isNaN(Number(edad)) || Number(edad) <= 0) {
      throw new Error('La edad debe ser un número mayor a 0');
    }
    usuario.edad = Number(edad);
  }

  // Si se envió un nuevo teléfono
  if (telefono !== undefined) {
    usuario.telefono = String(telefono).trim();
  }

  // Si se envió un nuevo rol
  if (rol !== undefined) {
    const rolNormalizado = ROLES_VALIDOS.find((r) => r.toLowerCase() === rol.toLowerCase());
    if (!rolNormalizado) {
      throw new Error(`Rol inválido. Debe ser uno de: ${ROLES_VALIDOS.join(', ')}`);
    }

    // REGLA: Un usuario no puede auto-asignarse privilegios superiores
    if (isSelf && rolNormalizado !== usuario.rol) {
      throw new Error('No puedes cambiar tu propio rol.');
    }

    // REGLA: El solicitante no puede asignar un rol superior o igual al suyo
    if (solicitanteRol && rolNormalizado !== usuario.rol) {
      if (!canAssignRole(solicitanteRol, rolNormalizado)) {
        throw new Error(
          `No puedes asignar el rol "${rolNormalizado}" porque supera tus permisos administrativos.`
        );
      }
    }

    const oldRol = usuario.rol;
    usuario.rol = rolNormalizado;

    if (oldRol !== rolNormalizado) {
      const solicitante = solicitanteId ? db.users.find((u) => u.id === Number(solicitanteId)) : null;
      const autor = solicitante ? solicitante.nombre : 'Administrador';
      registrarActividad(
        'role',
        `<strong>${autor}</strong> cambió el rol de <strong>${usuario.nombre}</strong> de ${oldRol} a <strong>${rolNormalizado}</strong>`,
        solicitante ? solicitante.id : null
      );
    }
  }

  usuario.fechaActualizacion = new Date().toISOString();
  return sanitizeUser(usuario);
}

/**
 * Activar, desactivar o suspender cuentas
 * Si la cuenta es suspendida o desactivada, se revocan automáticamente sus sesiones activas.
 */
function cambiarEstadoUsuario(id, nuevoEstado, solicitanteRol, solicitanteId) {
  const usuario = db.users.find((u) => u.id === Number(id));

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  if (!nuevoEstado || typeof nuevoEstado !== 'string') {
    throw new Error('Debe especificar un estado válido');
  }

  let estadoFinal = nuevoEstado.trim().toLowerCase();
  if (estadoFinal === 'desactivar') estadoFinal = 'desactivado';
  if (estadoFinal === 'suspender') estadoFinal = 'suspendido';
  if (estadoFinal === 'activar') estadoFinal = 'activo';

  if (!ESTADOS_VALIDOS.includes(estadoFinal)) {
    throw new Error(
      `Estado inválido. Los estados permitidos son: ${ESTADOS_VALIDOS.join(', ')}`
    );
  }

  // Verificar jerarquía de administración
  if (solicitanteRol) {
    if (!canManageUser(solicitanteRol, usuario.rol, false)) {
      throw new Error(
        `No tienes privilegios para cambiar el estado de un usuario con rol "${usuario.rol}".`
      );
    }
  }

  const estadoPrevio = usuario.estado;
  usuario.estado = estadoFinal;
  usuario.fechaActualizacion = new Date().toISOString();

  // Si la cuenta deja de estar activa, revocar todas sus sesiones activas
  if (estadoFinal === 'suspendido' || estadoFinal === 'desactivado' || estadoFinal === 'inactivo') {
    db.sessions.forEach((s) => {
      if (s.usuarioId === usuario.id) {
        s.revocado = true;
      }
    });
  }

  // Registrar en historial de actividad
  const solicitante = solicitanteId ? db.users.find((u) => u.id === Number(solicitanteId)) : null;
  const autor = solicitante ? solicitante.nombre : 'Administrador';

  let accionTexto = `cambió el estado de <strong>${usuario.nombre}</strong> a ${estadoFinal}`;
  if (estadoFinal === 'suspendido') {
    accionTexto = `suspendió la cuenta de <strong>${usuario.nombre}</strong>`;
  } else if (estadoFinal === 'activo') {
    accionTexto = `reactivó la cuenta de <strong>${usuario.nombre}</strong>`;
  }

  registrarActividad(
    'status',
    `<strong>${autor}</strong> ${accionTexto}`,
    solicitante ? solicitante.id : null
  );

  return sanitizeUser(usuario);
}

/**
 * Consultar el historial de actividad
 */
function obtenerHistorialActividad({ tipo, usuarioId, limite = 50 } = {}) {
  let logs = db.activityLog;

  if (tipo) {
    logs = logs.filter((l) => l.type && l.type.toLowerCase() === tipo.toLowerCase());
  }

  if (usuarioId) {
    logs = logs.filter((l) => l.usuarioId === Number(usuarioId));
  }

  if (limite) {
    logs = logs.slice(0, Number(limite));
  }

  return logs;
}

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  editarUsuario,
  cambiarEstadoUsuario,
  obtenerHistorialActividad,
  ROLES_VALIDOS,
  ESTADOS_VALIDOS,
  ROLE_HIERARCHY,
  canAssignRole,
  canManageUser
};
