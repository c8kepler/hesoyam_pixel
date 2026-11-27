let API_URL = "http://localhost:3000/videojuegos";

let videojuegosCache = [];
let iniciandoPanel = false;

const btnModoJuego = document.getElementById("btn-modo-juego");
const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");
const btnStart = document.getElementById("btn-start");
const panel = document.getElementById("panel");
const bigScreen = document.getElementById("big");
const msgStatus = document.getElementById("msg");
const msgForm = document.getElementById("fmsg");

const form = document.getElementById("form-videojuego");
const inputId = document.getElementById("juego-id");
const inputTitulo = document.getElementById("titulo");
const inputGenero = document.getElementById("genero");
const inputPlataforma = document.getElementById("plataforma");
const inputImagen = document.getElementById("imagen");
const inputDescripcion = document.getElementById("descripcion");

const tituloForm = document.getElementById("titulo-formulario");
const btnGuardar = document.getElementById("btn-guardar");
const btnCancelar = document.getElementById("btn-cancelar");
const tablaVideojuegos = document.getElementById("tabla-videojuegos");
const contadorJuegos = document.getElementById("contador-juegos");

// --- CAMBIO ENTRE JUEGO RETRO Y JUEGO MODERNO ---
function aplicarModoJuego(modo) {
  const esModerno = modo === "moderno";
  document.documentElement.setAttribute("data-theme", esModerno ? "dark" : "light");
  localStorage.setItem("modoJuego", esModerno ? "moderno" : "retro");
  btnModoJuego.textContent = esModerno ? "Modo: Juego Moderno" : "Modo: Juego Retro";
}

const modoGuardado = localStorage.getItem("modoJuego") || "retro";
aplicarModoJuego(modoGuardado);

btnModoJuego.addEventListener("click", () => {
  const actual = localStorage.getItem("modoJuego") === "moderno" ? "moderno" : "retro";
  aplicarModoJuego(actual === "retro" ? "moderno" : "retro");
});

// --- SESIÓN ---
btnCerrarSesion.addEventListener("click", () => {
  localStorage.removeItem("sesionActiva");
  location.href = "login.html?salio=1";
});

// --- UTILIDADES ---
function escaparTexto(texto) {
  const div = document.createElement("div");
  div.textContent = texto || "";
  return div.innerHTML;
}

function mostrarMensaje(elemento, texto, tipo) {
  elemento.textContent = texto;
  elemento.className = "msg" + (tipo ? " " + tipo : "");
}

function limpiarFormulario() {
  form.reset();
  inputId.value = "";
  tituloForm.textContent = "Nuevo videojuego";
  btnGuardar.textContent = "Crear juego";
  btnCancelar.hidden = true;
}

btnCancelar.addEventListener("click", () => {
  limpiarFormulario();
  mostrarMensaje(msgForm, "Edición cancelada. No se modificó ningún juego.", "");
});

// --- LISTAR VIDEOJUEGOS (GET) ---
async function cargarVideojuegos() {
  try {
    const respuesta = await fetch(API_URL);
    if (!respuesta.ok) {
      throw new Error("Error al consultar la API");
    }

    const juegos = await respuesta.json();
    videojuegosCache = juegos;
    contadorJuegos.textContent = `${juegos.length} ${juegos.length === 1 ? "juego" : "juegos"}`;

    if (!juegos.length) {
      tablaVideojuegos.innerHTML = '<p class="msg">No hay videojuegos registrados todavía. Crea el primero arriba.</p>';
      return;
    }

    tablaVideojuegos.innerHTML = juegos
      .map((juego) => {
        const portada = juego.imagen
          ? `<img src="${escaparTexto(juego.imagen)}" alt="${escaparTexto(juego.titulo)}" class="w-16 h-12 object-cover rounded">`
          : "";

        return `
          <div class="item">
            <div class="flex items-center gap-3">
              ${portada}
              <div>
                <b>${escaparTexto(juego.titulo)}</b><br>
                <small>${escaparTexto(juego.genero)} · ${escaparTexto(juego.plataforma)}</small>
              </div>
            </div>
            <div class="row">
              <button class="btn sm" type="button" data-editar="${escaparTexto(juego.id)}">Editar</button>
              <button class="btn sm" type="button" data-eliminar="${escaparTexto(juego.id)}">Eliminar</button>
            </div>
          </div>
        `;
      })
      .join("");
  } catch (error) {
    tablaVideojuegos.innerHTML =
      '<p class="msg err">No se pudo cargar la lista de videojuegos. Revisa la conexión con el servidor.</p>';
  }
}

// --- BOTÓN START ---
btnStart.addEventListener("click", () => {
  if (iniciandoPanel) return;
  iniciandoPanel = true;
  btnStart.disabled = true;

  mostrarMensaje(msgStatus, "Iniciando… el panel de gestión se abrirá en unos segundos.", "");
  const pasos = ["3", "2", "1", "GO!"];

  pasos.forEach((paso, indice) => {
    setTimeout(() => {
      bigScreen.textContent = paso;
    }, indice * 700);
  });

  setTimeout(() => {
    panel.hidden = false;
    bigScreen.textContent = "PLAYER 1";
    btnStart.textContent = "✔ Panel abierto";
    mostrarMensaje(msgStatus, "Panel listo: crea, edita o elimina videojuegos del catálogo.", "ok");
    cargarVideojuegos();
  }, 2800);
});

// --- CREAR / EDITAR VIDEOJUEGO (POST / PUT) ---
form.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const datos = {
    titulo: inputTitulo.value.trim(),
    genero: inputGenero.value.trim(),
    plataforma: inputPlataforma.value.trim(),
    imagen: inputImagen.value.trim(),
    descripcion: inputDescripcion.value.trim()
  };

  const faltantes = [];
  if (!datos.titulo) faltantes.push("el título");
  if (!datos.genero) faltantes.push("el género");
  if (!datos.plataforma) faltantes.push("la plataforma");
  if (!datos.descripcion) faltantes.push("la descripción");

  if (faltantes.length > 0) {
    const textoFaltante = `Falta completar: ${faltantes.join(", ")}.`;
    mostrarMensaje(msgForm, textoFaltante, "err");
    Swal.fire("Campos incompletos", textoFaltante, "warning");
    return;
  }

  if (datos.imagen && !/^https?:\/\//.test(datos.imagen)) {
    const errorUrl = "El enlace de la imagen debe empezar con http:// o https://.";
    mostrarMensaje(msgForm, errorUrl, "err");
    Swal.fire("URL no válida", errorUrl, "warning");
    return;
  }

  if (!datos.imagen) {
    datos.imagen = "https://placehold.co/300x200?text=Hesoyam+Pixel";
  }

  const idEdicion = inputId.value;
  btnGuardar.disabled = true;
  mostrarMensaje(msgForm, `Guardando «${datos.titulo}»…`, "");

  try {
    const url = idEdicion ? `${API_URL}/${idEdicion}` : API_URL;
    const metodo = idEdicion ? "PUT" : "POST";

    const respuesta = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    if (!respuesta.ok) {
      throw new Error("Error al guardar");
    }

    const accionTexto = idEdicion ? "actualizado" : "creado";
    limpiarFormulario();
    mostrarMensaje(
      msgForm,
      `Videojuego «${datos.titulo}» ${accionTexto} correctamente. Recarga el catálogo público para ver el cambio.`,
      "ok"
    );
    Swal.fire("¡Listo!", `Videojuego «${datos.titulo}» ${accionTexto}.`, "success");
    await cargarVideojuegos();
  } catch (error) {
    const errorGuardar = `No se pudo guardar «${datos.titulo}». Verifica que la API esté disponible.`;
    mostrarMensaje(msgForm, errorGuardar, "err");
    Swal.fire("Error al guardar", errorGuardar, "error");
  } finally {
    btnGuardar.disabled = false;
  }
});

// --- EDITAR Y ELIMINAR DESDE LA LISTA ---
tablaVideojuegos.addEventListener("click", async (evento) => {
  const boton = evento.target.closest("button");
  if (!boton) return;

  const idEditar = boton.dataset.editar;
  const idEliminar = boton.dataset.eliminar;

  if (idEditar) {
    const juego = videojuegosCache.find((item) => String(item.id) === String(idEditar));
    if (!juego) return;

    inputId.value = juego.id;
    inputTitulo.value = juego.titulo || "";
    inputGenero.value = juego.genero || "";
    inputPlataforma.value = juego.plataforma || "";
    inputImagen.value = juego.imagen || "";
    inputDescripcion.value = juego.descripcion || "";

    tituloForm.textContent = `Editando: ${juego.titulo}`;
    btnGuardar.textContent = "Guardar cambios";
    btnCancelar.hidden = false;
    mostrarMensaje(msgForm, `Editando «${juego.titulo}». Modifica los campos y guarda.`, "");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (idEliminar) {
    const juego = videojuegosCache.find((item) => String(item.id) === String(idEliminar));
    if (!juego) return;

    const confirmacion = await Swal.fire({
      title: `¿Eliminar «${juego.titulo}»?`,
      text: "Se quitará del catálogo y dejará de mostrarse al recargar la página pública.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const respuesta = await fetch(`${API_URL}/${juego.id}`, {
        method: "DELETE"
      });

      if (!respuesta.ok) {
        throw new Error("Error al eliminar");
      }

      if (inputId.value === String(juego.id)) {
        limpiarFormulario();
      }

      mostrarMensaje(msgForm, `Videojuego «${juego.titulo}» eliminado del catálogo.`, "ok");
      Swal.fire("Eliminado", `«${juego.titulo}» fue eliminado correctamente.`, "success");
      await cargarVideojuegos();
    } catch (error) {
      const errorEliminar = `No se pudo eliminar «${juego.titulo}». Intenta de nuevo.`;
      mostrarMensaje(msgForm, errorEliminar, "err");
      Swal.fire("Error", errorEliminar, "error");
    }
  }
});
