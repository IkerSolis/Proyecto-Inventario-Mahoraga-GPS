// Punto de entrada del módulo de Autenticación y Gestión de Usuarios

const usuarioService = require('./usuarioService');
const authService = require('./authService');

module.exports = {
  ...usuarioService,
  ...authService,
};
