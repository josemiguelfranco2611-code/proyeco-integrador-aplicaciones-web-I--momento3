# Proyecto Integrador - Momento 3
## Gestión de Datos en Tiempo Real: materiales reciclables

### 1. Descripción
Esta aplicación permite registrar materiales reciclables, clasificarlos según su porcentaje de aprovechamiento (100 %, 75 % y 50 %), filtrar los registros y visualizar los resultados en el DOM. El momento 3 conserva el formulario, los filtros y la lista dinámica del momento 2, pero ahora obtiene los datos iniciales desde archivos JSON mediante solicitudes asíncronas con Fetch API.

### 2. Archivos del proyecto
- `index.html`: estructura del formulario, filtro y área de resultados.
- `style.css`: estilos y diseño adaptable.
- `main.js`: eventos, solicitudes Fetch, validaciones y actualización del DOM.
- `registros.json`: registros iniciales de materiales reciclables.
- `categorias.json`: categorías de clasificación disponibles.
- `resumen.json`: resumen inicial de cantidades y valores.
- `configuracion.json`: opciones y validaciones generales.

### 3. Consumo asíncrono y manejo de errores
Al iniciar la página, `gco_inicializarAplicacion()` muestra un mensaje de carga y realiza cuatro solicitudes `fetch()` mediante `Promise.all()`. La función `gco_cargarArchivoJson()` comprueba `respuesta.ok` antes de convertir la respuesta a JSON. El proceso está protegido con `try...catch`; si ocurre un error de red, HTTP o estructura, se muestra un mensaje amigable en el DOM.

### 4. Actualización del DOM
Cuando los archivos se cargan correctamente:
1. Se guardan los datos recibidos en arreglos y objetos de memoria.
2. Se crean las opciones de los select a partir de `categorias.json`.
3. Se recorre el arreglo de registros y se crean tarjetas con `document.createElement()`.
4. Se agregan los elementos usando `appendChild()`.
5. Se actualiza el contador y se elimina el estado de carga reemplazándolo por un mensaje de éxito.

El filtro por categoría y el formulario de registro siguen funcionando. Los nuevos registros se conservan en memoria durante la sesión actual; todavía no se guardan en un servidor ni modifican los archivos JSON.

### 5. Convención de nombres
Las variables del algoritmo usan el prefijo `gco_` en minúsculas. Para los arreglos y variables de recorridos se emplean nombres asociados a frutas u hortalizas, por ejemplo `gco_verduras` y `gco_fruta`, según la instrucción del Momento 3. La primera instrucción ejecutada en consola imprime:

`[GCO-SYSTEM v1.0 ONLINE]`

### 6. Cómo ejecutar
1. Descarga y descomprime la carpeta del proyecto.
2. Abre la carpeta en Visual Studio Code.
3. Ejecuta `index.html` mediante una extensión de servidor local, por ejemplo Live Server.
4. No abras el HTML directamente con `file://`, porque el navegador puede bloquear las solicitudes `fetch()` a archivos locales.
5. Verifica en la consola que aparezca el mensaje `[GCO-SYSTEM v1.0 ONLINE]` y que la lista de materiales cargue.

### 7. Integración futura con Backend (Spring Boot)
En este momento los datos provienen de archivos JSON locales. Cuando el equipo de Backend entregue la API REST, las rutas locales podrán reemplazarse por los siguientes endpoints propuestos. Las URLs son contratos esperados para la integración futura, no servicios que ya estén publicados.

| Método | Endpoint esperado | Uso |
|---|---|---|
| GET | `/api/materiales` | Consultar todos los materiales |
| GET | `/api/materiales/{id}` | Consultar un material por su identificador |
| POST | `/api/materiales` | Registrar un material |
| GET | `/api/categorias` | Consultar las categorías de reciclaje |
| GET | `/api/materiales/resumen` | Consultar estadísticas de materiales |

#### Ejemplo de objeto para POST `/api/materiales`
```json
{
  "nombre": "Botellas PET",
  "categoria": "100% Reciclable",
  "monto": 50000
}
```

### 8. Conclusión
El momento 3 mejora el proyecto del momento 2 porque separa los datos de la lógica JavaScript. La aplicación ya no depende de tener los registros iniciales escritos directamente en el código: los solicita de forma asíncrona desde JSON, informa al usuario durante la carga y controla posibles fallos. Esto deja preparada la estructura FrontEnd para una futura conexión con una API desarrollada en Spring Boot.
