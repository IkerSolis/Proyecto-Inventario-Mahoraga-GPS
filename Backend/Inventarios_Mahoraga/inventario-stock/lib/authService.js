const db = require('./db');
const {
  hashPassword,
  verifyPassword,
  generateToken,
  canManageUser
} = require('./authCrypto');

/**
 * Filtra campos sensibles del objeto usuario
 */
function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, salt, ...safeUser } = user;
  return safeUser;
}

/**
 * Registra un evento en el historial de actividad
 */
function registrarActividad(type, text, usuarioId = null) {
  const ts = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const entrada = {
    id: db.getNextActivityId(),
    type,
    text,
    usuarioId: usuarioId ? Number(usuarioId) : null,
    time: ts
  };
  db.activityLog.unshift(entrada);
  return entrada;
}

/**
 * Iniciar sesión de usuario
 * @param {Object} credenciales - { email, password, ip }
 */
function iniciarSesion({ email, password, ip = '127.0.0.1' }) {
  if (!email || typeof email !== 'string' || !email.trim()) {
    throw new Error('El correo electrónico es obligatorio');
  }

  if (!password || typeof password !== 'string') {
    throw new Error('La contraseña es obligatoria');
  }

  const emailLimpio = email.trim().toLowerCase();
  const usuario = db.users.find(
    (u) => u.email && u.email.toLowerCase() === emailLimpio
  );

  if (!usuario) {
    throw new Error('Credenciales incorrectas. Verifica tu correo y contraseña.');
  }

  // Verificar estado de la cuenta
  if (usuario.estado && usuario.estado.toLowerCase() !== 'activo') {
    throw new Error(`Tu cuenta se encuentra ${usuario.estado}. Contacte al administrador para reactivarla.`);
  }

  // Verificar contraseña
  const esValida = verifyPassword(password, usuario.passwordHash, usuario.salt);
  if (!esValida) {
    throw new Error('Credenciales incorrectas. Verifica tu correo y contraseña.');
  }

  // Actualizar último acceso
  usuario.ultimoAcceso = new Date().toISOString().replace('T', ' ').substring(0, 16);
  usuario.fechaActualizacion = new Date().toISOString();

  // Generar token de sesión
  const token = generateToken(32);
  const nuevaSesion = {
    id: db.getNextSessionId(),
    token,
    usuarioId: usuario.id,
    usuarioEmail: usuario.email,
    creadoEn: new Date().toISOString(),
    expiraEn: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    revocado: false,
    ip
  };

  db.sessions.push(nuevaSesion);

  // Registrar auditoría
  registrarActividad(
    'login',
    `<strong>${usuario.nombre}</strong> inició sesión desde ${ip}`,
    usuario.id
  );

  return {
    mensaje: 'Inicio de sesión exitoso',
    token,
    usuario: sanitizeUser(usuario)
  };
}

/**
 * Cerrar sesión (revocar token específico)
 */
function cerrarSesion(token) {
  if (!token) {
    throw new Error('Token de sesión requerido');
  }

  const sesion = db.sessions.find((s) => s.token === token && !s.revocado);
  if (sesion) {
    sesion.revocado = true;
    const usuario = db.users.find((u) => u.id === sesion.usuarioId);
    if (usuario) {
      registrarActividad('session', `<strong>${usuario.nombre}</strong> cerró su sesión`, usuario.id);
    }
  }

  return { mensaje: 'Sesión cerrada correctamente' };
}

/**
 * Verificar si un token de sesión sigue activo y válido
 */
function verificarSesion(token) {
  if (!token) return null;
  const sesion = db.sessions.find(
    (s) => s.token === token && !s.revocado && new Date(s.expiraEn) > new Date()
  );

  if (!sesion) return null;

  const usuario = db.users.find((u) => u.id === sesion.usuarioId);
  if (!usuario || (usuario.estado && usuario.estado.toLowerCase() !== 'activo')) {
    sesion.revocado = true;
    return null;
  }

  return sanitizeUser(usuario);
}

/**
 * Cambiar contraseña de un usuario
 */
function cambiarPassword(usuarioId, { nuevaPassword, passwordActual, solicitanteId }) {
  const usuario = db.users.find((u) => u.id === Number(usuarioId));
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  if (!nuevaPassword || nuevaPassword.length < 6) {
    throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
  }

  const solicitante = solicitanteId ? db.users.find((u) => u.id === Number(solicitanteId)) : null;

  // Si el usuario cambia su propia contraseña, se puede validar la actual
  if (solicitanteId && Number(solicitanteId) === usuario.id && passwordActual) {
    if (!verifyPassword(passwordActual, usuario.passwordHash, usuario.salt)) {
      throw new Error('La contraseña actual es incorrecta');
    }
  } else if (solicitante && solicitante.id !== usuario.id) {
    // Si la cambia un administrador, validar jerarquía
    if (!canManageUser(solicitante.rol, usuario.rol, false)) {
      throw new Error(`No tienes permisos suficientes para cambiar la contraseña de un usuario con rol ${usuario.rol}`);
    }
  }

  const { hash, salt } = hashPassword(nuevaPassword);
  usuario.passwordHash = hash;
  usuario.salt = salt;
  usuario.fechaActualizacion = new Date().toISOString();

  const autorNombre = solicitante ? solicitante.nombre : usuario.nombre;
  registrarActividad(
    'password',
    `<strong>${autorNombre}</strong> cambió la contraseña de <strong>${usuario.nombre}</strong>`,
    solicitante ? solicitante.id : usuario.id
  );

  return { mensaje: `Contraseña de "${usuario.nombre}" actualizada exitosamente` };
}

/**
 * Revocar todas las sesiones activas de un usuario
 */
function revocarSesiones(usuarioId, solicitanteId) {
  const usuario = db.users.find((u) => u.id === Number(usuarioId));
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  const solicitante = solicitanteId ? db.users.find((u) => u.id === Number(solicitanteId)) : null;

  if (solicitante && solicitante.id !== usuario.id) {
    if (!canManageUser(solicitante.rol, usuario.rol, false)) {
      throw new Error(`No tienes permisos para revocar las sesiones de un usuario con rol ${usuario.rol}`);
    }
  }

  let count = 0;
  db.sessions.forEach((s) => {
    if (s.usuarioId === usuario.id && !s.revocado) {
      s.revocado = true;
      count++;
    }
  });

  const autorNombre = solicitante ? solicitante.nombre : usuario.nombre;
  registrarActividad(
    'session',
    `<strong>${autorNombre}</strong> revocó todas las sesiones activas de <strong>${usuario.nombre}</strong>`,
    solicitante ? solicitante.id : usuario.id
  );

  return {
    mensaje: `Se revocaron ${count} sesiones activas de "${usuario.nombre}"`,
    sesionesRevocadas: count
  };
}

/**
 * Solicitar recuperación de contraseña (generación de token de restablecimiento)
 */
function solicitarRecuperacionPassword(email) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Formato de correo electrónico inválido');
  }

  const usuario = db.users.find(
    (u) => u.email && u.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (usuario) {
    const resetToken = generateToken(20);
    usuario.resetPasswordToken = resetToken;
    usuario.resetPasswordExpira = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hora
    registrarActividad('password', `Solicitud de recuperación de contraseña para <strong>${usuario.nombre}</strong> (${usuario.email})`, usuario.id);
  }

  // Respuesta uniforme para evitar enumeración de usuarios
  return {
    mensaje: `Si el correo "${email}" está registrado, se han enviado las instrucciones de recuperación.`
  };
}

module.exports = {
  iniciarSesion,
  cerrarSesion,
  verificarSesion,
  cambiarPassword,
  revocarSesiones,
  solicitarRecuperacionPassword,
  registrarActividad,
  sanitizeUser
};
