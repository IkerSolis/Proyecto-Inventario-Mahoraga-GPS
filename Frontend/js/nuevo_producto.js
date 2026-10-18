// Lógica del formulario "Nuevo producto" (versión HTML estática).
// Hace lo mismo que components/nuevo_producto.jsx: valida, manda el producto a
// POST {API_URL}/api/products y muestra el resultado.
(function () {
  const API_URL = (window.MAHORAGA_API_URL || '').replace(/\/$/, '');
  const IMAGEN_MAX_BYTES = 5 * 1024 * 1024; // 5MB
  const IMAGEN_TIPOS = ['image/png', 'image/jpeg', 'image/jpg'];

  const form = document.getElementById('np-form');
  const aviso = document.getElementById('np-alert');
  const botonGuardar = document.getElementById('np-guardar');
  const botonCancelar = document.getElementById('np-cancelar');
  const botonAtras = document.querySelector('.np-back-btn');
  const inputImagen = document.getElementById('imagen');
  const textoImagen = document.getElementById('file-prompt');
  const TEXTO_IMAGEN_INICIAL = textoImagen.textContent;

  const campos = {
    nombre: document.getElementById('nombre'),
    descripcion: document.getElementById('descripcion'),
    categoria: document.getElementById('categoria'),
    estadoInicial: document.getElementById('estadoInicial'),
    precioVenta: document.getElementById('precioVenta'),
    cantidadDisponible: document.getElementById('cantidadDisponible'),
    stockMinimo: document.getElementById('stockMinimo'),
    estado: document.getElementById('estado'),
  };

  const valoresIniciales = {
    categoria: campos.categoria.value,
    estadoInicial: campos.estadoInicial.value,
  };

  // ---------- utilidades ----------
  const aNumero = (valor) => Number(String(valor).replace(/[$,\s]/g, ''));

  function calcularEstadoVisual() {
    const stock = aNumero(campos.cantidadDisponible.value || 0);
    const minimo = aNumero(campos.stockMinimo.value || 0);
    if (!Number.isFinite(stock) || stock <= 0) return 'Agotado';
    if (Number.isFinite(minimo) && stock < minimo) return 'Stock bajo';
    return 'Disponible';
  }

  function actualizarEstado() {
    campos.estado.value = calcularEstadoVisual();
  }

  function mostrarAviso(tipo, texto) {
    aviso.textContent = texto;
    aviso.className = 'np-alert np-alert--' + tipo;
    aviso.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
    aviso.hidden = false;
  }

  function ocultarAviso() {
    aviso.hidden = true;
  }

  function limpiarError(nombre) {
    const input = campos[nombre] || inputImagen;
    input.classList.remove('np-input--error');
    const campo = input.closest('.np-field');
    const texto = campo && campo.querySelector('.np-error-text');
    if (texto) texto.remove();
  }

  function marcarError(nombre, mensaje) {
    const input = nombre === 'imagen' ? inputImagen : campos[nombre];
    if (nombre !== 'imagen') input.classList.add('np-input--error');
    const campo = input.closest('.np-field');
    if (campo && !campo.querySelector('.np-error-text')) {
      const texto = document.createElement('span');
      texto.className = 'np-error-text';
      texto.textContent = mensaje;
      campo.appendChild(texto);
    }
  }

  function limpiarTodosLosErrores() {
    Object.keys(campos).forEach(limpiarError);
    limpiarError('imagen');
  }

  function leerArchivoComoDataUrl(archivo) {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.onload = () => resolve(lector.result);
      lector.onerror = () => reject(new Error('No se pudo leer la imagen'));
      lector.readAsDataURL(archivo);
    });
  }

  function validar() {
    limpiarTodosLosErrores();
    let valido = true;
    const falla = (campo, mensaje) => {
      marcarError(campo, mensaje);
      valido = false;
    };

    if (!campos.nombre.value.trim()) falla('nombre', 'El nombre es obligatorio');
    if (!campos.categoria.value.trim()) falla('categoria', 'La categoría es obligatoria');

    const precio = aNumero(campos.precioVenta.value);
    if (campos.precioVenta.value.trim() === '' || !Number.isFinite(precio) || precio < 0) {
      falla('precioVenta', 'Ingresa un precio válido (ej. 199.90)');
    }

    const cantidad = aNumero(campos.cantidadDisponible.value);
    if (campos.cantidadDisponible.value.trim() !== '' && (!Number.isInteger(cantidad) || cantidad < 0)) {
      falla('cantidadDisponible', 'Debe ser un entero mayor o igual a 0');
    }

    const minimo = aNumero(campos.stockMinimo.value);
    if (campos.stockMinimo.value.trim() !== '' && (!Number.isInteger(minimo) || minimo < 0)) {
      falla('stockMinimo', 'Debe ser un entero mayor o igual a 0');
    }

    const archivo = inputImagen.files && inputImagen.files[0];
    if (archivo && !IMAGEN_TIPOS.includes(archivo.type)) {
      falla('imagen', 'La imagen debe ser PNG o JPG');
    } else if (archivo && archivo.size > IMAGEN_MAX_BYTES) {
      falla('imagen', 'La imagen no debe pesar más de 5MB');
    }

    return valido;
  }

  function reiniciarFormulario() {
    form.reset();
    campos.categoria.value = valoresIniciales.categoria;
    campos.estadoInicial.value = valoresIniciales.estadoInicial;
    textoImagen.textContent = TEXTO_IMAGEN_INICIAL;
    actualizarEstado();
  }

  function salir() {
    window.history.back();
  }

  // ---------- eventos ----------
  Object.keys(campos).forEach((nombre) => {
    campos[nombre].addEventListener('input', () => {
      limpiarError(nombre);
      ocultarAviso();
    });
  });
  campos.cantidadDisponible.addEventListener('input', actualizarEstado);
  campos.stockMinimo.addEventListener('input', actualizarEstado);

  inputImagen.addEventListener('change', () => {
    limpiarError('imagen');
    const archivo = inputImagen.files && inputImagen.files[0];
    textoImagen.textContent = archivo ? archivo.name : TEXTO_IMAGEN_INICIAL;
  });

  botonCancelar.addEventListener('click', salir);
  if (botonAtras) botonAtras.addEventListener('click', salir);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (botonGuardar.disabled) return;
    ocultarAviso();

    if (!validar()) {
      mostrarAviso('error', 'Revisa los campos marcados antes de guardar.');
      return;
    }

    botonGuardar.disabled = true;
    botonCancelar.disabled = true;
    botonGuardar.textContent = 'Guardando...';

    try {
      const archivo = inputImagen.files && inputImagen.files[0];
      const payload = {
        nombre: campos.nombre.value.trim(),
        descripcion: campos.descripcion.value.trim(),
        categoria: campos.categoria.value.trim(),
        estado_inicial: campos.estadoInicial.value.trim(),
        precio_venta: aNumero(campos.precioVenta.value),
        stock: campos.cantidadDisponible.value.trim() === '' ? 0 : aNumero(campos.cantidadDisponible.value),
        stock_minimo: campos.stockMinimo.value.trim() === '' ? 0 : aNumero(campos.stockMinimo.value),
        imagen: archivo ? await leerArchivoComoDataUrl(archivo) : null,
      };

      const res = await fetch(API_URL + '/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await res.json();
      } catch (_) {
        /* la respuesta no era JSON */
      }

      if (!res.ok) {
        throw new Error(data.error || 'Error ' + res.status + ' al guardar el producto');
      }

      mostrarAviso('ok', 'Producto "' + data.nombre + '" guardado correctamente.');
      reiniciarFormulario();
    } catch (error) {
      const sinConexion = error instanceof TypeError;
      mostrarAviso(
        'error',
        sinConexion
          ? 'No se pudo conectar con el servidor (' + (API_URL || 'mismo origen') + '). Verifica que el backend esté corriendo.'
          : error.message
      );
    } finally {
      botonGuardar.disabled = false;
      botonCancelar.disabled = false;
      botonGuardar.textContent = 'Guardar';
    }
  });

  actualizarEstado();
})();
