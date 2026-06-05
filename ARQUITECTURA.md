# Arquitectura de SoundWave

## Vision general

`SoundWave` usa una arquitectura **MVC** sobre `Express`, con `Sequelize` para conectarse a `PostgreSQL` y `Handlebars` para renderizar las vistas.

La idea es separar bien las responsabilidades del proyecto para que el equipo pueda trabajar sin pisarse:

- `Model`: representa los datos y la relacion con la base de datos
- `View`: representa lo que ve el usuario en el navegador
- `Controller`: contiene la logica que conecta rutas, modelos y vistas

## Stack principal

- `Node.js`
- `Express`
- `Sequelize`
- `PostgreSQL`
- `Handlebars`

## Estructura general del proyecto

### `app.js`

Es el punto de entrada de la aplicacion.

Aqui se hace lo siguiente:

- se configura `Express`
- se configura `Handlebars`
- se agregan middlewares como `express.json()` y `express.urlencoded()`
- se sirven archivos estaticos desde `public/`
- se cargan las rutas web y API
- se ejecuta `sequelize.sync()`
- se llama a la siembra inicial de datos
- se levanta el servidor

En otras palabras, `app.js` es el archivo que une todo.

### `config/database.js`

Este archivo centraliza la conexion a la base de datos.

Lee variables de entorno como:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DATABASE_URL` (si existiera)

Su trabajo es crear la instancia de `Sequelize` que luego usan los modelos.

### `models/`

Aqui se define la capa de datos.

Archivos principales:

- `Artista.js`
- `Cancion.js`
- `index.js`

#### `Artista`

Representa a un artista musical.

#### `Cancion`

Representa una cancion asociada a un artista.

#### `models/index.js`

Se encarga de:

- importar los modelos
- definir relaciones
- exportarlos listos para usar

La relacion principal del proyecto es:

- **un artista tiene muchas canciones**
- **una cancion pertenece a un artista**

## `controllers/`

Aqui vive la logica de la aplicacion.

Los controladores reciben una solicitud, deciden que hacer, hablan con los modelos y devuelven una respuesta.

### `controllers/api/`

Esta carpeta contiene la logica de la API REST.

Ejemplos:

- listar artistas
- crear artistas
- modificar artistas
- eliminar artistas
- agregar canciones
- registrar reproducciones

La respuesta aqui normalmente es en formato **JSON**.

### `controllers/web/`

Esta carpeta contiene la logica para las vistas del navegador.

Ejemplos:

- renderizar la pagina principal
- mostrar detalle de un artista
- mostrar formularios
- redirigir despues de crear o eliminar

La respuesta aqui normalmente es una **vista Handlebars renderizada**.

## `routes/`

Las rutas conectan una URL con un controlador.

### `routes/api.js`

Aqui estan las rutas de la API, por ejemplo:

- `GET /api/artistas`
- `POST /api/artistas`
- `DELETE /api/canciones/:id`

Estas rutas apuntan a controladores dentro de `controllers/api/`.

### `routes/web.js`

Aqui estan las rutas que renderizan paginas HTML, por ejemplo:

- `/`
- `/artistas/:id`
- `/artistas/nuevo`

Estas rutas apuntan a controladores dentro de `controllers/web/`.

## `views/`

Aqui estan las vistas `Handlebars`.

Se usan para generar HTML del lado del servidor.

Subpartes importantes:

- `layouts/`: estructura base comun
- `partials/`: fragmentos reutilizables
- vistas principales: home, detalle, formularios

Estas vistas reciben datos desde los controladores y los muestran al usuario.

## `public/`

Contiene archivos estaticos, principalmente:

- CSS
- posibles imagenes o recursos visuales

Esta carpeta afecta la presentacion, pero no la logica de negocio.

## `scripts/seed.js`

Este script agrega datos iniciales a la base cuando esta vacia.

Sirve para que el proyecto no parta en blanco y el grupo pueda probarlo rapidamente.

## Flujo de una peticion web

Ejemplo: entrar al detalle de un artista.

1. el navegador pide una URL
2. `app.js` recibe la solicitud
3. la solicitud pasa a `routes/web.js`
4. la ruta llama a un controlador en `controllers/web/`
5. el controlador consulta los modelos
6. `Sequelize` habla con `PostgreSQL`
7. el controlador recibe los datos
8. el controlador renderiza una vista `Handlebars`
9. el navegador recibe el HTML final

## Flujo de una peticion API

Ejemplo: `POST /api/artistas`

1. el cliente hace una solicitud a la API
2. `app.js` deriva la solicitud a `routes/api.js`
3. la ruta llama al controlador correspondiente
4. el controlador valida y procesa los datos
5. usa un modelo `Sequelize`
6. `Sequelize` guarda los datos en `PostgreSQL`
7. el controlador responde con `JSON`

## Por que esta arquitectura ayuda al grupo

Esta separacion permite dividir el trabajo de forma mas clara:

- una persona puede trabajar base de datos y modelos
- otra puede trabajar API REST
- otra puede trabajar vistas y estilos
- otra puede encargarse de documentacion, extras y coordinacion

Asi el proyecto escala mejor y es mas facil mantenerlo.

## Resumen corto para exposicion

Se puede explicar asi:

> SoundWave usa arquitectura MVC. Express maneja las rutas, los controladores contienen la logica, Sequelize conecta con PostgreSQL mediante los modelos `Artista` y `Cancion`, y Handlebars renderiza las vistas que ve el usuario.

## Resumen ultra corto

- `app.js` = arranque de la app
- `routes/` = a donde va cada URL
- `controllers/` = logica de negocio
- `models/` = datos y base de datos
- `views/` = interfaz renderizada
- `config/database.js` = conexion con PostgreSQL
