-- ==============================================================================
-- INVENTARIO MAHORAGA - SCRIPT DE INICIALIZACIÓN DE POSTGRESQL
-- ==============================================================================
-- Este script es únicamente para crear la base de datos principal en entornos
-- locales de los desarrolladores o en el servidor de producción.
-- 
-- IMPORTANTE: No agregues tablas aquí. La creación de tablas (usuarios,
-- productos, etc.) se hará de forma automática ejecutando las migraciones 
-- de Knex.js en el backend para llevar un control de versiones correcto.
-- ==============================================================================

-- 1. Crear la base de datos
CREATE DATABASE inventario_mahoraga;

-- Nota para el equipo:
-- Después de ejecutar este archivo, asegúrate de configurar la conexión en 
-- tu archivo .env del Backend (ej: DATABASE_URL=postgres://usuario:password@localhost:5432/inventario_mahoraga)
