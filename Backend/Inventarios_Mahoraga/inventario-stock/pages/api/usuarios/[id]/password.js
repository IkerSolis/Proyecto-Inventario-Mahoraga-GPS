import { cambiarPassword } from '../../../../lib/authService';

/**
 * Endpoint: /api/usuarios/[id]/password
 * Method: POST o PATCH
 * Body: { "nuevaPassword": "...", "passwordActual": "..." }
 */
export default function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'POST' && req.method !== 'PATCH' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método no permitido. Use POST o PATCH.' });
  }

  try {
    const { nuevaPassword, passwordActual, solicitanteId: bodyId } = req.body || {};
    const solicitanteId = req.headers['x-user-id'] || bodyId;

    const resultado = cambiarPassword(id, {
      nuevaPassword,
      passwordActual,
      solicitanteId,
    });

    return res.status(200).json(resultado);
  } catch (error) {
    const isNotFound = error.message === 'Usuario no encontrado';
    const isForbidden = error.message.includes('No tienes permisos');
    const statusCode = isNotFound ? 404 : isForbidden ? 403 : 400;
    return res.status(statusCode).json({ error: error.message });
  }
}
