/**
 * Test Suite: Módulo de Autenticación y Gestión de Usuarios (Backend)
 * Inventarios Mahoraga
 *
 * Valida los 6 puntos requeridos:
 *  1. Iniciar sesión / Login de usuarios
 *  2. Crear usuarios e invitarlos al sistema
 *  3. Editar datos y asignar roles
 *  4. Activar, desactivar o suspender cuentas
 *  5. Cambiar contraseñas y revocar sesiones
 *  6. Consultar historial de actividad
 *  7. Evitar asignación de privilegios superiores a los administrables
 */

const assert = require('assert');
const {
  iniciarSesion,
  cerrarSesion,
  verificarSesion,
  cambiarPassword,
  revocarSesiones,
  solicitarRecuperacionPassword
} = require('../Inventarios_Mahoraga/inventario-stock/lib/authService');

const {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  editarUsuario,
  cambiarEstadoUsuario,
  obtenerHistorialActividad,
  canAssignRole,
  canManageUser
} = require('../Inventarios_Mahoraga/inventario-stock/lib/usuarioService');

let passedTests = 0;
let totalTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${description}`);
    console.error(`     Error: ${err.message}`);
    process.exitCode = 1;
  }
}

console.log('\n======================================================');
console.log('🧪 EJECUTANDO PRUEBAS DE AUTENTICACIÓN Y GESTIÓN DE USUARIOS');
console.log('======================================================\n');

// ---------------------------------------------------------------------
// TEST 1: Login de usuarios
// ---------------------------------------------------------------------
console.log('📌 Requerimiento: Login y Autenticación');

test('Login exitoso con credenciales correctas genera token y sesión', () => {
  const res = iniciarSesion({ email: 'admin@mahoraga.com', password: 'admin123', ip: '192.168.1.10' });
  assert(res.token, 'Debe devolver un token de sesión');
  assert.strictEqual(res.usuario.email, 'admin@mahoraga.com');
  assert.strictEqual(res.usuario.passwordHash, undefined, 'No debe filtrar passwordHash');
  assert.strictEqual(res.usuario.salt, undefined, 'No debe filtrar salt');

  const sesionValida = verificarSesion(res.token);
  assert(sesionValida, 'El token debe ser verificado como sesión activa');
});

test('Login fallido con contraseña incorrecta es rechazado', () => {
  assert.throws(
    () => iniciarSesion({ email: 'admin@mahoraga.com', password: 'wrongpassword' }),
    /Credenciales incorrectas/
  );
});

test('Login rechazado si la cuenta está suspendida', () => {
  assert.throws(
    () => iniciarSesion({ email: 'julio@mahoraga.com', password: 'usuario123' }),
    /cuenta se encuentra suspendido/
  );
});

// ---------------------------------------------------------------------
// TEST 2: Crear usuarios e invitarlos al sistema
// ---------------------------------------------------------------------
console.log('\n📌 Requerimiento: Crear e invitar usuarios');

let nuevoUserId = null;
test('Crear e invitar usuario con rol válido', () => {
  const usuario = crearUsuario({
    nombre: 'Valeria Ramos',
    email: 'valeria.ramos@mahoraga.com',
    edad: 27,
    telefono: '5566778899',
    rol: 'Operador',
    solicitanteRol: 'SuperAdmin'
  });
  nuevoUserId = usuario.id;
  assert.strictEqual(usuario.nombre, 'Valeria Ramos');
  assert.strictEqual(usuario.email, 'valeria.ramos@mahoraga.com');
  assert.strictEqual(usuario.rol, 'Operador');
  assert.strictEqual(usuario.invitacionPendiente, true, 'Debe marcarse como invitación pendiente');
  assert(usuario.tokenInvitacion, 'Debe generar token de invitación');
});

test('Rechazar creación de usuario con correo duplicado', () => {
  assert.throws(
    () => crearUsuario({
      nombre: 'Valeria Clon',
      email: 'valeria.ramos@mahoraga.com',
      rol: 'Operador',
      solicitanteRol: 'SuperAdmin'
    }),
    /ya se encuentra registrado/
  );
});

// ---------------------------------------------------------------------
// TEST 3: Editar datos y asignar roles
// ---------------------------------------------------------------------
console.log('\n📌 Requerimiento: Editar datos y asignar roles');

test('Editar nombre, teléfono y asignar nuevo rol permitido', () => {
  const editado = editarUsuario(
    nuevoUserId,
    { nombre: 'Valeria R. de la O', telefono: '5511223344', rol: 'Auditor' },
    'SuperAdmin'
  );
  assert.strictEqual(editado.nombre, 'Valeria R. de la O');
  assert.strictEqual(editado.telefono, '5511223344');
  assert.strictEqual(editado.rol, 'Auditor');
});

// ---------------------------------------------------------------------
// TEST 4: Activar, desactivar o suspender cuentas
// ---------------------------------------------------------------------
console.log('\n📌 Requerimiento: Activar, desactivar o suspender cuentas');

test('Suspender una cuenta revoca sus sesiones activas', () => {
  // Primero creamos sesión para Valeria
  const loginRes = iniciarSesion({
    email: 'carlos.ruiz@mahoraga.com',
    password: 'admin123'
  });
  assert(verificarSesion(loginRes.token), 'Sesión de Carlos debe estar activa');

  // Ahora suspendemos a Carlos (por parte de SuperAdmin)
  cambiarEstadoUsuario(4, 'suspendido', 'SuperAdmin');
  const usuario = obtenerUsuarioPorId(4);
  assert.strictEqual(usuario.estado, 'suspendido');

  // Su sesión previa debe quedar invalidada
  const verificacion = verificarSesion(loginRes.token);
  assert.strictEqual(verificacion, null, 'Sesión debe quedar revocada al suspender cuenta');

  // Reactivamos la cuenta
  cambiarEstadoUsuario(4, 'activo', 'SuperAdmin');
  assert.strictEqual(obtenerUsuarioPorId(4).estado, 'activo');
});

// ---------------------------------------------------------------------
// TEST 5: Cambiar contraseñas y revocar sesiones
// ---------------------------------------------------------------------
console.log('\n📌 Requerimiento: Cambiar contraseñas y revocar sesiones');

test('Cambiar contraseña de usuario permite login con nueva contraseña', () => {
  cambiarPassword(4, { nuevaPassword: 'nuevaPassword2026' });
  const loginRes = iniciarSesion({
    email: 'carlos.ruiz@mahoraga.com',
    password: 'nuevaPassword2026'
  });
  assert(loginRes.token, 'Debe poder iniciar sesión con la nueva contraseña');
});

test('Rechazar cambio de contraseña si tiene menos de 6 caracteres', () => {
  assert.throws(
    () => cambiarPassword(4, { nuevaPassword: '123' }),
    /al menos 6 caracteres/
  );
});

test('Revocar todas las sesiones activas de un usuario', () => {
  const s1 = iniciarSesion({ email: 'carlos.ruiz@mahoraga.com', password: 'nuevaPassword2026' });
  const s2 = iniciarSesion({ email: 'carlos.ruiz@mahoraga.com', password: 'nuevaPassword2026' });
  assert(verificarSesion(s1.token));
  assert(verificarSesion(s2.token));

  const res = revocarSesiones(4);
  assert(res.sesionesRevocadas >= 2, 'Debió revocar al menos 2 sesiones');
  assert.strictEqual(verificarSesion(s1.token), null, 'Token 1 debe estar revocado');
  assert.strictEqual(verificarSesion(s2.token), null, 'Token 2 debe estar revocado');
});

// ---------------------------------------------------------------------
// TEST 6: Consultar historial de actividad
// ---------------------------------------------------------------------
console.log('\n📌 Requerimiento: Consultar historial de actividad');

test('Historial registra eventos de login, creación, cambio de rol, estado, password y sesiones', () => {
  const logs = obtenerHistorialActividad();
  assert(logs.length > 0, 'Debe haber entradas en el historial');

  const tipos = new Set(logs.map((l) => l.type));
  assert(tipos.has('login'), 'Debe registrar login');
  assert(tipos.has('create'), 'Debe registrar creación de usuario');
  assert(tipos.has('role'), 'Debe registrar cambio de rol');
  assert(tipos.has('status'), 'Debe registrar cambio de estado');
  assert(tipos.has('password'), 'Debe registrar cambio de password');
  assert(tipos.has('session'), 'Debe registrar revocación de sesión');
});

// ---------------------------------------------------------------------
// TEST 7: Evitar que alguien se asigne privilegios superiores
// ---------------------------------------------------------------------
console.log('\n📌 Requerimiento: Evitar asignación de privilegios superiores');

test('Un Administrador NO puede asignar rol SuperAdmin ni Administrador', () => {
  assert.strictEqual(canAssignRole('Administrador', 'SuperAdmin'), false);
  assert.strictEqual(canAssignRole('Administrador', 'Administrador'), false);
  assert.strictEqual(canAssignRole('Administrador', 'Operador'), true);

  assert.throws(
    () => crearUsuario({
      nombre: 'Hacker User',
      email: 'hacker@mahoraga.com',
      rol: 'SuperAdmin',
      solicitanteRol: 'Administrador'
    }),
    /Restricción de privilegios/
  );
});

test('Un Operador NO puede cambiar el estado ni gestionar a un Administrador', () => {
  assert.strictEqual(canManageUser('Operador', 'Administrador'), false);

  assert.throws(
    () => cambiarEstadoUsuario(1, 'suspendido', 'Operador'),
    /No tienes privilegios/
  );
});

test('Un usuario no puede auto-cambiarse el rol para auto-promoverse', () => {
  assert.throws(
    () => editarUsuario(4, { rol: 'SuperAdmin' }, 'Administrador', 4),
    /No puedes cambiar tu propio rol/
  );
});

console.log(`\n======================================================`);
console.log(`📊 RESULTADO: ${passedTests}/${totalTests} pruebas pasaron exitosamente.`);
console.log(`======================================================\n`);
