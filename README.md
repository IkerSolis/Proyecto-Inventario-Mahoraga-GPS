# Inventario Mahoraga

## Descripción del Proyecto

**Inventario Mahoraga** es un sistema de gestión de inventarios diseñado para controlar de manera eficiente y precisa el flujo de productos y recursos. El objetivo principal de este software es facilitar la administración de entradas y salidas, permitiendo a los usuarios mantener un registro actualizado y organizado de sus existencias.

## Estado del Proyecto

El proyecto se encuentra en sus etapas iniciales de planificación y configuración.

Ya están conectados entre sí:

- **Inventario y stock** (`Backend/Inventarios_Mahoraga/inventario-stock`): listado de productos con filtros, registro de compras/ventas e historial de movimientos.
- **Nuevo producto** (`Frontend/nuevo_producto.html` y `Frontend/components/nuevo_producto.jsx`): formulario que da de alta productos en el inventario a través de `POST /api/products`.

> Por ahora los datos viven en memoria (se reinician al apagar el servidor). Más adelante se migrará a PostgreSQL.

## Cómo ejecutarlo

Requiere Node.js 18 o superior.

```bash
cd Backend/Inventarios_Mahoraga/inventario-stock
npm install
npm run dev
```

Abre <http://localhost:3000>:

| Ruta | Qué hace |
| --- | --- |
| `/inventario` | Productos, filtros, registro de movimientos e historial |
| `/nuevo-producto` | Formulario para agregar un producto nuevo |
| `/api/products` | `GET` lista (filtros `categoria` y `estado`) · `POST` crea un producto |
| `/api/movements` | `GET` historial (filtro `product_id`) · `POST` registra compra o venta |

### Formulario HTML estático

`Frontend/nuevo_producto.html` también funciona por separado: con el backend corriendo, sírvelo con cualquier servidor estático (por ejemplo `npx serve Frontend -l 5500`, para no chocar con el puerto 3000 del backend) y ábrelo en el navegador. Apunta a `http://localhost:3000`; si el backend usa otra URL, cambia `window.MAHORAGA_API_URL` al final del HTML.

### Alta de producto: `POST /api/products`

```json
{
  "nombre": "Taladro Percutor 20V",
  "descripcion": "Inalámbrico",
  "categoria": "Ferretería y Herramientas",
  "estado_inicial": "Disponible",
  "precio_venta": 1299.9,
  "stock": 25,
  "stock_minimo": 10,
  "stock_maximo": 100,
  "imagen": "data:image/png;base64,..."
}
```

Solo `nombre` y `categoria` son obligatorios. Si no se envía `stock_maximo` se calcula uno. La imagen es opcional (PNG o JPG, máximo 5MB). Si el producto nace con stock, queda registrado en el historial como `stock_inicial`. Errores: `400` datos inválidos, `409` ya existe un producto con ese nombre.
