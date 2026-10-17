// Módulo de Autenticación
// Expone las funciones de autenticación y sesiones para la arquitectura modular del backend.

const authService = require('../../../Inventarios_Mahoraga/inventario-stock/lib/authService');

module.exports = {
  ...authService,
};
