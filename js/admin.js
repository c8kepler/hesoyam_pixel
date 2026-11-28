let API_URL = "http://localhost:3000/videojuegos";

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
const tablaBody = document.getElementById("tabla-videojuegos");
const contadorJuegos = document.getElementById("contador-juegos");
const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

btnCerrarSesion.addEventListener("click", () => {
  localStorage.removeItem("sesionActiva");
  window.location.href = "../pages/login.html";
});

async function cargarVideojuegos() {
  try {
    const respuesta = await fetch(API_URL);
    if (!respuesta.ok) {
      throw new Error("Error al consultar los videojuegos");
    }

    const videojuegos = await respuesta.json();
    tablaBody.innerHTML = "";
    contadorJuegos.textContent = `${videojuegos.length} registros`;

    videojuegos.forEach((juego) => {
      tablaBody.innerHTML += `
        <tr class="hover:bg-slate-800/60">
          <td class="py-3 px-4">
            <img src="${juego.imagen}" alt="${juego.titulo}"
              class="w-20 h-12 object-cover rounded bg-slate-800">
          </td>
          <td class="py-3 px-4 font-medium text-white">${juego.titulo}</td>
          <td class="py-3 px-4 text-slate-300">${juego.genero}</td>
          <td class="py-3 px-4">
            <span class="bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-1 rounded text-xs">
              ${juego.plataforma}
            </span>
          </td>
          <td class="py-3 px-4 text-slate-300 max-w-xs truncate">${juego.descripcion}</td>
          <td class="py-3 px-4 text-right space-x-2 whitespace-nowrap">
            <button type="button" onclick="prepararEdicion('${juego.id}')"
              class="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded text-xs font-medium">
              Editar
            </button>
            <button type="button" onclick="eliminarVideojuego('${juego.id}')"
              class="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs font-medium">
              Eliminar
            </button>
          </td>
        </tr>
      `;
    });
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
  const imagen = inputImagen.value.trim() || "https://placehold.co/120x80?text=Sin+Portada";
  const descripcion = inputDescripcion.value.trim();

  if (!titulo || !genero || !plataforma || !descripcion) {
    Swal.fire(
      "Campos incompletos",
      "Completa título, género, plataforma y descripción antes de guardar.",
      "warning"
    );
    return;
  }

  const juegoData = { titulo, genero, plataforma, imagen, descripcion };
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
    inputTitulo.value = juego.titulo;
    inputGenero.value = juego.genero;
    inputPlataforma.value = juego.plataforma;
    inputImagen.value = juego.imagen;
    inputDescripcion.value = juego.descripcion;

    tituloForm.textContent = "Editar Videojuego";
    btnGuardar.textContent = "Actualizar Videojuego";
    btnCancelar.classList.remove("hidden");
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
  tituloForm.textContent = "Registrar Nuevo Videojuego";
  btnGuardar.textContent = "Guardar Videojuego";
  btnCancelar.classList.add("hidden");
}

btnCancelar.addEventListener("click", limpiarFormulario);

cargarVideojuegos();
