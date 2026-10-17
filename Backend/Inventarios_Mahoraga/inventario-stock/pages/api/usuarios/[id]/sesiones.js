import { revocarSesiones } from '../../../../lib/authService';

/**
 * Endpoint: /api/usuarios/[id]/sesiones
 * Method: DELETE o POST
 * Revoca todas las sesiones activas de un usuario
 */
export default function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'DELETE' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Use DELETE o POST.' });
  }

  try {
    const { solicitanteId: bodyId } = req.body || {};
    const solicitanteId = req.headers['x-user-id'] || bodyId;

    const resultado = revocarSesiones(id, solicitanteId);
    return res.status(200).json(resultado);
  } catch (error) {
    const isNotFound = error.message === 'Usuario no encontrado';
    const isForbidden = error.message.includes('No tienes permisos');
    const statusCode = isNotFound ? 404 : isForbidden ? 403 : 400;
    return res.status(statusCode).json({ error: error.message });
  }
}
