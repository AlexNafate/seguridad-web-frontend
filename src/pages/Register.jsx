import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmacion, setConfirmacion] = useState("");

  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    console.log("FORMULARIO ENVIADO");

    setError("");
    setExito(false);

    if (nombre.trim() === "") {
      setError("Debes escribir tu nombre.");
      return;
    }

    if (correo.trim() === "") {
      setError("Debes escribir tu correo.");
      return;
    }

    if (contrasena.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (contrasena !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const resultado = register({
      nombre: nombre,
      correo: correo,
      contrasena: contrasena,
    });

    console.log("Resultado del registro:", resultado);

    if (!resultado.success) {
      setError(resultado.message);
      return;
    }

    setExito(true);

    setNombre("");
    setCorreo("");
    setContrasena("");
    setConfirmacion("");
  }

  if (exito) {
    return (
      <main className="auth-container">
        <section className="auth-card">

          <h1>¡Registro exitoso!</h1>

          <p>
            Tu cuenta fue registrada correctamente.
          </p>

          <p className="success-message">
            Ya puedes iniciar sesión en SecureWeb.
          </p>

          <button
            type="button"
            onClick={() => navigate("/login")}
          >
            Ir al inicio de sesión
          </button>

        </section>
      </main>
    );
  }

  return (
    <main className="auth-container">
      <section className="auth-card">

        <h1>Crear cuenta</h1>

        <p>
          Regístrate en SecureWeb
        </p>

        <form onSubmit={handleSubmit}>

          <label htmlFor="nombre">
            Nombre completo
          </label>

          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(event) =>
              setNombre(event.target.value)
            }
            placeholder="Tu nombre"
            required
          />

          <label htmlFor="correo">
            Correo electrónico
          </label>

          <input
            id="correo"
            type="email"
            value={correo}
            onChange={(event) =>
              setCorreo(event.target.value)
            }
            placeholder="tu@correo.com"
            required
          />

          <label htmlFor="contrasena">
            Contraseña
          </label>

          <input
            id="contrasena"
            type="password"
            value={contrasena}
            onChange={(event) =>
              setContrasena(event.target.value)
            }
            placeholder="Mínimo 8 caracteres"
            required
          />

          <label htmlFor="confirmacion">
            Confirmar contraseña
          </label>

          <input
            id="confirmacion"
            type="password"
            value={confirmacion}
            onChange={(event) =>
              setConfirmacion(event.target.value)
            }
            placeholder="Repite tu contraseña"
            required
          />

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          <button type="submit">
            Crear cuenta
          </button>

        </form>

        <p className="auth-footer">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login">
            Inicia sesión
          </Link>
        </p>

      </section>
    </main>
  );
}