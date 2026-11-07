console.log("[GCO-SYSTEM v1.0 ONLINE]");

let gco_registros = [];
let gco_categorias = [];
let gco_resumen = {};
let gco_configuracion = {};

const gco_dataForm = document.getElementById("dataForm");
const gco_inputNombre = document.getElementById("inputNombre");
const gco_selectCategoria = document.getElementById("selectCategoria");
const gco_inputMonto = document.getElementById("inputMonto");
const gco_selectFiltro = document.getElementById("selectFiltro");
const gco_listaResultados = document.getElementById("listaResultados");
const gco_resumenConteo = document.getElementById("resumenConteo");
const gco_estadoCarga = document.getElementById("estadoCarga");
const gco_btnGuardar = document.getElementById("btnGuardar");
async function gco_cargarArchivoJson(gco_rutaArchivo) {
    const gco_respuesta = await fetch(gco_rutaArchivo);

    if (!gco_respuesta.ok) {
        throw new Error(`No fue posible cargar ${gco_rutaArchivo}. Estado HTTP: ${gco_respuesta.status}`);
    }

    return await gco_respuesta.json();
}
async function gco_inicializarAplicacion() {
    gco_estadoCarga.textContent = "Solicitando información de los materiales reciclables...";
    gco_estadoCarga.className = "estado estado-cargando";
    gco_btnGuardar.disabled = true;

    try {
        const [gco_datosRegistros, gco_datosCategorias, gco_datosResumen, gco_datosConfiguracion] =
            await Promise.all([
                gco_cargarArchivoJson("./registros.json"),
                gco_cargarArchivoJson("./categorias.json"),
                gco_cargarArchivoJson("./resumen.json"),
                gco_cargarArchivoJson("./configuracion.json")
            ]);

        if (!Array.isArray(gco_datosRegistros) || !Array.isArray(gco_datosCategorias)) {
            throw new Error("La estructura de los archivos JSON no es válida.");
        }

        gco_registros = gco_datosRegistros;
        gco_categorias = gco_datosCategorias;
        gco_resumen = gco_datosResumen;
        gco_configuracion = gco_datosConfiguracion;

        gco_poblarCategorias();
        gco_estadoCarga.textContent = "Información cargada correctamente desde los archivos JSON.";
        gco_estadoCarga.className = "estado estado-exito";
        gco_btnGuardar.disabled = false;

        gco_renderizarEnDOM(gco_buscarPorCategoria(gco_selectFiltro.value));
    } catch (gco_error) {
        console.error("Error al cargar los datos:", gco_error);
        gco_estadoCarga.textContent = "No se pudieron cargar los datos. Verifica los archivos JSON e intenta nuevamente.";
        gco_estadoCarga.className = "estado estado-error";
        gco_listaResultados.innerHTML = "";
        gco_resumenConteo.textContent = "Total de registros: 0";
    }
}
function gco_poblarCategorias() {
    gco_selectCategoria.innerHTML = '<option value="">-- Selecciona una categoría --</option>';
    gco_selectFiltro.innerHTML = '<option value="Todas">Todas</option>';

    gco_categorias.forEach(gco_verdura => {
        if (!gco_verdura.activa) return;

        const gco_opcionRegistro = document.createElement("option");
        gco_opcionRegistro.value = gco_verdura.nombre;
        gco_opcionRegistro.textContent = gco_verdura.nombre;
        gco_selectCategoria.appendChild(gco_opcionRegistro);

        const gco_opcionFiltro = document.createElement("option");
        gco_opcionFiltro.value = gco_verdura.nombre;
        gco_opcionFiltro.textContent = gco_verdura.nombre;
        gco_selectFiltro.appendChild(gco_opcionFiltro);
    });

    if (gco_configuracion.categoriaFiltroInicial) {
        gco_selectFiltro.value = gco_configuracion.categoriaFiltroInicial;
    }
}

function gco_buscarPorCategoria(gco_categoriaSeleccionada) {
    if (gco_categoriaSeleccionada === "Todas") {
        return gco_registros;
    }

    return gco_registros.filter(gco_fruta => gco_fruta.categoria === gco_categoriaSeleccionada);
}

function gco_agregarRegistro(gco_nombre, gco_categoria, gco_monto) {
    const gco_nuevoRegistro = {
        id: Date.now(),
        nombre: gco_nombre,
        categoria: gco_categoria,
        monto: Number(gco_monto)
    };

    gco_registros.push(gco_nuevoRegistro);
}
function gco_renderizarEnDOM(gco_verduras) {
    gco_listaResultados.innerHTML = "";
    gco_resumenConteo.textContent = `Total de registros: ${gco_verduras.length}`;

    if (gco_verduras.length === 0) {
        const gco_mensajeVacio = document.createElement("li");
        gco_mensajeVacio.classList.add("mensaje-vacio");
        gco_mensajeVacio.textContent = "No hay materiales para mostrar en esta categoría.";
        gco_listaResultados.appendChild(gco_mensajeVacio);
        return;
    }

    gco_verduras.forEach(gco_fruta => {
        const gco_tarjeta = document.createElement("li");
        gco_tarjeta.classList.add("item-tarjeta");

        const gco_info = document.createElement("div");
        gco_info.classList.add("item-info");

        const gco_nombre = document.createElement("span");
        gco_nombre.classList.add("item-titulo");
        gco_nombre.textContent = gco_fruta.nombre;

        const gco_categoria = document.createElement("span");
        gco_categoria.classList.add("item-categoria");
        gco_categoria.textContent = `Categoría: ${gco_fruta.categoria}`;

        const gco_monto = document.createElement("span");
        gco_monto.classList.add("item-monto");
        gco_monto.textContent = `$${Number(gco_fruta.monto).toLocaleString("es-CO")} COP`;

        gco_info.appendChild(gco_nombre);
        gco_info.appendChild(gco_categoria);
        gco_tarjeta.appendChild(gco_info);
        gco_tarjeta.appendChild(gco_monto);
        gco_listaResultados.appendChild(gco_tarjeta);
    });
}
gco_dataForm.addEventListener("submit", function (gco_evento) {
    gco_evento.preventDefault();

    const gco_nombreIngresado = gco_inputNombre.value.trim();
    const gco_categoriaIngresada = gco_selectCategoria.value;
    const gco_montoIngresado = gco_inputMonto.value;

    if (!gco_nombreIngresado || !gco_categoriaIngresada || gco_montoIngresado === "") {
        return;
    }

    if (Number(gco_montoIngresado) < 0 || !Number.isFinite(Number(gco_montoIngresado))) {
        gco_estadoCarga.textContent = "El valor debe ser un número igual o mayor que cero.";
        gco_estadoCarga.className = "estado estado-error";
        return;
    }

    gco_agregarRegistro(gco_nombreIngresado, gco_categoriaIngresada, gco_montoIngresado);
    gco_dataForm.reset();
    gco_estadoCarga.textContent = "Registro agregado correctamente a la lista de esta sesión.";
    gco_estadoCarga.className = "estado estado-exito";
    gco_renderizarEnDOM(gco_buscarPorCategoria(gco_selectFiltro.value));
});

gco_selectFiltro.addEventListener("change", function () {
    gco_renderizarEnDOM(gco_buscarPorCategoria(gco_selectFiltro.value));
});

gco_inicializarAplicacion();
