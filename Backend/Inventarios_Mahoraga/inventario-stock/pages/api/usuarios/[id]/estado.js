import { cambiarEstadoUsuario } from '../../../../lib/usuarioService';

/**
 * Endpoint específico: /api/usuarios/[id]/estado
 * Body esperado: { "estado": "activo" | "desactivado" | "inactivo" | "suspendido" }
 */
export default function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PATCH' || req.method === 'PUT') {
    try {
      const { estado, solicitanteRol: bodyRol, solicitanteId: bodyId } = req.body || {};
      const solicitanteRol = req.headers['x-user-role'] || bodyRol;
      const solicitanteId = req.headers['x-user-id'] || bodyId;

      const usuarioActualizado = cambiarEstadoUsuario(id, estado, solicitanteRol, solicitanteId);

      return res.status(200).json({
        mensaje: `La cuenta ha sido actualizada al estado '${usuarioActualizado.estado}'`,
        usuario: usuarioActualizado,
      });
    } catch (error) {
      const isForbidden = error.message.includes('No tienes privilegios');
      const isNotFound = error.message === 'Usuario no encontrado';
      const statusCode = isNotFound ? 404 : isForbidden ? 403 : 400;
      return res.status(statusCode).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido. Use PATCH o PUT.' });
}
