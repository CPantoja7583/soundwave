# SoundWave

Proyecto grupal base para una plataforma de gestion musical estilo Spotify usando Node.js, Express, Sequelize, PostgreSQL y Handlebars.

## Que incluye esta base

- arquitectura MVC simple y legible
- Sequelize conectado a PostgreSQL
- modelos `Artista` y `Cancion`
- relacion uno a muchos entre artistas y canciones
- API REST para artistas y canciones
- vistas Handlebars para home, detalle y formularios
- extras utiles: top 10, shuffle y contador de reproducciones
- comentarios cortos para ayudar al equipo a entender la estructura
- `docker-compose.yml` para levantar PostgreSQL rapido en desarrollo

## Requisitos

- Node.js 20 o superior
- npm
- PostgreSQL

Docker es opcional. El proyecto puede levantarse con PostgreSQL local sin problema.

## Instalacion

```bash
npm install
```

## Configuracion rapida

Hay dos formas de levantar la base de datos.

### Opcion A: PostgreSQL local

1. Crea una base de datos llamada `soundwave`.
2. Copia `.env.local-postgres.example` a `.env`.
3. Reemplaza `DB_PASSWORD=tu_password` por tu clave real de PostgreSQL.

Si usas `psql`, puedes crear la base con:

```bash
psql -U postgres -h 127.0.0.1 -p 5432 -d postgres -c "CREATE DATABASE soundwave;"
```

Si usas pgAdmin, crea una base nueva llamada `soundwave` antes de iniciar la app.

Ejemplo:

```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=soundwave
DB_USER=postgres
DB_PASSWORD=tu_password
```

### Opcion B: PostgreSQL con Docker

1. Copia `.env.docker.example` a `.env`.
2. Levanta la base:

```bash
docker compose up -d
```

En esta opcion el contenedor expone PostgreSQL en el puerto `5433` para no chocar con instalaciones locales que ya usen `5432`.

Ejemplo:

```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=5433
DB_NAME=soundwave
DB_USER=postgres
DB_PASSWORD=postgres
```

## Archivo `.env` por defecto

Si no quieres usar los archivos extra, tambien puedes copiar `.env.example` a `.env` y completar tus credenciales de PostgreSQL local.

## Ejecucion

Modo normal:

```bash
npm start
```

Modo desarrollo:

```bash
npm run dev
```

La aplicacion usa `sequelize.sync()` al iniciar. Si la base esta vacia, tambien carga datos iniciales desde `scripts/seed.js`.

## Verificacion rapida

1. Asegurate de que PostgreSQL este corriendo.
2. Ejecuta:

```bash
npm run check
npm start
```

3. Abre:

```text
http://127.0.0.1:3000
```

Si todo va bien, deberias ver artistas sembrados automaticamente la primera vez.

## Scripts utiles

```bash
npm run seed
npm run check
```

## Estructura MVC

- `config/`: conexion a base de datos
- `models/`: definicion de entidades y relaciones
- `controllers/api/`: respuestas JSON
- `controllers/web/`: render de vistas y formularios
- `routes/`: separacion entre rutas web y API
- `views/`: layouts, partials y paginas Handlebars
- `public/`: CSS estatico
- `scripts/`: utilidades como la siembra de datos

## Endpoints API principales

- `GET /api/artistas`
- `GET /api/artistas/:id`
- `POST /api/artistas`
- `PUT /api/artistas/:id`
- `DELETE /api/artistas/:id`
- `GET /api/artistas/:id/canciones`
- `POST /api/artistas/:id/canciones`
- `DELETE /api/canciones/:id`
- `POST /api/canciones/:id/play`
- `GET /api/canciones/shuffle`

## Reparto sugerido para el equipo

### Integrante 1: modelos y base de datos

- revisar `config/database.js`
- entender `models/Artista.js`, `models/Cancion.js` y `models/index.js`
- crear la base `soundwave` y apoyar al equipo con la configuracion de `.env`

### Integrante 2: API REST

- trabajar en `controllers/api/` y `routes/api.js`
- mejorar respuestas JSON, validaciones y manejo de errores
- agregar pruebas de endpoints

### Integrante 3: vistas y UX

- trabajar en `controllers/web/`, `views/` y `public/styles.css`
- mejorar formularios, estados vacios y consistencia visual

### Integrante 4: extras y coordinacion

- profundizar en ranking, shuffle y reproducciones
- documentar el proyecto
- coordinar ramas, PRs y revisiones

## Flujo Git recomendado

Para este repo ya dejamos un flujo mas ordenado:

- `develop`: integracion del equipo
- `qa`: validacion previa
- `main`: version estable

Sugerencia de trabajo:

1. crear ramas cortas desde `develop`
2. abrir PR hacia `develop`
3. pasar de `develop` a `qa`
4. pasar de `qa` a `main` cuando todo este revisado

## Nota importante sobre SQLite

Si todavia ves un archivo `data/soundwave.sqlite`, tomalo como un resto antiguo del proyecto. La version actual de SoundWave debe levantarse con PostgreSQL.

## Idea para exposicion en grupo

- mostrar primero la home y el detalle de artista
- luego explicar la relacion `Artista -> Cancion`
- despues mostrar la API REST
- cerrar con extras: reproducir, top 10 y shuffle
