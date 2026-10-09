// Página para probar todo el módulo desde el navegador:
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const formatoPrecio = (valor) =>
  valor === null || valor === undefined
    ? '—'
    : Number(valor).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  // Lista completa (sin filtros): sirve para el selector de productos, las categorías
  // y para poner nombre a los movimientos del historial.
  const [todosLosProductos, setTodosLosProductos] = useState([]);
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

  // Trae todos los productos, sin filtros
  async function cargarTodosLosProductos() {
    const res = await fetch('/api/products');
    const data = await res.json();
    setTodosLosProductos(data);
  }

  // Trae el historial completo de movimientos
  async function cargarHistorial() {
    const res = await fetch('/api/movements');
    const data = await res.json();
    setHistorial(data);
  }

  //carga todo una vez al abrir la página
  useEffect(() => {
    cargarTodosLosProductos();
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
    cargarTodosLosProductos();
    cargarHistorial();
  }

  // Categorías disponibles, sacadas de todos los productos (no solo de los filtrados)
  const categorias = [...new Set(todosLosProductos.map((p) => p.categoria))];

  const etiquetaTipo = (tipo) => (tipo === 'stock_inicial' ? 'stock inicial' : tipo);

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 900, margin: '0 auto' }}>
      <Head>
        <title>Inventario | Inventarios Mahoraga</title>
      </Head>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <h1>Inventario</h1>
        <Link
          href="/nuevo-producto"
          style={{
            background: '#0d6e5a',
            color: '#fff',
            padding: '10px 18px',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          + Nuevo producto
        </Link>
      </div>

      <h2>Registrar movimiento</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <select
          value={form.product_id}
          onChange={(e) => setForm({ ...form, product_id: e.target.value })}
          required
        >
          <option value="">Selecciona producto</option>
          {todosLosProductos.map((p) => (
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
            <th>Imagen</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td style={{ textAlign: 'center' }}>
                {p.imagen ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imagen}
                    alt={p.nombre}
                    width={40}
                    height={40}
                    style={{ objectFit: 'cover', borderRadius: 6 }}
                  />
                ) : (
                  '—'
                )}
              </td>
              <td>
                {p.nombre}
                {p.descripcion && (
                  <div style={{ fontSize: 12, color: '#64748b' }}>{p.descripcion}</div>
                )}
              </td>
              <td>{p.categoria}</td>
              <td>{formatoPrecio(p.precio_venta)}</td>
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
            const producto = todosLosProductos.find((p) => p.id === m.product_id);
            return (
              <tr key={m.id}>
                <td>{new Date(m.timestamp).toLocaleString()}</td>
                <td>{producto ? producto.nombre : m.product_id}</td>
                <td>{etiquetaTipo(m.tipo_movimiento)}</td>
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
