import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const usuarioGuardado = localStorage.getItem("usuario");

    if (usuarioGuardado) {
      return JSON.parse(usuarioGuardado);
    }

    return null;
  });

  function register(datos) {
    const usuariosGuardados =
      JSON.parse(localStorage.getItem("usuarios") || "[]");

    const correoExiste = usuariosGuardados.some(
      (usuario) =>
        usuario.correo.toLowerCase() === datos.correo.toLowerCase()
    );

    if (correoExiste) {
      return {
        success: false,
        message: "Este correo ya está registrado.",
      };
    }

    const nuevoUsuario = {
      id: Date.now(),
      nombre: datos.nombre,
      correo: datos.correo,
      contrasena: datos.contrasena,
    };

    usuariosGuardados.push(nuevoUsuario);

    localStorage.setItem(
      "usuarios",
      JSON.stringify(usuariosGuardados)
    );

    return {
      success: true,
      message: "Usuario registrado correctamente.",
    };
  }

  function login(correo, contrasena) {
    const usuariosGuardados =
      JSON.parse(localStorage.getItem("usuarios") || "[]");

    const usuarioEncontrado = usuariosGuardados.find(
      (usuario) =>
        usuario.correo.toLowerCase() === correo.toLowerCase() &&
        usuario.contrasena === contrasena
    );

    if (!usuarioEncontrado) {
      return {
        success: false,
        message: "Correo o contraseña incorrectos.",
      };
    }

    const usuarioSesion = {
      id: usuarioEncontrado.id,
      nombre: usuarioEncontrado.nombre,
      correo: usuarioEncontrado.correo,
    };

    setUsuario(usuarioSesion);

    localStorage.setItem(
      "usuario",
      JSON.stringify(usuarioSesion)
    );

    return {
      success: true,
      message: "Inicio de sesión correcto.",
    };
  }

  function logout() {
    setUsuario(null);
    localStorage.removeItem("usuario");
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        register,
        login,
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