# Backend pedagogico de SoundWave

Esta guia esta pensada para alguien que recien empieza con backend y quiere entender el proyecto sin perderse.

## Que parte del proyecto cuenta como backend

En `SoundWave`, el backend esta formado por estos grupos de archivos:

- `app.js`
- `config/database.js`
- `routes/`
- `controllers/`
- `models/`
- `scripts/seed.js`

Todo eso trabaja junto para recibir peticiones, hablar con PostgreSQL y responder al navegador o a la API.

## Orden recomendado de lectura

Si alguien parte desde cero, este es el orden mas amigable:

1. `app.js`
2. `routes/`
3. `controllers/`
4. `models/`
5. `config/database.js`
6. `scripts/seed.js`

Ese orden ayuda porque primero ves el mapa general, despues el camino de una peticion y al final los detalles de base de datos.

## Que hace cada parte

### `app.js`

Es el punto de entrada.

Su trabajo es:

- iniciar Express
- configurar Handlebars
- activar middlewares
- registrar rutas
- conectar con la base
- sembrar datos iniciales
- levantar el servidor

Si quieres entender "como arranca todo", este es el primer archivo.

### `routes/`

Las rutas dicen que URL llama a que controlador.

Ejemplos:

- `/` va a la home
- `/artistas/:id` va al detalle de un artista
- `/api/artistas` responde datos JSON

Hay dos grupos:

- `routes/web.js`: para vistas HTML
- `routes/api.js`: para respuestas JSON

### `controllers/`

Aqui vive la logica del proyecto.

Los controladores reciben la peticion y deciden:

- si hay que buscar datos
- si hay que validar
- si hay que guardar en la base
- si hay que renderizar una vista
- si hay que devolver JSON
- si hay que redirigir

En este proyecto hay dos tipos:

- `controllers/web/`: para paginas HTML
- `controllers/api/`: para endpoints REST

### `models/`

Los modelos representan las tablas de la base de datos.

En `SoundWave` hay dos modelos principales:

- `Artista`
- `Cancion`

Tambien se define su relacion:

- un artista tiene muchas canciones
- una cancion pertenece a un artista

### `config/database.js`

Este archivo crea la conexion con PostgreSQL usando Sequelize.

Aqui se leen las variables de entorno como:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

### `scripts/seed.js`

Este script agrega datos de ejemplo cuando la base esta vacia.

Sirve para que la app muestre contenido desde el primer arranque.

## Flujo de una peticion web

Ejemplo: alguien entra al detalle de un artista.

1. el navegador pide una URL
2. `app.js` recibe la peticion
3. la peticion pasa a `routes/web.js`
4. la ruta llama a un controlador
5. el controlador consulta modelos Sequelize
6. Sequelize habla con PostgreSQL
7. el controlador recibe los datos
8. el controlador usa `res.render()`
9. el navegador recibe HTML

## Flujo de una peticion API

Ejemplo: `GET /api/artistas`

1. llega la peticion a `app.js`
2. se deriva a `routes/api.js`
3. la ruta llama a `artistaController`
4. el controlador usa el modelo `Artista`
5. Sequelize consulta PostgreSQL
6. el controlador devuelve `res.json()`

Aqui no se renderiza una pagina. Solo se devuelven datos.

## Diferencia entre modelo, ruta y controlador

### Modelo

Define como se guardan los datos.

Ejemplo:

- un artista tiene `nombre`, `genero`, `pais`
- una cancion tiene `titulo`, `album`, `duracion`, `reproducciones`

### Ruta

Define que URL dispara una accion.

Ejemplo:

- `GET /api/artistas`
- `POST /artistas`

### Controlador

Define que hace esa accion.

Ejemplo:

- buscar artistas
- crear un artista
- eliminar una cancion
- renderizar una vista

## Como participa PostgreSQL

PostgreSQL es la base de datos real del proyecto.

Pero el codigo no escribe SQL manual en cada controlador. En vez de eso usamos `Sequelize`.

Sequelize actua como intermediario:

- nosotros llamamos funciones como `findByPk`, `findAll`, `create`, `update`, `destroy`
- Sequelize traduce eso a SQL
- PostgreSQL ejecuta las consultas

Eso hace que el codigo sea mas facil de leer para principiantes.

## Tres respuestas importantes que debes reconocer

### `res.json()`

Se usa en la API.

Devuelve datos en formato JSON.

### `res.render()`

Se usa en la parte web.

Construye HTML usando una vista Handlebars.

### `res.redirect()`

Se usa para mover al usuario a otra URL despues de una accion.

Ejemplo:

- crear artista
- volver al inicio
- mostrar mensaje de exito

## Resumen corto

Si tuvieras que explicarlo en una frase:

> Express recibe peticiones, las rutas las envian a controladores, los controladores usan modelos Sequelize para hablar con PostgreSQL y luego responden con JSON o con vistas HTML.

## Consejo final para alguien que recien empieza

No intentes entender todos los archivos al mismo tiempo.

Haz este recorrido:

1. mira `app.js`
2. sigue una ruta
3. entra al controlador de esa ruta
4. mira que modelo usa
5. vuelve al navegador y piensa que respondio

Ese ciclo hace que el backend deje de verse como "muchos archivos" y empiece a verse como un flujo.
