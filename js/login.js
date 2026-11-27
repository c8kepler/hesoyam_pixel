
const formulario = document.getElementById("formLogin");

formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    const usuario = document.getElementById("user").value;
    const password = document.getElementById("password").value;

    const mensaje = document.getElementById("mensaje");

    // Validar usuario y contraseña
    if (usuario === "admin" && password === "12345") {

        // Guardar sesión en localStorage
        localStorage.setItem("sesion", "activa");

        window.location.href = "panel.html";

    } else {
        mensaje.textContent = "Usuario o contraseña incorrectos";
    }

});
