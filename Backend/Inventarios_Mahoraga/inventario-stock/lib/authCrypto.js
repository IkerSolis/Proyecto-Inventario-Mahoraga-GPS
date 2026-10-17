const crypto = require('crypto');

/**
 * Jerarquía de roles (mayor número = mayor nivel de privilegios)
 * Compatible tanto con los roles de frontend ('SuperAdmin', 'Administrador', 'Operador', 'Auditor')
 * como con los roles iniciales de Samuel ('Admin', 'empleado').
 */
const ROLE_HIERARCHY = {
  'auditor':       1,
  'Auditor':       1,
  'operador':      2,
  'Operador':      2,
  'empleado':      2,
  'Empleado':      2,
  'administrador': 3,
  'Administrador': 3,
  'admin':         3,
  'Admin':         3,
  'superadmin':    4,
  'SuperAdmin':    4
};

const ROLES_VALIDOS = [
  'SuperAdmin',
  'Administrador',
  'Admin',
  'Operador',
  'empleado',
  'Auditor'
];

const ESTADOS_VALIDOS = ['activo', 'inactivo', 'desactivado', 'suspendido'];

/**
 * Obtiene el nivel numérico de un rol
 */
function getRoleLevel(rol) {
  if (!rol) return 0;
  return ROLE_HIERARCHY[rol] || ROLE_HIERARCHY[rol.trim()] || 0;
}

/**
 * Verifica si un usuario con rol 'callerRole' tiene privilegios para asignar 'targetRole'
 * Regla: No puede asignar un rol con nivel igual o superior al suyo (a menos que sea SuperAdmin).
 */
function canAssignRole(callerRole, targetRole) {
  const callerLevel = getRoleLevel(callerRole);
  const targetLevel = getRoleLevel(targetRole);

  if (callerLevel === 0 || targetLevel === 0) return false;
  
  // SuperAdmin puede asignar cualquier rol válido
  if (callerLevel >= 4) return targetLevel <= 4;

  // Otros roles solo pueden asignar roles estrictamente inferiores
  return targetLevel < callerLevel;
}

/**
 * Verifica si un usuario con 'callerRole' puede gestionar/modificar a un usuario con 'targetUserRole'
 */
function canManageUser(callerRole, targetUserRole, isSelf = false) {
  if (isSelf) return true;
  const callerLevel = getRoleLevel(callerRole);
  const targetLevel = getRoleLevel(targetUserRole);

  if (callerLevel === 0) return false;
  if (callerLevel >= 4) return true; // SuperAdmin puede gestionar a todos
  return callerLevel > targetLevel;
}

/**
 * Genera hash seguro para contraseña usando scrypt
 */
function hashPassword(password, salt) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

/**
 * Valida una contraseña en texto plano contra su hash y salt
 */
function verifyPassword(password, hash, salt) {
  if (!password || !hash || !salt) return false;
  try {
    const checkHash = crypto.scryptSync(password, salt, 64).toString('hex');
    const hashBuf = Buffer.from(hash, 'hex');
    const checkBuf = Buffer.from(checkHash, 'hex');
    if (hashBuf.length !== checkBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, checkBuf);
  } catch (err) {
    return false;
  }
}

/**
 * Genera token seguro para sesión o invitación
 */
function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

module.exports = {
  ROLE_HIERARCHY,
  ROLES_VALIDOS,
  ESTADOS_VALIDOS,
  getRoleLevel,
  canAssignRole,
  canManageUser,
  hashPassword,
  verifyPassword,
  generateToken,
};
