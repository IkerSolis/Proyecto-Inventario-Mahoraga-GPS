// Página para probar todo el módulo desde el navegador:
import { useEffect, useState } from 'react';

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [categoria, setCategoria] = useState('');
  const [estado, setEstado] = useState('');
  const [form, setForm] = useState({ product_id: '', tipo_movimiento: 'compra', cantidad: '' });
  const [mensaje, setMensaje] = useState('');

  // Trae los productos aplicando los filtros seleccionados
  async function cargarProductos() {
    const params = new URLSearchParams();
    if (categoria) params.append('categoria', categoria);
    if (estado) params.append('estado', estado);

    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProductos(data);
  }

  // Trae el historial completo de movimientos
  async function cargarHistorial() {
    const res = await fetch('/api/movements');
    const data = await res.json();
    setHistorial(data);
  }

  //carga todo una vez al abrir la página
  useEffect(() => {
    cargarProductos();
    cargarHistorial();
  }, []);

  //vuelve a cargar productos cada vez que cambia un filtro
  useEffect(() => {
    cargarProductos();
  }, [categoria, estado]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMensaje('');

    const res = await fetch('/api/movements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setMensaje(`Error: ${data.error}`);
      return;
    }

    setMensaje('Movimiento registrado correctamente');
    setForm({ product_id: '', tipo_movimiento: 'compra', cantidad: '' });
    cargarProductos();
    cargarHistorial();
  }

  // Categorías disponibles, sacadas de los productos ya cargados
  const categorias = [...new Set(productos.map((p) => p.categoria))];

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 900, margin: '0 auto' }}>
      <h1>Inventario</h1>

      <h2>Registrar movimiento</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <select
          value={form.product_id}
          onChange={(e) => setForm({ ...form, product_id: e.target.value })}
          required
        >
          <option value="">Selecciona producto</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre} (stock: {p.stock})</option>
          ))}
        </select>

        <select
          value={form.tipo_movimiento}
          onChange={(e) => setForm({ ...form, tipo_movimiento: e.target.value })}
        >
          <option value="compra">Compra (entrada)</option>
          <option value="venta">Venta (salida)</option>
        </select>

        <input
          type="number"
          placeholder="Cantidad"
          value={form.cantidad}
          onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
          min="1"
          required
        />

        <button type="submit">Registrar</button>
      </form>
      {mensaje && <p>{mensaje}</p>}

      <h2>Filtros</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="agotado">Agotado</option>
          <option value="bajo">Bajo</option>
          <option value="normal">Normal</option>
          <option value="lleno">Lleno</option>
        </select>
      </div>

      <h2>Productos</h2>
      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 24 }}>
        <thead>
          <tr>
            <th>Nombre</th><th>Categoría</th><th>Stock</th><th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.categoria}</td>
              <td>{p.stock}</td>
              <td>{p.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Historial de movimientos</h2>
      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Stock previo</th><th>Stock resultante</th>
          </tr>
        </thead>
        <tbody>
          {historial.map((m) => {
            const producto = productos.find((p) => p.id === m.product_id);
            return (
              <tr key={m.id}>
                <td>{new Date(m.timestamp).toLocaleString()}</td>
                <td>{producto ? producto.nombre : m.product_id}</td>
                <td>{m.tipo_movimiento}</td>
                <td>{m.cantidad}</td>
                <td>{m.stock_previo}</td>
                <td>{m.stock_resultante}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
