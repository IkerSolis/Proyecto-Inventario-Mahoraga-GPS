// Simulación de base de datos en memoria para desarrollo y pruebas
const { hashPassword } = require('./authCrypto');

let products = [
  { id: 1, nombre: "Playera básica", categoria: "Ropa", stock: 40, stock_minimo: 10, stock_maximo: 100 },
  { id: 2, nombre: "Pantalón mezclilla", categoria: "Ropa", stock: 0, stock_minimo: 5, stock_maximo: 60 },
  { id: 3, nombre: "Laptop 14''", categoria: "Electrónica", stock: 8, stock_minimo: 3, stock_maximo: 20 },
  { id: 4, nombre: "Mouse inalámbrico", categoria: "Electrónica", stock: 95, stock_minimo: 15, stock_maximo: 100 },
  { id: 5, nombre: "Cuaderno profesional", categoria: "Papelería", stock: 12, stock_minimo: 20, stock_maximo: 150 },
];

let stockMovements = [];
let nextMovementId = 1;

// Contraseña por defecto para usuarios iniciales:
const defaultAdminPass = hashPassword('admin123', 'salt_admin_demo');
const defaultUserPass  = hashPassword('usuario123', 'salt_user_demo');

// Tabla de usuarios simulada
let users = [
  {
    id: 1,
    nombre: "Juan Perez",
    email: "juan.perez@mahoraga.com",
    edad: 28,
    telefono: "5512345678",
    rol: "Admin",
    estado: "activo",
    passwordHash: defaultAdminPass.hash,
    salt: defaultAdminPass.salt,
    ultimoAcceso: "2026-10-15 20:30",
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  },
  {
    id: 2,
    nombre: "Ana Lopez",
    email: "ana.lopez@mahoraga.com",
    edad: 22,
    telefono: "5587654321",
    rol: "empleado",
    estado: "activo",
    passwordHash: defaultUserPass.hash,
    salt: defaultUserPass.salt,
    ultimoAcceso: "2026-10-15 18:12",
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  },
  {
    id: 3,
    nombre: "Administrador Sistema",
    email: "admin@mahoraga.com",
    edad: 35,
    telefono: "5500001111",
    rol: "SuperAdmin",
    estado: "activo",
    passwordHash: defaultAdminPass.hash,
    salt: defaultAdminPass.salt,
    ultimoAcceso: "2026-10-16 10:00",
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  },
  {
    id: 4,
    nombre: "Carlos Ruiz",
    email: "carlos.ruiz@mahoraga.com",
    edad: 32,
    telefono: "5599887766",
    rol: "Administrador",
    estado: "activo",
    passwordHash: defaultAdminPass.hash,
    salt: defaultAdminPass.salt,
    ultimoAcceso: "2026-10-15 20:30",
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  },
  {
    id: 5,
    nombre: "Julio Mendoza",
    email: "julio@mahoraga.com",
    edad: 26,
    telefono: "5544332211",
    rol: "Operador",
    estado: "suspendido",
    passwordHash: defaultUserPass.hash,
    salt: defaultUserPass.salt,
    ultimoAcceso: "2026-10-10 14:22",
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  }
];
let nextUserId = 6;

// Tabla de sesiones activas
// Cada registro: { id, token, usuarioId, usuarioEmail, creadoEn, expiraEn, revocado: boolean }
let sessions = [];
let nextSessionId = 1;

// Tabla de historial de actividad (auditoría)
// Cada registro: { id, type, text, usuarioId, time }
let activityLog = [
  { id: 1, type: 'login',    text: '<strong>Carlos Ruiz</strong> inició sesión desde 192.168.1.45', time: '2026-10-15 20:30', usuarioId: 4 },
  { id: 2, type: 'create',   text: '<strong>Carlos Ruiz</strong> invitó al usuario <strong>Julio Mendoza</strong>', time: '2026-10-15 19:50', usuarioId: 4 },
  { id: 3, type: 'status',   text: '<strong>Administrador Sistema</strong> suspendió la cuenta de <strong>Julio Mendoza</strong>', time: '2026-10-14 16:10', usuarioId: 3 }
];
let nextActivityId = 4;

// Tabla de invitaciones pendientes
let invitations = [];
let nextInvitationId = 1;

module.exports = {
  products,
  stockMovements,
  getNextMovementId: () => nextMovementId++,
  users,
  getNextUserId: () => nextUserId++,
  sessions,
  getNextSessionId: () => nextSessionId++,
  activityLog,
  getNextActivityId: () => nextActivityId++,
  invitations,
  getNextInvitationId: () => nextInvitationId++
};
