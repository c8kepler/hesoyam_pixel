let API_URL = "http://localhost:3000/videojuegos";

const form = document.getElementById("form-videojuego");
const inputId = document.getElementById("juego-id");
const inputTitulo = document.getElementById("titulo");
const inputGenero = document.getElementById("genero");
const inputPlataforma = document.getElementById("plataforma");
const inputImagen = document.getElementById("imagen");
const inputTutorial = document.getElementById("tutorial");
const inputWiki = document.getElementById("wiki");
const inputDescripcion = document.getElementById("descripcion");

const tituloForm = document.getElementById("titulo-formulario");
const btnGuardar = document.getElementById("btn-guardar");
const btnCancelar = document.getElementById("btn-cancelar");
const contenedorJuegos = document.getElementById("tabla-videojuegos");
const contadorJuegos = document.getElementById("contador-juegos");
const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

btnCerrarSesion.addEventListener("click", () => {
  localStorage.removeItem("sesionActiva");
  window.location.href = "../pages/login.html";
});

function obtenerEnlacesJuego(juego) {
  const titulo = juego.titulo || "Videojuego";
  const urlTutorial = juego.tutorial && juego.tutorial.trim() !== ""
    ? juego.tutorial
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(`${titulo} guia tutorial español`)}`;

  const urlWiki = juego.wiki && juego.wiki.trim() !== ""
    ? juego.wiki
    : `https://www.google.com/search?q=${encodeURIComponent(`${titulo} wiki`)}`;

  return { urlTutorial, urlWiki };
}

async function cargarVideojuegos() {
  try {
    const respuesta = await fetch(API_URL);
    if (!respuesta.ok) {
      throw new Error("Error al consultar los videojuegos");
    }

    const videojuegos = await respuesta.json();
    contadorJuegos.textContent = `${videojuegos.length} juegos`;

    if (videojuegos.length === 0) {
      contenedorJuegos.innerHTML = `<p class="text-center opacity-75 my-3">No hay videojuegos registrados aún.</p>`;
      return;
    }

    let htmlTarjetas = `<div class="row g-3">`;

    videojuegos.forEach((juego) => {
      const titulo = juego.titulo || "Sin título";
      const genero = juego.genero || "Sin género";
      const plataforma = juego.plataforma || "N/A";
      const descripcion = juego.descripcion || "Sin descripción disponible.";
      const imagen = juego.imagen || "https://placehold.co/300x180?text=Sin+Portada";
      const { urlTutorial, urlWiki } = obtenerEnlacesJuego(juego);

      htmlTarjetas += `
        <div class="col-12 col-md-6">
          <div class="card h-100 d-flex flex-column justify-content-between p-3" style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(56, 189, 248, 0.3);">
            <div>
              <img 
                src="${imagen}" 
                alt="${titulo}" 
                class="w-100 rounded mb-3" 
                style="height: 150px; object-fit: cover;"
                onerror="this.src='https://placehold.co/300x180?text=Error+Imagen'"
              >
              
              <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                <h5 class="m-0 fw-bold text-white">${titulo}</h5>
                <span class="badge bg-info text-dark">${plataforma}</span>
              </div>
              
              <p class="small text-info mb-2"><strong>Género:</strong> ${genero}</p>
              <p class="small text-light opacity-75 mb-3">${descripcion}</p>
            </div>

            <div>
              <div class="d-flex justify-content-between align-items-center mb-2">
                <a href="${urlTutorial}" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   class="btn btn-outline-danger btn-sm py-0 px-2"
                   style="font-size: 0.75rem;">
                  ▶ Tutorial
                </a>

                <a href="${urlWiki}" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   class="btn btn-outline-info btn-sm py-0 px-2"
                   style="font-size: 0.75rem;">
                  📖 Wiki
                </a>
              </div>

              <div class="d-flex gap-2 pt-2 border-top border-secondary">
                <button type="button" onclick="prepararEdicion('${juego.id}')" class="btn btn-warning btn-sm flex-fill fw-bold">
                  Editar
                </button>
                <button type="button" onclick="eliminarVideojuego('${juego.id}')" class="btn btn-danger btn-sm flex-fill fw-bold">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    htmlTarjetas += `</div>`;
    contenedorJuegos.innerHTML = htmlTarjetas;

  } catch (error) {
    Swal.fire(
      "Error de conexión",
      "No se pudo cargar el catálogo. Revisa la URL de la API.",
      "error"
    );
  }
}

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const titulo = inputTitulo.value.trim();
  const genero = inputGenero.value.trim();
  const plataforma = inputPlataforma.value.trim();
  const imagen = inputImagen.value.trim() || "https://placehold.co/300x180?text=Sin+Portada";
  const tutorial = inputTutorial.value.trim();
  const wiki = inputWiki.value.trim();
  const descripcion = inputDescripcion.value.trim();

  if (!titulo || !genero || !plataforma || !descripcion) {
    Swal.fire(
      "Campos incompletos",
      "Completa título, género, plataforma y descripción antes de guardar.",
      "warning"
    );
    return;
  }

  const juegoData = { titulo, genero, plataforma, imagen, tutorial, wiki, descripcion };
  const idActual = inputId.value;

  try {
    let respuesta;

    if (idActual) {
      respuesta = await fetch(`${API_URL}/${idActual}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(juegoData)
      });
    } else {
      respuesta = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(juegoData)
      });
    }

    if (!respuesta.ok) {
      throw new Error("Error al guardar en la API");
    }

    Swal.fire(
      "¡Guardado!",
      idActual ? "Videojuego actualizado correctamente." : "Videojuego agregado al catálogo.",
      "success"
    );

    limpiarFormulario();
    cargarVideojuegos();
  } catch (error) {
    Swal.fire(
      "Error al guardar",
      "No se pudo guardar el registro. Verifica la conexión con la API.",
      "error"
    );
  }
});

async function prepararEdicion(id) {
  try {
    const respuesta = await fetch(`${API_URL}/${id}`);
    if (!respuesta.ok) {
      throw new Error("No se encontró el videojuego");
    }

    const juego = await respuesta.json();
    inputId.value = juego.id;
    inputTitulo.value = juego.titulo || "";
    inputGenero.value = juego.genero || "";
    inputPlataforma.value = juego.plataforma || "";
    inputImagen.value = juego.imagen || "";
    inputTutorial.value = juego.tutorial || "";
    inputWiki.value = juego.wiki || "";
    inputDescripcion.value = juego.descripcion || "";

    tituloForm.textContent = "Editar Videojuego";
    btnGuardar.textContent = "Actualizar Videojuego";
    btnCancelar.classList.remove("d-none");
    
    form.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    Swal.fire("Error", "No se pudieron cargar los datos para editar.", "error");
  }
}

async function eliminarVideojuego(id) {
  const confirmacion = await Swal.fire({
    title: "¿Eliminar videojuego?",
    text: "Se eliminará del catálogo y dejará de mostrarse en la página pública.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#475569",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (!confirmacion.isConfirmed) {
    return;
  }

  try {
    const respuesta = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    if (!respuesta.ok) {
      throw new Error("Error al eliminar el registro");
    }

    Swal.fire("Eliminado", "El videojuego fue eliminado correctamente.", "success");
    cargarVideojuegos();
  } catch (error) {
    Swal.fire("Error", "No se pudo eliminar el registro.", "error");
  }
}

function limpiarFormulario() {
  form.reset();
  inputId.value = "";
  tituloForm.textContent = "Nuevo videojuego";
  btnGuardar.textContent = "Crear juego";
  btnCancelar.classList.add("d-none");
}

btnCancelar.addEventListener("click", limpiarFormulario);

cargarVideojuegos();