import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

// En local usa http://localhost:3000. En AWS toma la variable VITE_API_URL de .env
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      try {
        return JSON.parse(usuarioGuardado);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  // ================================
  // REGISTRO
  // ================================
  async function register(datos) {
    try {
      const respuesta = await fetch(API_URL + "/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        return {
          success: false,
          message: resultado.message || "Error al registrar usuario.",
        };
      }

      return {
        success: true,
        message: resultado.message,
        usuario: resultado.usuario,
      };
    } catch (error) {
      console.error("Error de conexión con el backend:", error);
      return {
        success: false,
        message: "No se pudo conectar con el servidor.",
      };
    }
  }

  // ================================
  // LOGIN
  // ================================
  async function login(correo, contrasena) {
    try {
      const respuesta = await fetch(API_URL + "/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo,
          contrasena,
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        return {
          success: false,
          message: resultado.message || "Correo o contraseña incorrectos.",
        };
      }

      // Guardar usuario y JWT
      setUsuario(resultado.usuario);
      localStorage.setItem("usuario", JSON.stringify(resultado.usuario));

      setToken(resultado.token);
      localStorage.setItem("token", resultado.token);

      return {
        success: true,
        message: resultado.message,
        usuario: resultado.usuario,
        token: resultado.token,
      };
    } catch (error) {
      console.error("Error de conexión con el backend:", error);
      return {
        success: false,
        message: "No se pudo conectar con el servidor.",
      };
    }
  }

  // ================================
  // OBTENER PERFIL PROTEGIDO
  // ================================
  async function obtenerPerfil() {
    try {
      const tokenGuardado = localStorage.getItem("token");

      if (!tokenGuardado) {
        return {
          success: false,
          message: "No hay token de autenticación.",
        };
      }

      const respuesta = await fetch(API_URL + "/api/auth/perfil", {
        method: "GET",
        headers: {
          Authorization: "Bearer " + tokenGuardado,
        },
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        return {
          success: false,
          message: resultado.message || "No se pudo obtener el perfil.",
        };
      }

      return {
        success: true,
        usuario: resultado.usuario,
      };
    } catch (error) {
      console.error("Error al obtener el perfil:", error);
      return {
        success: false,
        message: "No se pudo conectar con el servidor.",
      };
    }
  }

  // ================================
  // CERRAR SESIÓN
  // ================================
  function logout() {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        register,
        login,
        obtenerPerfil,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
