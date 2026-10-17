import { obtenerHistorialActividad } from '../../../lib/usuarioService';

/**
 * Endpoint: /api/actividad
 * Method: GET
 * Query params: tipo, usuarioId, limite
 */
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido. Use GET.' });
  }

  try {
    const { tipo, usuarioId, limite } = req.query;
    const actividades = obtenerHistorialActividad({ tipo, usuarioId, limite });
    return res.status(200).json(actividades);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
