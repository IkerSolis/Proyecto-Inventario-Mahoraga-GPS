// En Next.js (pages router) el CSS global solo se puede importar aquí.
import '../styles/globals.css';
import '../styles/nuevo_producto.css';

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
