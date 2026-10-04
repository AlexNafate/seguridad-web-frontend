import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <main className="dashboard-container">
      <header className="dashboard-header">
        <h1>SecureWeb</h1>
        <button onClick={handleLogout}>
          Cerrar sesión
        </button>
      </header>

      <section className="dashboard-content">
        <h2>
          ¡Bienvenido{user?.nombre ? `, ${user.nombre}` : ""}!
        </h2>

        <p>Has accedido al panel principal de SecureWeb.</p>

        <div className="dashboard-card">
          <h3>Estado de la cuenta</h3>
          <p>Sesión iniciada en esta demostración.</p>
          <p>
            <strong>Correo:</strong> {user?.correo}
          </p>
        </div>

        <div className="dashboard-card">
          <h3>Seguridad</h3>
          <p>
            Próximamente conectaremos este panel con el backend,
            la base de datos y la autenticación segura.
          </p>
        </div>
      </section>
    </main>
  );
}