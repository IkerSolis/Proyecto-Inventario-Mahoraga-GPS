import { obtenerProductos, crearProducto } from '../../../lib/stockService';
import { aplicarCors } from '../../../lib/cors';

// El formulario puede enviar la imagen (hasta 5MB) en base64, que pesa ~33% más
export const config = {
  api: {
    bodyParser: { sizeLimit: '8mb' },
  },
};

export default function handler(req, res) {
  if (aplicarCors(req, res)) return;

  if (req.method === 'GET') {
    const { categoria, estado } = req.query;
    const productos = obtenerProductos({ categoria, estado });
    return res.status(200).json(productos);
  }

  if (req.method === 'POST') {
    try {
      const producto = crearProducto(req.body || {});
      return res.status(201).json(producto);
    } catch (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
