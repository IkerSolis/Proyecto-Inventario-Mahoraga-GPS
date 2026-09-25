import { obtenerProductos } from '../../../lib/stockService';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { categoria, estado } = req.query;
  const productos = obtenerProductos({ categoria, estado });

  res.status(200).json(productos);
}
