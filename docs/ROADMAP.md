# Roadmap — Araña Sound

> Plan de trabajo acordado. Ir **en este orden**, una rama y un PR por etapa (`categoria/implementacion`).
> Antes de sumar algo que no esté acá, anotarlo en [Ideas sueltas](#ideas-sueltas-no-planificadas) en vez de empezarlo.

Última actualización: 2026-11-13

---

## Estado actual

- Bot funcionando en Docker: **Node** + **Lavalink 4.2** + plugin de YouTube (snapshot) + **yt-cipher** + **moonlink.js 5.2**.
- YouTube ✅ · Spotify: solo **canciones sueltas** ✅ (álbumes/playlists/artistas bloqueados por la API de Spotify).
- Botones del reproductor con **emojis propios** (tema araña). El botón ❤️ está **deshabilitado** esperando la base de datos.
- Repo actual: MultiPurposeBotTS (privado). PRs #1 a #10 mergeados.

---

## 1. Mudanza al repo de Araña Sound

Destino: [BrayanBCode/SpiderSoundJs](https://github.com/BrayanBCode/SpiderSoundJs) — **público**.

- [x] Revisar ramas/PRs abiertos de SpiderSoundJs antes de tocar nada.
- [x] Rama `chore/migracion-desde-multipurpose` que reemplace el contenido en **un solo commit**.
- [x] **Sin secretos ni historial** de MultiPurposeBotTS: `.env.example`, `application.example.yml`; los reales en `.gitignore`. La contraseña de `yt-cipher` pasa al `.env`.
- [x] Cerrar puertos expuestos en `docker-compose.yml`: Lavalink solo en `127.0.0.1` (o sin publicar) y quitar el `3000` del bot.
- [x] Traer `/pause` y `/remove` del código viejo de SpiderSoundJs, adaptados.
- [x] README actualizado (quitar el aviso de "sin soporte").
- [ ] Archivar MultiPurposeBotTS como respaldo privado.

**Decidido:** migración sin historial (el repo viejo tiene secretos versionados).

---

## 2. Pasar el bot a Bun

- [ ] Runtime del bot en **Bun** (Lavalink sigue igual: es Java y corre aparte).
- [ ] Ajustar `package.json`, scripts y `dockerfile` (imagen `oven/bun`).
- [ ] Verificar compatibilidad: discord.js, moonlink.js, winston, `dotenv` (Bun ya lee `.env` solo).
- [ ] Revisar scripts con sintaxis de Windows (`rd /s /q`, `set`) y dejarlos multiplataforma.

---

## 3. Plugin de YouTube automatizado

Hoy la versión del plugin está fija a mano en `application.yml` (snapshot `2be8e542…`).

- [ ] Un ajuste de configuración (ej. `YOUTUBE_PLUGIN_CHANNEL=release|dev` en `.env`) que elija entre la **última release** o la **rama dev (snapshot)**.
- [ ] Al arrancar Lavalink, resolver la última versión del canal elegido desde `maven.lavalink.dev` (`maven-metadata.xml`) y escribirla en `application.yml` (+ `snapshot: true` si es dev).
- [ ] Log claro de qué versión quedó en uso.

---

## 4. Base de datos

**Decisión:** con Bun, usar **`bun:sqlite`** (incluido en Bun, sin dependencias ni compilación) en `data/bot.db`. `data/` en `.gitignore` y montado como volumen.

- [ ] Tablas de favoritos y playlists por usuario.
- [ ] Habilitar el botón ❤️: guarda o quita la canción actual de **los favoritos de quien lo pulsa** (respuesta efímera).
- [ ] Logs: quién agregó/quitó qué.

---

## 5. Comandos experimentales de playlists de usuario

- [ ] Gestionar favoritos y playlists con **menús de Discord** (select menus, botones, modales).
- [ ] Actualizar el controlador de interfaces propio si hace falta (en SpiderSoundJs existe `DisplayEngine`, más general que `DisplayButtonsBuilder`: evaluar cuál conservar).
- [ ] Marcarlos como experimentales hasta estabilizarlos.

---

## 6. Mejorar la interfaz "Escuchando"

- [ ] **Evaluar el costo antes de implementar** una barra de progreso: requiere editar el mensaje periódicamente (límites de rate de Discord, llamadas a la API por servidor). Medir y decidir intervalo o alternativa (ej. timestamp relativo `<t:...:R>` de Discord, que se actualiza solo sin editar).
- [ ] Otras mejoras visuales del embed.

---

## 7. Dashboard web

**Objetivo:** controlar el reproductor y gestionar favoritos/playlists desde el navegador **sin exponer la PC**.

**Arquitectura:**
- Dashboard como **contenedor Docker** propio; habla con el bot por la red interna de Docker.
- Acceso desde afuera:
  - Solo para mí / pocos amigos → **Tailscale** (nunca público, gratis, sin dominio).
  - Para miembros del servidor → **Cloudflare Tunnel** (`cloudflared` como contenedor, sin abrir puertos del router). URL fija requiere dominio propio (~USD 10/año); el túnel rápido `trycloudflare.com` cambia de URL cada vez.
- **Login con Discord (OAuth2)**: sin sesión no se hace nada.

**Reglas de seguridad (obligatorias):**
- [ ] Controlar la reproducción solo si el usuario está en el canal de voz del bot (misma regla que `requireListener`).
- [ ] Cada usuario ve y edita solo sus favoritos/playlists.
- [ ] Validar toda entrada, rate limiting por usuario/IP.
- [ ] Cookies de sesión `HttpOnly` + `Secure`, protección CSRF.
- [ ] Ningún puerto del dashboard publicado al host; solo lo ve el túnel.

---

## 8. Pulir detalles

Lo que vaya surgiendo de las etapas anteriores. Anotarlo acá a medida que aparezca:

- _(vacío)_

---

## 9. Nueva etapa del bot — funciones más allá de la música

- [ ] Roles por reacción (reaction roles).
- [ ] Otros comandos generales (definir lista antes de empezar).

---

## Mantenimiento

- Si YouTube deja de sonar: revisar `docker compose logs lavalink` (motivo por cliente). Si aparece `oauth2 token fetch: 400`, regenerar el refresh token.
- **Emojis de botones**: para cambiar uno hay que borrarlo y volver a subirlo (cambia el ID) y actualizar `src/core/buttons/emojis.ts`. Fuentes en `assets/emojis/`.
- Calidad de audio (opcional): `resamplingQuality: LOW → HIGH` en `application.yml`; lo que más pesa es el bitrate del canal de voz.
- No probado aún: mover el bot de canal con música sonando; pegar un álbum de Spotify en Discord.

---

## Fuera de alcance (por ahora)

- Álbumes / playlists / artistas de Spotify (bloqueado por la API de Spotify).
- Volver a NodeLink (mismos problemas con Spotify; Lavalink funciona).
- Playlists compartidas entre usuarios, importar playlists externas.
- Letras de canciones.

## Ideas sueltas (no planificadas)

_Anotar acá antes de empezarlas._
