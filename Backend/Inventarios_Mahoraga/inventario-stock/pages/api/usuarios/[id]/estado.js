import { cambiarEstadoUsuario } from '../../../../lib/usuarioService';

/**
 * Endpoint específico: /api/usuarios/[id]/estado
 * Body esperado: { "estado": "activo" | "desactivado" | "inactivo" | "suspendido" }
 */
export default function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PATCH' || req.method === 'PUT') {
    try {
      const { estado } = req.body;
      const usuarioActualizado = cambiarEstadoUsuario(id, estado);

      return res.status(200).json({
        mensaje: `La cuenta ha sido actualizada al estado '${usuarioActualizado.estado}'`,
        usuario: usuarioActualizado,
      });
    } catch (error) {
      const statusCode = error.message === 'Usuario no encontrado' ? 404 : 400;
      return res.status(statusCode).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido. Use PATCH o PUT.' });
}
