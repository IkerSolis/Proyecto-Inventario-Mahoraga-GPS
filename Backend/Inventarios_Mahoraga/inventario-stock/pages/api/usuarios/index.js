import {
  obtenerUsuarios,
  crearUsuario,
} from '../../../lib/usuarioService';

/**
 * Endpoint: /api/usuarios
 * GET  - Obtener lista de usuarios (filtros: rol, estado, busqueda)
 * POST - Crear e invitar a un nuevo usuario (con validación de privilegio de rol)
 */
export default function handler(req, res) {
  // Obtener lista de usuarios
  if (req.method === 'GET') {
    try {
      const { rol, estado, busqueda } = req.query;
      const usuarios = obtenerUsuarios({ rol, estado, busqueda });
      return res.status(200).json(usuarios);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Crear / invitar nuevo usuario
  if (req.method === 'POST') {
    try {
      const {
        nombre,
        email,
        edad,
        telefono,
        rol,
        password,
        solicitanteRol: bodyRol,
        solicitanteId: bodyId,
      } = req.body || {};

      const solicitanteRol = req.headers['x-user-role'] || bodyRol;
      const solicitanteId = req.headers['x-user-id'] || bodyId;

      const nuevoUsuario = crearUsuario({
        nombre,
        email,
        edad,
        telefono,
        rol,
        password,
        solicitanteRol,
        solicitanteId,
      });

      return res.status(201).json({
        mensaje: 'Usuario creado e invitado exitosamente',
        usuario: nuevoUsuario,
      });
    } catch (error) {
      const isPrivilegeError = error.message.includes('Restricción de privilegios');
      const statusCode = isPrivilegeError ? 403 : 400;
      return res.status(statusCode).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido. Use GET o POST.' });
}
