import { solicitarRecuperacionPassword } from '../../../lib/authService';

/**
 * Endpoint: /api/auth/recuperar
 * Method: POST
 * Body: { "email": "usuario@mahoraga.com" }
 */
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Use POST.' });
  }

  try {
    const { email } = req.body || {};
    const resultado = solicitarRecuperacionPassword(email);
    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
