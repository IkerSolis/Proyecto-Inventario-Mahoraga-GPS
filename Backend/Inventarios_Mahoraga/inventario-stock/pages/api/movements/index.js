import { registrarMovimiento, obtenerHistorial } from '../../../lib/stockService';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const { product_id } = req.query;
    const historial = obtenerHistorial({ product_id });
    return res.status(200).json(historial);
  }

  if (req.method === 'POST') {
    try {
      const { product_id, tipo_movimiento, cantidad } = req.body;
      const movimiento = registrarMovimiento({ product_id, tipo_movimiento, cantidad });
      return res.status(201).json(movimiento);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
