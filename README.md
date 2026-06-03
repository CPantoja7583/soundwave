# SoundWave

Proyecto grupal base para una plataforma de gestion musical estilo Spotify usando Node.js, Express, Sequelize y Handlebars.

## Que incluye esta base

- arquitectura MVC simple y legible
- Sequelize con SQLite para desarrollo local
- modelos `Artista` y `Cancion`
- relacion uno a muchos entre artistas y canciones
- API REST para artistas y canciones
- vistas Handlebars para home, detalle y formularios
- extras utiles: top 10, shuffle y contador de reproducciones
- comentarios cortos para ayudar al equipo a entender la estructura

## Instalacion

```bash
npm install
```

## Configuracion

1. Copia `.env.example` a `.env`
2. Ajusta el puerto si hace falta

Contenido sugerido:

```env
PORT=3000
DB_STORAGE=./data/soundwave.sqlite
```

## Ejecucion

Modo normal:

```bash
npm start
```

Modo desarrollo:

```bash
npm run dev
```

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
- extender validaciones o migrar a otra base de datos si el equipo lo pide

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

1. Crear repo GitHub publico para este proyecto.
2. Subir esta base como primer commit ejecutable.
3. Trabajar con ramas cortas:
   - `dev/base-mvc`
   - `dev/api-artistas`
   - `dev/views-home`
   - `dev/extras-ranking`
4. Integrar por pull request para evitar que se pisen cambios.

## Idea para exposicion en grupo

- mostrar primero la home y el detalle de artista
- luego explicar la relacion `Artista -> Cancion`
- despues mostrar la API REST
- cerrar con extras: reproducir, top 10 y shuffle
