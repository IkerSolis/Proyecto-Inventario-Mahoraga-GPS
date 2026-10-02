import React, { useState } from 'react';
import '../css/nuevo_producto.css';

export const NuevoProducto = () => {
  // Estado básico de los campos visuales
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'Ferretería y Herramientas',
    estadoInicial: 'Disponible',
    precioVenta: '',
    cantidadDisponible: '',
    stockMinimo: '',
    estado: 'Disponible',
    imagen: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, imagen: e.target.files[0] }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos del producto:', formData);
  };

  return (
    <div className="np-layout">
      {/* ================= SIDEBAR (IZQUIERDA) ================= */}
      <aside className="np-sidebar">
        <div className="np-sidebar-top">
          {/* Logo y Branding */}
          <div className="np-brand">
            <div className="np-brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3">
                <rect x="3" y="3" width="18" height="18" rx="4" />
              </svg>
            </div>
            <div className="np-brand-text">
              <span className="np-brand-name">GestiónInv</span>
              <span className="np-brand-sub">Control Profesional</span>
            </div>
          </div>

          {/* Menú de Navegación */}
          <nav className="np-nav">
            <a href="#inicio" className="np-nav-item">
              <span className="np-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </span>
              <span>Inicio</span>
            </a>

            <a href="#inventario" className="np-nav-item np-nav-item--active">
              <span className="np-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="21 8 21 21 3 21 3 8"/>
                  <rect x="1" y="3" width="22" height="5"/>
                  <line x1="10" y1="12" x2="14" y2="12"/>
                </svg>
              </span>
              <span>Inventario</span>
            </a>

            <a href="#servicios" className="np-nav-item">
              <span className="np-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </span>
              <span>Servicios</span>
            </a>

            <a href="#usuarios" className="np-nav-item">
              <span className="np-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </span>
              <span>Usuarios</span>
            </a>

            <a href="#personalizacion" className="np-nav-item">
              <span className="np-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </span>
              <span>Personalización</span>
            </a>
          </nav>
        </div>

        {/* Footer del Sidebar con Carlos Ruiz */}
        <div className="np-sidebar-footer">
          <div className="np-user-card">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80"
              alt="Carlos Ruiz"
              className="np-user-avatar"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="np-user-info">
              <span className="np-user-name">Carlos Ruiz</span>
              <span className="np-user-role">Administrador</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= CONTENEDOR PRINCIPAL ================= */}
      <div className="np-main">
        {/* Header Superior */}
        <header className="np-header">
          <div className="np-breadcrumb">
            <span>Inventario</span>
            <span>/</span>
            <span className="np-breadcrumb-current">Nuevo producto</span>
          </div>

          <div className="np-header-right">
            <div className="np-search-box">
              <span className="np-search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                type="search"
                placeholder="Buscar productos..."
                className="np-search-input"
              />
            </div>

            <button type="button" className="np-icon-btn" aria-label="Notificaciones">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>

            <div className="np-business-badge">
              <span className="np-business-name">Comercial del Valle</span>
              <span className="np-business-status">
                <span className="np-status-dot" />
                Sincronizado
              </span>
            </div>
          </div>
        </header>

        {/* Área del Contenido */}
        <main className="np-content">
          {/* Encabezado con Botón Flecha */}
          <div className="np-page-header">
            <button type="button" className="np-back-btn" aria-label="Atrás">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>

            <div>
              <h1 className="np-page-title">Nuevo Producto</h1>
              <p className="np-page-subtitle">
                Completa la información detallada para registrar el nuevo artículo en el catálogo.
              </p>
            </div>
          </div>

          {/* Tarjeta Card Blanca */}
          <div className="np-card">
            <form onSubmit={handleSubmit} className="np-form">
              <div className="np-form-grid">
                {/* Columna Izquierda */}
                <div className="np-col">
                  <div className="np-field">
                    <label htmlFor="nombre" className="np-label">Nombre del producto</label>
                    <input
                      id="nombre"
                      name="nombre"
                      type="text"
                      className="np-input"
                      placeholder="Ej. Taladro Percutor Inalámbrico 20V"
                      value={formData.nombre}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="np-field">
                    <label htmlFor="descripcion" className="np-label">Descripción</label>
                    <textarea
                      id="descripcion"
                      name="descripcion"
                      rows={5}
                      className="np-textarea"
                      placeholder="Describe brevemente las características físicas, marca o especificaciones del producto..."
                      value={formData.descripcion}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="np-row-2">
                    <div className="np-field">
                      <label htmlFor="categoria" className="np-label">Categoría</label>
                      <input
                        id="categoria"
                        name="categoria"
                        type="text"
                        className="np-input"
                        value={formData.categoria}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="np-field">
                      <label htmlFor="estadoInicial" className="np-label">Estado inicial</label>
                      <input
                        id="estadoInicial"
                        name="estadoInicial"
                        type="text"
                        className="np-input"
                        value={formData.estadoInicial}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Columna Derecha */}
                <div className="np-col">
                  <div className="np-row-2">
                    <div className="np-field">
                      <label htmlFor="precioVenta" className="np-label">Precio de venta ($)</label>
                      <input
                        id="precioVenta"
                        name="precioVenta"
                        type="text"
                        className="np-input"
                        placeholder="0.00"
                        value={formData.precioVenta}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="np-field">
                      <label htmlFor="cantidadDisponible" className="np-label">Cantidad disponible</label>
                      <input
                        id="cantidadDisponible"
                        name="cantidadDisponible"
                        type="text"
                        className="np-input"
                        placeholder="0"
                        value={formData.cantidadDisponible}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="np-row-2">
                    <div className="np-field">
                      <label htmlFor="stockMinimo" className="np-label">Stock mínimo</label>
                      <input
                        id="stockMinimo"
                        name="stockMinimo"
                        type="text"
                        className="np-input"
                        placeholder="Ej. 10"
                        value={formData.stockMinimo}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="np-field">
                      <label htmlFor="estado" className="np-label">Estado</label>
                      <input
                        id="estado"
                        name="estado"
                        type="text"
                        className="np-input"
                        readOnly
                        value={formData.estado}
                      />
                    </div>
                  </div>

                  {/* Imagen del producto (Drag & Drop) */}
                  <div className="np-field">
                    <label className="np-label">Imagen del producto</label>
                    <label className="np-dropzone">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        className="np-file-input"
                        onChange={handleFileChange}
                      />
                      <div className="np-dropzone-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                      <p className="np-dropzone-prompt">
                        {formData.imagen ? formData.imagen.name : 'Haz clic para subir o arrastra la foto'}
                      </p>
                      <p className="np-dropzone-hint">Formatos recomendados: PNG, JPG (Max. 5MB)</p>
                    </label>
                  </div>
                </div>
              </div>

              {/* Botones Cancelar y Guardar */}
              <div className="np-actions">
                <button type="button" className="np-btn np-btn-cancelar">
                  Cancelar
                </button>
                <button type="submit" className="np-btn np-btn-guardar">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NuevoProducto;
