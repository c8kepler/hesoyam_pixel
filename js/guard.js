// js/guard.js
(function protegerAdmin() {
  const sesionActiva = localStorage.getItem("sesionActiva") === "true";

  if (!sesionActiva) {
    window.location.replace("./login.html");
  }
})();