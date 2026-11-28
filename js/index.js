const API_URL = "http://localhost:3000/videojuegos";

const contenedorCatalogo = document.getElementById("catalogo-videojuegos");
const contadorJuegos = document.getElementById("contador-juegos");
const inputBuscador = document.getElementById("buscador");
const selectPlataforma = document.getElementById("filtro-plataforma");

let listaVideojuegos = [];

async function cargarCatalogo() {
  try {
    const respuesta = await fetch(API_URL);
    if (!respuesta.ok) {
      throw new Error("Error al consultar los videojuegos");
    }

    listaVideojuegos = await respuesta.json();
    aplicarFiltros();
  } catch (error) {
    contenedorCatalogo.innerHTML = `
      <p class="text-center text-danger my-3">
        No se pudo conectar con el servidor. Verifica que json-server esté encendido en el puerto 3000.
      </p>`;
  }
}

function renderizarTarjetas(juegos) {
  contadorJuegos.textContent = `${juegos.length} juegos`;

  if (juegos.length === 0) {
    contenedorCatalogo.innerHTML = `<p class="text-center opacity-75 my-4">No se encontraron títulos que coincidan con tu búsqueda.</p>`;
    return;
  }

  let htmlTarjetas = `<div class="row g-3">`;

  juegos.forEach((juego) => {
    const titulo = juego.titulo || "Sin título";
    const genero = juego.genero || "Sin género";
    const plataforma = juego.plataforma || "N/A";
    const descripcion = juego.descripcion || "Sin descripción disponible.";
    const imagen = juego.imagen || "https://placehold.co/300x180?text=Sin+Portada";

    const tieneTutorial = juego.tutorial && juego.tutorial.trim() !== "";
    const tieneWiki = juego.wiki && juego.wiki.trim() !== "";

    let htmlEnlaces = "";
    if (tieneTutorial || tieneWiki) {
      htmlEnlaces = `
        <div class="d-flex justify-content-between align-items-center pt-2 border-top border-secondary">
          ${tieneTutorial ? `
            <a href="${juego.tutorial}" 
               target="_blank" 
               rel="noopener noreferrer"
               onclick="event.stopPropagation()"
               class="btn btn-outline-danger btn-sm py-0 px-2"
               style="font-size: 0.75rem;">
              ▶ Tutorial
            </a>` : `<span></span>`}

          ${tieneWiki ? `
            <a href="${juego.wiki}" 
               target="_blank" 
               rel="noopener noreferrer"
               onclick="event.stopPropagation()"
               class="btn btn-outline-info btn-sm py-0 px-2"
               style="font-size: 0.75rem;">
              📖 Wiki
            </a>` : ""}
        </div>
      `;
    }

    htmlTarjetas += `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card h-100 d-flex flex-column justify-content-between p-3"
             style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(56, 189, 248, 0.3); cursor: pointer;"
             onclick="verDetalle('${juego.id}')">
          
          <div>
            <img 
              src="${imagen}" 
              alt="${titulo}" 
              class="w-100 rounded mb-3" 
              style="height: 160px; object-fit: cover;"
              onerror="this.src='https://placehold.co/300x180?text=Error+Imagen'"
            >
            
            <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
              <h5 class="m-0 fw-bold text-white">${titulo}</h5>
              <span class="badge bg-info text-dark">${plataforma}</span>
            </div>
            
            <p class="small text-info mb-2"><strong>Género:</strong> ${genero}</p>
            <p class="small text-light opacity-75 mb-3">${descripcion}</p>
          </div>

          ${htmlEnlaces}

        </div>
      </div>
    `;
  });

  htmlTarjetas += `</div>`;
  contenedorCatalogo.innerHTML = htmlTarjetas;
}

function aplicarFiltros() {
  const texto = inputBuscador.value.trim().toLowerCase();
  const plataformaSeleccionada = selectPlataforma.value;

  const filtrados = listaVideojuegos.filter((juego) => {
    const coincideTexto =
      (juego.titulo || "").toLowerCase().includes(texto) ||
      (juego.genero || "").toLowerCase().includes(texto);

    const coincidePlataforma =
      plataformaSeleccionada === "" || juego.plataforma === plataformaSeleccionada;

    return coincideTexto && coincidePlataforma;
  });

  renderizarTarjetas(filtrados);
}

function verDetalle(id) {
  const juego = listaVideojuegos.find((item) => String(item.id) === String(id));
  if (!juego) return;

  Swal.fire({
    title: juego.titulo,
    html: `
      <img src="${juego.imagen}" alt="${juego.titulo}" class="w-100 rounded mb-3" style="max-height: 220px; object-fit: cover;" onerror="this.src='https://placehold.co/300x180?text=Sin+Portada'">
      <p class="mb-1"><strong>Plataforma:</strong> ${juego.plataforma}</p>
      <p class="mb-3"><strong>Género:</strong> ${juego.genero}</p>
      <p class="text-start small">${juego.descripcion}</p>
    `,
    background: "#0f172a",
    color: "#f8fafc",
    confirmButtonText: "Cerrar",
    confirmButtonColor: "#0ea5e9"
  });
}

inputBuscador.addEventListener("input", aplicarFiltros);
selectPlataforma.addEventListener("change", aplicarFiltros);

cargarCatalogo();