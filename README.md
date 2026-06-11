# SoundWave

SoundWave es una plataforma musical colaborativa hecha con **Node.js, Express, Sequelize, PostgreSQL y Handlebars**. El proyecto mezcla una app web renderizada en servidor con una API REST documentada para probar en Swagger o Postman.

## Ruta r?pida para levantar el proyecto

```bash
npm install
```

Luego elige una base de datos:

### PostgreSQL local

1. Crea una base llamada `soundwave`.
2. Copia `.env.local-postgres.example` a `.env`.
3. Ajusta `DB_PASSWORD` con tu clave real.
4. Ejecuta:

```bash
npm start
```

### PostgreSQL con Docker

1. Copia `.env.docker.example` a `.env`.
2. Levanta PostgreSQL:

```bash
docker compose up -d
```

3. Ejecuta la app:

```bash
npm start
```

La versi?n Docker usa el puerto `5433` para evitar choques con instalaciones locales de PostgreSQL.

## Qu? incluye

- Frontend server-side con Handlebars.
- Backend Express organizado en MVC.
- Persistencia PostgreSQL con Sequelize.
- Autenticaci?n con JWT en cookie `HttpOnly`.
- Registro local con email y contrase?a.
- Login con Google preparado y activable por variables de entorno.
- Login con Microsoft preparado, pendiente de credenciales.
- API REST documentada con Swagger.
- Colecci?n Postman para pruebas.
- Seed inicial con artistas, ?lbumes, portadas y URLs de YouTube.

## C?mo se organiza la arquitectura

| Carpeta | Responsabilidad |
|---|---|
| `app.js` | Crea la app Express, configura middlewares, rutas, Swagger y arranque. |
| `config/` | Configuraci?n de base de datos, uploads, Swagger y OAuth. |
| `models/` | Modelos Sequelize y relaciones entre tablas. |
| `controllers/web/` | Controladores que renderizan vistas o redirigen. |
| `controllers/api/` | Controladores que responden JSON para la API REST. |
| `routes/` | Define qu? URL llama a qu? controlador. |
| `views/` | Layouts, p?ginas y partials Handlebars. |
| `public/` | CSS, JavaScript del navegador, im?genes y uploads p?blicos. |
| `scripts/` | Utilidades como seed inicial y creaci?n de admin. |
| `postman/` | Colecci?n y environment para probar la API. |

## Flujo mental del backend

1. El navegador o Postman hace una petici?n.
2. Express recibe la URL en `routes/`.
3. La ruta llama a un controlador.
4. El controlador usa modelos Sequelize si necesita datos.
5. Sequelize consulta PostgreSQL.
6. La respuesta vuelve como vista HTML, redirecci?n o JSON.

Ejemplo web:

```text
GET /artistas/1 -> routes/web.js -> artistaViewController -> Sequelize -> PostgreSQL -> vista detalle
```

Ejemplo API:

```text
GET /api/artistas -> routes/api.js -> artistaController -> Sequelize -> PostgreSQL -> JSON
```

## Base de datos y seed

Al iniciar, la app ejecuta:

```js
sequelize.sync({ alter: true })
```

Esto crea o ajusta tablas autom?ticamente para este proyecto acad?mico. Despu?s corre `seedDatabase()`.

La semilla solo carga datos si la tabla `artistas` est? vac?a. Por eso, si quieres aplicar un seed nuevo en una base existente, debes limpiar primero el cat?logo:

```sql
TRUNCATE TABLE canciones, albums, artistas RESTART IDENTITY CASCADE;
```

Importante: no borres `usuarios` si quieres conservar accesos.

## Autenticaci?n

SoundWave usa JWT en una cookie `HttpOnly` llamada `soundwave_token`.

### Rutas web

| Ruta | Uso |
|---|---|
| `GET /login` | Muestra formulario de inicio de sesi?n. |
| `POST /login` | Valida email/password y crea cookie JWT. |
| `GET /register` | Muestra formulario de registro. |
| `POST /register` | Crea usuario local y entra autom?ticamente. |
| `POST /logout` | Borra cookie y cierra sesi?n. |
| `GET /auth/google` | Inicia OAuth con Google si est? configurado. |
| `GET /auth/google/callback` | Recibe respuesta de Google. |
| `GET /auth/microsoft` | Inicia OAuth con Microsoft si est? configurado. |
| `GET /auth/microsoft/callback` | Recibe respuesta de Microsoft. |

### Variables necesarias

```env
JWT_SECRET=cambia_este_secreto_largo
ADMIN_EMAIL=admin@soundwave.local
ADMIN_PASSWORD=cambia_esta_password
ADMIN_NAME=SoundWave Admin
```

`ensureAdminUser()` crea un admin inicial al arrancar si `ADMIN_EMAIL` y `ADMIN_PASSWORD` existen y todav?a no hay un usuario con ese email.

### Google OAuth

Para activar Google en producci?n, en Northflank deben existir:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://tarea.espacioalerce.cl/auth/google/callback
```

En Google Cloud Console, el OAuth Client debe ser tipo **Web application** y debe tener exactamente este redirect URI:

```text
https://tarea.espacioalerce.cl/auth/google/callback
```

Si no coincide exactamente, Google muestra `redirect_uri_mismatch`.

### Microsoft OAuth

Microsoft est? preparado, pero requiere credenciales de Azure/Microsoft Entra:

```env
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
MICROSOFT_CALLBACK_URL=https://tarea.espacioalerce.cl/auth/microsoft/callback
```

## Roles y permisos

Actualmente `requireAuth` solo exige que exista una sesi?n v?lida. Eso significa que cualquier usuario registrado puede usar acciones protegidas como crear, editar o eliminar contenido.

Para una versi?n m?s segura, el siguiente paso ser?a agregar `requireAdmin` y permitir acciones destructivas solo a usuarios con `role = "admin"`.

## UI actual

- El header p?blico muestra solo `Login`.
- El registro vive dentro de la pantalla de login como acci?n secundaria.
- Las cards de artistas son clickeables y llevan al detalle.
- El detalle de artista muestra acciones de edici?n/eliminaci?n solo si hay sesi?n.

## Swagger y Postman

Con el servidor levantado:

```text
http://127.0.0.1:3000/api-docs
http://127.0.0.1:3000/api-docs.json
```

En `postman/`:

- `SoundWave.postman_collection.json`
- `SoundWave.local.postman_environment.json`

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

Los endpoints `GET` son p?blicos. Las operaciones de escritura requieren autenticaci?n.

## Comandos ?tiles

```bash
npm run check
npm start
npm run dev
npm run seed
```

## Verificaci?n r?pida antes de subir cambios

```bash
npm run check
```

Tambi?n revisa que los archivos JSON no tengan BOM invisible, porque Northflank ya fall? una vez por un `package.json` con BOM.

## Reparto sugerido para el equipo

| ?rea | Archivos sugeridos |
|---|---|
| Base de datos | `models/`, `config/database.js`, `scripts/seed.js` |
| API REST | `routes/api.js`, `controllers/api/`, Swagger/Postman |
| Vistas web | `views/`, `controllers/web/`, `public/styles.css` |
| Autenticaci?n | `controllers/web/authController.js`, `middlewares/auth.js`, `utils/auth.js`, `config/passport.js` |
| Deploy | Northflank, Neon, variables de entorno, GitHub branches |

## Flujo de ramas usado por el equipo

```text
develop -> qa -> main
```

`main` despliega en Northflank. Evita subir archivos locales como `.env`, backups o claves.
