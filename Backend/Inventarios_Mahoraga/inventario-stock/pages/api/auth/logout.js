import { cerrarSesion } from '../../../lib/authService';

/**
 * Endpoint: /api/auth/logout
 * Method: POST
 * Headers: Authorization: Bearer <token> o Body: { "token": "..." }
 */
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Use POST.' });
  }

  try {
    const authHeader = req.headers['authorization'];
    const tokenHeader = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = tokenHeader || req.body?.token;

    const resultado = cerrarSesion(token);
    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
