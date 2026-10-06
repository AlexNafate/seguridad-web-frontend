import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Dashboard() {
  const { usuario, token, obtenerPerfil, logout } = useAuth();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const [estadisticas, setEstadisticas] = useState({ total: 0, admins: 0, usuariosRegulares: 0 });
  const [usuariosLista, setUsuariosLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [copiado, setCopiado] = useState(false);

  // Estados para Modal de Edición (Admin)
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formNombre, setFormNombre] = useState("");
  const [formCorreo, setFormCorreo] = useState("");
  const [formRol, setFormRol] = useState("usuario");
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  // Cargar datos del dashboard
  async function cargarDatos() {
    const resPerfil = await obtenerPerfil();

    if (!resPerfil.success) {
      setError(resPerfil.message);
      setCargando(false);

      if (
        resPerfil.message &&
        (resPerfil.message.includes("token") || resPerfil.message.includes("Token"))
      ) {
        logout();
        navigate("/login");
      }
      return;
    }

    setPerfil(resPerfil.usuario);

    try {
      const tokenGuardado = localStorage.getItem("token");
      const resStats = await fetch(API_URL + "/api/auth/dashboard-data", {
        headers: {
          Authorization: "Bearer " + tokenGuardado,
        },
      });

      if (resStats.ok) {
        const data = await resStats.json();
        if (data.success) {
          setEstadisticas(data.estadisticas || { total: 0, admins: 0, usuariosRegulares: 0 });
          setUsuariosLista(data.usuarios || []);
          if (data.usuarioActual && data.usuarioActual.rol) {
            setPerfil(function (prev) {
              return Object.assign({}, prev, { rol: data.usuarioActual.rol });
            });
          }
        }
      }
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleCopiarToken() {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopiado(true);
      setTimeout(function () {
        setCopiado(false);
      }, 2000);
    }
  }

  // ABRIR MODAL EDITAR
  function abrirModalEditar(u) {
    setUsuarioEditando(u);
    setFormNombre(u.nombre);
    setFormCorreo(u.correo);
    setFormRol(u.rol || "usuario");
  }

  function cerrarModalEditar() {
    setUsuarioEditando(null);
  }

  // GUARDAR EDICIÓN (ADMIN)
  async function handleGuardarEdicion(e) {
    e.preventDefault();
    if (!usuarioEditando) return;

    setGuardandoEdicion(true);
    setError("");

    try {
      const tokenGuardado = localStorage.getItem("token");
      const respuesta = await fetch(API_URL + "/api/auth/usuarios/" + usuarioEditando.id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + tokenGuardado,
        },
        body: JSON.stringify({
          nombre: formNombre,
          correo: formCorreo,
          rol: formRol,
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        setError(resultado.message || "Error al actualizar usuario.");
        return;
      }

      setMensajeExito("Usuario #" + usuarioEditando.id + " actualizado con éxito.");
      setTimeout(function () {
        setMensajeExito("");
      }, 3500);

      cerrarModalEditar();
      await cargarDatos();
    } catch (err) {
      console.error("Error al editar:", err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setGuardandoEdicion(false);
    }
  }

  // ELIMINAR USUARIO (ADMIN)
  async function handleEliminarUsuario(u) {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar permanentemente a \"" + u.nombre + "\" (" + u.correo + ")?"
    );
    if (!confirmar) return;

    setError("");

    try {
      const tokenGuardado = localStorage.getItem("token");
      const respuesta = await fetch(API_URL + "/api/auth/usuarios/" + u.id, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + tokenGuardado,
        },
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        setError(resultado.message || "Error al eliminar usuario.");
        return;
      }

      setMensajeExito("Usuario #" + u.id + " eliminado de MySQL.");
      setTimeout(function () {
        setMensajeExito("");
      }, 3500);

      await cargarDatos();
    } catch (err) {
      console.error("Error al eliminar:", err);
      setError("No se pudo conectar con el servidor.");
    }
  }

  const nombreUsuario = (perfil && perfil.nombre) || (usuario && usuario.nombre) || "Usuario";
  const correoUsuario = (perfil && perfil.correo) || (usuario && usuario.correo) || "usuario@test.com";
  const rolUsuario = (perfil && perfil.rol) || (usuario && usuario.rol) || "usuario";
  const idUsuarioActual = (perfil && perfil.id) || (usuario && usuario.id) || 1;
  const esAdmin = rolUsuario === "admin";
  const inicial = nombreUsuario.charAt(0).toUpperCase();

  if (cargando) {
    return (
      <div className="dash-loading-screen">
        <div className="dash-spinner"></div>
        <p>Cargando panel de control...</p>
      </div>
    );
  }

  return (
    <div className="dash-layout">
      {/* SIDEBAR IZQUIERDO */}
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <div className="dash-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <div className="dash-brand-info">
            <span className="dash-brand-title">SECUREWEB</span>
            <span className="dash-brand-subtitle">Gestión de Seguridad</span>
          </div>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="dash-nav">
          <a href="#dashboard" className="dash-nav-item active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Dashboard</span>
          </a>
          <a href="#usuarios" className="dash-nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Gestión de Usuarios</span>
          </a>
          <a href="#seguridad" className="dash-nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Token de Seguridad</span>
          </a>
        </nav>

        {/* PIE DEL SIDEBAR (PERFIL CON ROL REAL) */}
        <div className="dash-sidebar-footer">
          <div className="dash-user-badge">
            <div className="dash-avatar">{inicial}</div>
            <div className="dash-user-text">
              <span className="dash-user-name">{nombreUsuario}</span>
              <span className={"dash-user-role-badge role-" + rolUsuario}>
                {rolUsuario}
              </span>
            </div>
          </div>
          <button className="dash-logout-btn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL DERECHA */}
      <main className="dash-main">
        {/* ENCABEZADO SUPERIOR */}
        <header className="dash-topbar">
          <div>
            <h1 className="dash-topbar-title">Panel de Control</h1>
            <p className="dash-topbar-subtitle">
              {esAdmin ? "Modo Administrador Activo - Control Total de Usuarios" : "Bienvenido al sistema seguro SecureWeb"}
            </p>
          </div>
          <div className="dash-lock-badge">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
            </svg>
            <span>Conexión Protegida TLS/SSL</span>
          </div>
        </header>

        <div className="dash-body">
          {/* MENSAJES DE ALERTA O ÉXITO */}
          {mensajeExito && (
            <div className="dash-alert success">
              <span>✔ {mensajeExito}</span>
            </div>
          )}

          {error && (
            <div className="dash-alert error">
              <span>⚠ {error}</span>
            </div>
          )}

          {/* SALUDO CON ROL REAL */}
          <section className="dash-welcome">
            <div className="dash-welcome-row">
              <h2>Bienvenido de vuelta, {nombreUsuario}</h2>
              <span className={"welcome-role-tag tag-" + rolUsuario}>
                {esAdmin ? "★ Administrador" : "● Usuario Estándar"}
              </span>
            </div>
          </section>

          {/* TARJETAS DE MÉTRICAS */}
          <section className="dash-metrics-grid">
            <div className="dash-metric-card">
              <div className="dash-metric-icon bg-celeste-light text-celeste">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="dash-metric-details">
                <span className="dash-metric-label">Total Usuarios BD</span>
                <span className="dash-metric-value">{estadisticas.total || usuariosLista.length || 1}</span>
                <span className="dash-metric-badge badge-green">● Sincronizado MySQL</span>
              </div>
            </div>

            <div className="dash-metric-card">
              <div className="dash-metric-icon bg-blue-soft text-blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </div>
              <div className="dash-metric-details">
                <span className="dash-metric-label">Administradores</span>
                <span className="dash-metric-value">{estadisticas.admins || 1}</span>
                <span className="dash-metric-badge badge-celeste">Permisos de edición</span>
              </div>
            </div>

            <div className="dash-metric-card">
              <div className="dash-metric-icon bg-purple-soft text-purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="dash-metric-details">
                <span className="dash-metric-label">Usuarios Estándar</span>
                <span className="dash-metric-value">{estadisticas.usuariosRegulares || 0}</span>
                <span className="dash-metric-badge badge-muted">Cuentas comunes</span>
              </div>
            </div>

            <div className="dash-metric-card highlight-celeste">
              <div className="dash-metric-icon bg-celeste text-white lock-pulse">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  <circle cx="12" cy="16" r="1.5" fill="currentColor"></circle>
                </svg>
              </div>
              <div className="dash-metric-details">
                <span className="dash-metric-label">Candado de Seguridad</span>
                <span className="dash-metric-value">Activo 100%</span>
                <span className="dash-metric-badge badge-celeste">Protegido JWT + Bcrypt</span>
              </div>
            </div>
          </section>

          {/* TABLA: TODOS LOS USUARIOS REALES DESDE MYSQL (CON OPCIONES ADMIN) */}
          <section id="usuarios" className="dash-table-card">
            <div className="dash-table-header-admin">
              <div>
                <h3>Usuarios Registrados en MySQL ({usuariosLista.length})</h3>
                <p className="dash-table-subtitle">
                  {esAdmin
                    ? "Como Administrador puedes editar o eliminar usuarios directamente en MySQL."
                    : "Listado de usuarios registrados en el sistema."}
                </p>
              </div>
              {esAdmin && (
                <div className="admin-status-tag">
                  <span>🛠️ Herramientas de Admin Habilitadas</span>
                </div>
              )}
            </div>

            <div className="dash-table-responsive">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>USUARIO</th>
                    <th>ROL</th>
                    <th>CORREO</th>
                    <th>FECHA REGISTRO</th>
                    <th>ESTADO</th>
                    {esAdmin && <th style={{ textAlign: "center" }}>ACCIONES</th>}
                  </tr>
                </thead>
                <tbody>
                  {usuariosLista.map(function (u) {
                    const uInicial = u.nombre ? u.nombre.charAt(0).toUpperCase() : "U";
                    const uFecha = u.created_at
                      ? new Date(u.created_at).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "numeric",
                          year: "numeric",
                        })
                      : "Hoy";
                    const esMiPropioUsuario = u.id === idUsuarioActual;

                    return (
                      <tr key={u.id}>
                        <td className="table-id">#{u.id}</td>
                        <td className="user-cell">
                          <div className="table-avatar">{uInicial}</div>
                          <div>
                            <span className="table-user-name">{u.nombre}</span>
                            {esMiPropioUsuario && <span className="current-user-tag">(Tú)</span>}
                          </div>
                        </td>
                        <td>
                          <span className={"table-role-pill role-" + (u.rol || "usuario")}>
                            {u.rol === "admin" ? "admin" : "usuario"}
                          </span>
                        </td>
                        <td className="table-email">{u.correo}</td>
                        <td>{uFecha}</td>
                        <td>
                          <span className="table-status-pill status-active">
                            Activo
                          </span>
                        </td>
                        {/* HERRAMIENTAS Y BOTONES EXCLUSIVOS DEL ADMIN */}
                        {esAdmin && (
                          <td className="table-actions-cell">
                            <button
                              type="button"
                              className="btn-action btn-edit"
                              onClick={function () {
                                abrirModalEditar(u);
                              }}
                              title="Editar usuario"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                              <span>Editar</span>
                            </button>

                            <button
                              type="button"
                              className={"btn-action btn-delete" + (esMiPropioUsuario ? " disabled" : "")}
                              onClick={function () {
                                if (!esMiPropioUsuario) handleEliminarUsuario(u);
                              }}
                              disabled={esMiPropioUsuario}
                              title={esMiPropioUsuario ? "No puedes eliminar tu propia cuenta" : "Eliminar usuario"}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                              <span>Eliminar</span>
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECCIÓN ELEGANTE: TOKEN CIFRADO DE SEGURIDAD */}
          <section id="seguridad" className="dash-token-vault-card">
            <div className="token-vault-header">
              <div className="token-vault-title-group">
                <div className="vault-lock-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    <circle cx="12" cy="16" r="1.5" fill="currentColor"></circle>
                  </svg>
                </div>
                <div>
                  <h3>Token Cifrado de Autenticación (JWT)</h3>
                  <p>Cadena criptográfica activa asignada a tu sesión actual</p>
                </div>
              </div>

              <div className="token-status-indicator">
                <span className="pulse-dot"></span>
                <span>Token Activo y Verificado</span>
              </div>
            </div>

            <div className="token-display-box">
              <div className="token-display-topbar">
                <div className="token-tags">
                  <span className="vault-tag">HS256</span>
                  <span className="vault-tag">Rol: {rolUsuario}</span>
                  <span className="vault-tag">60 Min</span>
                </div>
                <button className="copy-cipher-btn" onClick={handleCopiarToken}>
                  {copiado ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      <span>Copiar Token</span>
                    </>
                  )}
                </button>
              </div>

              <div className="token-string-area">
                <p className="token-string-text">
                  {token || "Cargando token de seguridad..."}
                </p>
              </div>
            </div>

            <div className="token-vault-footer">
              <div className="vault-info-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>Firmado con clave secreta del backend</span>
              </div>
              <div className="vault-info-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Sesión válida durante 1 hora</span>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* ===================================================
          MODAL INTERACTIVO PARA EDITAR USUARIO (SOLO ADMIN)
         =================================================== */}
      {usuarioEditando && (
        <div className="dash-modal-overlay">
          <div className="dash-modal-card">
            <div className="dash-modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-edit">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </div>
                <div>
                  <h3>Editar Usuario #{usuarioEditando.id}</h3>
                  <p>Actualizar datos y permisos en la base de datos MySQL</p>
                </div>
              </div>
              <button type="button" className="modal-close-btn" onClick={cerrarModalEditar}>
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarEdicion} className="dash-modal-form">
              <div className="form-group">
                <label htmlFor="edit-nombre">Nombre Completo</label>
                <input
                  id="edit-nombre"
                  type="text"
                  value={formNombre}
                  onChange={function (e) {
                    setFormNombre(e.target.value);
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-correo">Correo Electrónico</label>
                <input
                  id="edit-correo"
                  type="email"
                  value={formCorreo}
                  onChange={function (e) {
                    setFormCorreo(e.target.value);
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-rol">Rol en el Sistema</label>
                <select
                  id="edit-rol"
                  value={formRol}
                  onChange={function (e) {
                    setFormRol(e.target.value);
                  }}
                  className="dash-modal-select"
                >
                  <option value="usuario">usuario (Acceso estándar)</option>
                  <option value="admin">admin (Control total y herramientas)</option>
                </select>
              </div>

              <div className="dash-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={cerrarModalEditar}
                  disabled={guardandoEdicion}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-modal-save"
                  disabled={guardandoEdicion}
                >
                  {guardandoEdicion ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
