// CORS para que el formulario HTML estático (Frontend/nuevo_producto.html) o cualquier
// otro front en otro puerto pueda llamar a la API.
// Devuelve true si la petición era un preflight (OPTIONS) y ya fue respondida.
export function aplicarCors(req, res) {
  const origen = process.env.CORS_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origen);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}
