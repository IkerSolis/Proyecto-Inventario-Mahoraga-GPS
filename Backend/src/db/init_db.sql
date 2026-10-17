CREATE DATABASE inventario_mahoraga;

-- =====================================================================
-- TABLA DE PRODUCTOS
-- =====================================================================
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL,
    stock INTEGER NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- TABLA DE USUARIOS (Módulo Autenticación y Control de Acceso)
-- =====================================================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    edad INTEGER,
    telefono VARCHAR(20),
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('SuperAdmin', 'Administrador', 'Admin', 'Operador', 'empleado', 'Auditor')),
    estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'desactivado', 'suspendido')),
    invitacion_pendiente BOOLEAN NOT NULL DEFAULT FALSE,
    token_invitacion VARCHAR(255),
    ultimo_acceso TIMESTAMP,
    creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- TABLA DE SESIONES (Tokens y Revocación)
-- =====================================================================
CREATE TABLE sesiones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    ip VARCHAR(45),
    creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
    expira_en TIMESTAMP NOT NULL,
    revocado BOOLEAN NOT NULL DEFAULT FALSE
);

-- =====================================================================
-- TABLA DE HISTORIAL DE ACTIVIDAD (Auditoría)
-- =====================================================================
CREATE TABLE historial_actividad (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL, -- 'login', 'create', 'role', 'status', 'password', 'session'
    texto TEXT NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);
