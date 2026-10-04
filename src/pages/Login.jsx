import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const correcto = login(correo, contrasena);

    if (!correcto) {
      setError("Correo o contraseña incorrectos.");
      return;
    }

    navigate("/dashboard");
  }

  return (
    <main className="auth-container">
      <section className="auth-card">
        <h1>Bienvenido</h1>
        <p>Inicia sesión en SecureWeb</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="correo">
            Correo electrónico
          </label>

          <input
            id="correo"
            type="email"
            value={correo}
            onChange={(event) => setCorreo(event.target.value)}
            placeholder="tu@correo.com"
            autoComplete="email"
            required
          />

          <label htmlFor="contrasena">
            Contraseña
          </label>

          <input
            id="contrasena"
            type="password"
            value={contrasena}
            onChange={(event) => setContrasena(event.target.value)}
            placeholder="Escribe tu contraseña"
            autoComplete="current-password"
            required
          />

          {error && (
            <p className="error-message">{error}</p>
          )}

          <button type="submit">
            Iniciar sesión
          </button>
        </form>

        <p className="auth-footer">
          ¿No tienes una cuenta?{" "}
          <Link to="/register">Regístrate</Link>
        </p>
      </section>
    </main>
  );
}