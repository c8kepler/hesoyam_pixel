const sesion = localStorage.getItem("sesion");
if (sesion !== "activa") {
    window.location.href = "login.html";
}
