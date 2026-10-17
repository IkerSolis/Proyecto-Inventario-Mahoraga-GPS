// Estado simulado para desarrollo y pruebas; la migración a PostgreSQL queda pendiente.
// Se conserva en globalThis para compartir inventario, usuarios y sesiones entre
// rutas API durante los hot reloads de Next.js.
const { hashPassword } = require('./authCrypto');

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

  const defaultAdminPass = hashPassword('admin123', 'salt_admin_demo');
  const defaultUserPass = hashPassword('usuario123', 'salt_user_demo');
  const ahora = new Date().toISOString();

  globalThis.__mahoragaDb = {
    products: productosIniciales,
    stockMovements: [],
    nextMovementId: 1,
    nextProductId: productosIniciales.length + 1,
    users: [
      { id: 1, nombre: "Juan Perez", email: "juan.perez@mahoraga.com", edad: 28, telefono: "5512345678", rol: "Admin", estado: "activo", passwordHash: defaultAdminPass.hash, salt: defaultAdminPass.salt, ultimoAcceso: "2026-10-15 20:30", fechaCreacion: ahora, fechaActualizacion: ahora },
      { id: 2, nombre: "Ana Lopez", email: "ana.lopez@mahoraga.com", edad: 22, telefono: "5587654321", rol: "empleado", estado: "activo", passwordHash: defaultUserPass.hash, salt: defaultUserPass.salt, ultimoAcceso: "2026-10-15 18:12", fechaCreacion: ahora, fechaActualizacion: ahora },
      { id: 3, nombre: "Administrador Sistema", email: "admin@mahoraga.com", edad: 35, telefono: "5500001111", rol: "SuperAdmin", estado: "activo", passwordHash: defaultAdminPass.hash, salt: defaultAdminPass.salt, ultimoAcceso: "2026-10-16 10:00", fechaCreacion: ahora, fechaActualizacion: ahora },
      { id: 4, nombre: "Carlos Ruiz", email: "carlos.ruiz@mahoraga.com", edad: 32, telefono: "5599887766", rol: "Administrador", estado: "activo", passwordHash: defaultAdminPass.hash, salt: defaultAdminPass.salt, ultimoAcceso: "2026-10-15 20:30", fechaCreacion: ahora, fechaActualizacion: ahora },
      { id: 5, nombre: "Julio Mendoza", email: "julio@mahoraga.com", edad: 26, telefono: "5544332211", rol: "Operador", estado: "suspendido", passwordHash: defaultUserPass.hash, salt: defaultUserPass.salt, ultimoAcceso: "2026-10-10 14:22", fechaCreacion: ahora, fechaActualizacion: ahora },
    ],
    nextUserId: 6,
    sessions: [],
    nextSessionId: 1,
    activityLog: [
      { id: 1, type: 'login', text: '<strong>Carlos Ruiz</strong> inició sesión desde 192.168.1.45', time: '2026-10-15 20:30', usuarioId: 4 },
      { id: 2, type: 'create', text: '<strong>Carlos Ruiz</strong> invitó al usuario <strong>Julio Mendoza</strong>', time: '2026-10-15 19:50', usuarioId: 4 },
      { id: 3, type: 'status', text: '<strong>Administrador Sistema</strong> suspendió la cuenta de <strong>Julio Mendoza</strong>', time: '2026-10-14 16:10', usuarioId: 3 },
    ],
    nextActivityId: 4,
    invitations: [],
    nextInvitationId: 1,
  };
}

const store = globalThis.__mahoragaDb;

module.exports = {
  products: store.products,
  stockMovements: store.stockMovements,
  getNextMovementId: () => store.nextMovementId++,
  getNextProductId: () => store.nextProductId++,
  users: store.users,
  getNextUserId: () => store.nextUserId++,
  sessions: store.sessions,
  getNextSessionId: () => store.nextSessionId++,
  activityLog: store.activityLog,
  getNextActivityId: () => store.nextActivityId++,
  invitations: store.invitations,
  getNextInvitationId: () => store.nextInvitationId++,
};
