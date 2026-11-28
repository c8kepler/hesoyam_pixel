// js/login.js
const formLogin = document.getElementById("formLogin");
const inputUser = document.getElementById("user");
const inputPassword = document.getElementById("password");
const mensajeError = document.getElementById("mensaje");

if (formLogin) {
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();

    const usuario = inputUser ? inputUser.value.trim() : "";
    const password = inputPassword ? inputPassword.value : "";

    // Credenciales locales sin tocar db.json
    const accesoValido = usuario === "admin" && password === "1234";

    if (!accesoValido) {
      if (mensajeError) {
        mensajeError.textContent = "Usuario o contraseña incorrectos.";
      }
      if (typeof Swal !== "undefined") {
        Swal.fire("Acceso denegado", "Usuario o contraseña incorrectos.", "error");
      }
      return;
    }

    if (mensajeError) {
      mensajeError.textContent = "";
    }

    localStorage.setItem("sesionActiva", "true");
    window.location.href = "./admin.html";
  });
}