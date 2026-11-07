
console.log("ECOVIDA iniciada correctamente");
const API = {
    registros: "",
    categorias: "",
    resumen: "https://6aef5e07b9925b27ce16dc82.mockapi.io/api/v3/RESUMEN",
    configuracion: ""
};
let registros = [];
let categorias = [];
let resumen = {};
let configuracion = {};

const formulario = document.getElementById("dataForm");
const inputNombre = document.getElementById("inputNombre");
const selectCategoria = document.getElementById("selectCategoria");
const inputMonto = document.getElementById("inputMonto");
const selectFiltro = document.getElementById("selectFiltro");
const listaResultados = document.getElementById("listaResultados");
const resumenConteo = document.getElementById("resumenConteo");
const estadoCarga = document.getElementById("estadoCarga");
const botonGuardar = document.getElementById("btnGuardar");

async function consultarAPI(url) {
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
        throw new Error("Error al consultar la API");
    }

    return await respuesta.json();
}
async function iniciarAplicacion() {
    estadoCarga.textContent = "Cargando información...";
    estadoCarga.className = "estado estado-cargando";
    botonGuardar.disabled = true;

    try {
        const [datosRegistros, datosCategorias, datosResumen, datosConfiguracion] =
            await Promise.all([
                consultarAPI(API.registros),
                consultarAPI(API.categorias),
                consultarAPI(API.resumen),
                consultarAPI(API.configuracion)
            ]);

        registros = datosRegistros;
        categorias = datosCategorias;
        resumen = datosResumen[0] || {};
        configuracion = datosConfiguracion[0] || {};

        if (!Array.isArray(registros) || !Array.isArray(categorias)) {
            throw new Error("Los datos recibidos no tienen el formato esperado");
        }

        mostrarCategorias();

        estadoCarga.textContent = "Información cargada correctamente.";
        estadoCarga.className = "estado estado-exito";

        botonGuardar.disabled = false;

        mostrarRegistros(buscarPorCategoria(selectFiltro.value));

    } catch (error) {
        console.error("Error:", error);

        estadoCarga.textContent =
            "No se pudieron cargar los datos. Verifica las direcciones de MockAPI.";

        estadoCarga.className = "estado estado-error";
        listaResultados.innerHTML = "";
        resumenConteo.textContent = "Total de registros: 0";
    }
}

function mostrarCategorias() {
    selectCategoria.innerHTML =
        '<option value="">-- Selecciona una categoría --</option>';

    selectFiltro.innerHTML =
        '<option value="Todas">Todas</option>';

    categorias.forEach(categoria => {
        if (categoria.activa === false) return;

        const opcionRegistro = document.createElement("option");

        opcionRegistro.value = categoria.nombre;
        opcionRegistro.textContent = categoria.nombre;

        selectCategoria.appendChild(opcionRegistro);

        const opcionFiltro = document.createElement("option");

        opcionFiltro.value = categoria.nombre;
        opcionFiltro.textContent = categoria.nombre;

        selectFiltro.appendChild(opcionFiltro);
    });

    if (configuracion.categoriaFiltroInicial) {
        selectFiltro.value = configuracion.categoriaFiltroInicial;
    }
}

function buscarPorCategoria(categoriaSeleccionada) {
    if (categoriaSeleccionada === "Todas") {
        return registros;
    }

    return registros.filter(
        material => material.categoria === categoriaSeleccionada
    );
}
async function agregarRegistro(nombre, categoria, monto) {
    const nuevoRegistro = {
        nombre: nombre,
        categoria: categoria,
        monto: Number(monto)
    };

    const respuesta = await fetch(API.registros, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(nuevoRegistro)
    });

    if (!respuesta.ok) {
        throw new Error("No se pudo guardar el registro");
    }

    const registroGuardado = await respuesta.json();

    registros.push(registroGuardado);

    return registroGuardado;
}

function mostrarRegistros(materiales) {
    listaResultados.innerHTML = "";

    resumenConteo.textContent =
        `Total de registros: ${materiales.length}`;

    if (materiales.length === 0) {
        const mensajeVacio = document.createElement("li");

        mensajeVacio.classList.add("mensaje-vacio");

        mensajeVacio.textContent =
            "No hay materiales para mostrar en esta categoría.";

        listaResultados.appendChild(mensajeVacio);

        return;
    }

    materiales.forEach(material => {
        const tarjeta = document.createElement("li");

        tarjeta.classList.add("item-tarjeta");

        const informacion = document.createElement("div");

        informacion.classList.add("item-info");

        const nombre = document.createElement("span");

        nombre.classList.add("item-titulo");
        nombre.textContent = material.nombre;

        const categoria = document.createElement("span");

        categoria.classList.add("item-categoria");

        categoria.textContent =
            `Categoría: ${material.categoria}`;

        const monto = document.createElement("span");

        monto.classList.add("item-monto");

        monto.textContent =
            `$${Number(material.monto).toLocaleString("es-CO")} COP`;

        informacion.appendChild(nombre);
        informacion.appendChild(categoria);

        tarjeta.appendChild(informacion);
        tarjeta.appendChild(monto);

        listaResultados.appendChild(tarjeta);
    });
}

formulario.addEventListener("submit", async function(evento) {
    evento.preventDefault();

    const nombreIngresado = inputNombre.value.trim();

    const categoriaIngresada = selectCategoria.value;

    const montoIngresado = inputMonto.value;

    if (!nombreIngresado || !categoriaIngresada || montoIngresado === "") {
        estadoCarga.textContent = "Completa todos los campos.";
        estadoCarga.className = "estado estado-error";
        return;
    }

    if (
        Number(montoIngresado) < 0 ||
        !Number.isFinite(Number(montoIngresado))
    ) {
        estadoCarga.textContent =
            "El monto debe ser un número igual o mayor que cero.";

        estadoCarga.className = "estado estado-error";

        return;
    }

    botonGuardar.disabled = true;

    try {
        await agregarRegistro(
            nombreIngresado,
            categoriaIngresada,
            montoIngresado
        );

        formulario.reset();

        estadoCarga.textContent =
            "Material registrado correctamente en MockAPI.";

        estadoCarga.className = "estado estado-exito";

        mostrarRegistros(buscarPorCategoria(selectFiltro.value));

    } catch (error) {
        console.error("Error al guardar:", error);

        estadoCarga.textContent =
            "No se pudo guardar el material. Intenta nuevamente.";

        estadoCarga.className = "estado estado-error";

    } finally {
        botonGuardar.disabled = false;
    }
});

selectFiltro.addEventListener("change", function() {
    mostrarRegistros(buscarPorCategoria(selectFiltro.value));
});

iniciarAplicacion();

