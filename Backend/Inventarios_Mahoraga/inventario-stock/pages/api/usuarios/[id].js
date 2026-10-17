import {
  obtenerUsuarioPorId,
  editarUsuario,
  cambiarEstadoUsuario,
} from '../../../lib/usuarioService';

/**
 * Endpoint: /api/usuarios/[id]
 * GET - Consultar usuario por ID
 * PUT / PATCH - Editar datos (nombre, email, edad, telefono), rol y/o estado
 */
export default function handler(req, res) {
  const { id } = req.query;

  // Obtener usuario por ID
  if (req.method === 'GET') {
    try {
      const usuario = obtenerUsuarioPorId(id);
      return res.status(200).json(usuario);
    } catch (error) {
      const statusCode = error.message === 'Usuario no encontrado' ? 404 : 400;
      return res.status(statusCode).json({ error: error.message });
    }
  }

  // Editar datos de usuario y/o asignar rol
  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const {
        nombre,
        email,
        edad,
        telefono,
        rol,
        estado,
        solicitanteRol: bodyRol,
        solicitanteId: bodyId,
      } = req.body || {};

      const solicitanteRol = req.headers['x-user-role'] || bodyRol;
      const solicitanteId = req.headers['x-user-id'] || bodyId;

      let usuarioActualizado;

      // Si se envían datos personales, email o rol
      if (
        nombre !== undefined ||
        email !== undefined ||
        edad !== undefined ||
        telefono !== undefined ||
        rol !== undefined
      ) {
        usuarioActualizado = editarUsuario(
          id,
          { nombre, email, edad, telefono, rol },
          solicitanteRol,
          solicitanteId
        );
      }

      // Si también se incluyó el estado en la misma petición
      if (estado !== undefined) {
        usuarioActualizado = cambiarEstadoUsuario(
          id,
          estado,
          solicitanteRol,
          solicitanteId
        );
      }

      if (!usuarioActualizado) {
        usuarioActualizado = obtenerUsuarioPorId(id);
      }

      return res.status(200).json({
        mensaje: 'Usuario actualizado exitosamente',
        usuario: usuarioActualizado,
      });
    } catch (error) {
      const isForbidden =
        error.message.includes('No tienes permisos') ||
        error.message.includes('Restricción de privilegios') ||
        error.message.includes('supera tus permisos') ||
        error.message.includes('cambiar tu propio rol');
      const isNotFound = error.message === 'Usuario no encontrado';
      const statusCode = isNotFound ? 404 : isForbidden ? 403 : 400;
      return res.status(statusCode).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido. Use GET, PUT o PATCH.' });
}
