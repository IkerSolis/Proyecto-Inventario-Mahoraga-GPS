import { iniciarSesion } from '../../../lib/authService';

/**
 * Endpoint: /api/auth/login
 * Method: POST
 * Body: { "email": "usuario@mahoraga.com", "password": "..." }
 */
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Use POST.' });
  }

  try {
    const { email, password } = req.body || {};
    const ip =
      req.headers['x-forwarded-for'] ||
      req.connection?.remoteAddress ||
      '127.0.0.1';

    const resultado = iniciarSesion({ email, password, ip });

    return res.status(200).json(resultado);
  } catch (error) {
    const isUnauthorized =
      error.message.includes('Credenciales incorrectas') ||
      error.message.includes('se encuentra suspendida') ||
      error.message.includes('se encuentra inactiva') ||
      error.message.includes('se encuentra desactivada') ||
      error.message.includes('Contacte al administrador');

    const statusCode = isUnauthorized ? 401 : 400;
    return res.status(statusCode).json({ error: error.message });
  }
}
