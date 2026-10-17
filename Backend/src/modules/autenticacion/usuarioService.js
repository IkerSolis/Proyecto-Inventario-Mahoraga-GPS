// Módulo de Autenticación y Gestión de Usuarios
// Este archivo expone las funciones del servicio de usuarios para la arquitectura modular del backend.

const usuarioService = require('../../../Inventarios_Mahoraga/inventario-stock/lib/usuarioService');

module.exports = {
  ...usuarioService,
};
