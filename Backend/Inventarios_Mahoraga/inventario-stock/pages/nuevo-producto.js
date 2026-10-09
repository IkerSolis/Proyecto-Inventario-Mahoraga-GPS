import Head from 'next/head';
import { useRouter } from 'next/router';
import NuevoProducto from '../components/NuevoProducto';

// Página del formulario "Nuevo producto". Habla con POST /api/products (mismo origen).
export default function NuevoProductoPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Nuevo producto | Inventarios Mahoraga</title>
      </Head>
      <NuevoProducto
        inventarioHref="/inventario"
        onCancel={() => router.push('/inventario')}
        // Tras guardar se muestra el aviso verde y unos segundos después se vuelve
        // al inventario, donde ya aparece el producto nuevo.
        onSaved={() => setTimeout(() => router.push('/inventario'), 1200)}
      />
    </>
  );
}
