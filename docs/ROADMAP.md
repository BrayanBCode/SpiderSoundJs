# Roadmap — Araña Sound

> Plan de trabajo acordado. Ir **en este orden**, una rama y un PR por etapa (`categoria/implementacion`).
> Ramas: cada cambio sale de `Development` en una rama `categoria/implementacion` y vuelve por PR a `Development`. Antes de abrir el PR se trae lo último de `Development` a la rama (`git merge origin/Development`) y los conflictos se resuelven en la rama, así el merge a `Development` queda limpio. Cada release es un PR de `Development` a `main` (desde 2026-11-17).
> Antes de sumar algo que no esté acá, anotarlo en [Ideas sueltas](#ideas-sueltas-no-planificadas) en vez de empezarlo.

Última actualización: 2026-11-17

---

## Estado actual

- Bot funcionando en Docker: **Bun** + **Lavalink 4.2** + plugin de YouTube (versión elegida al arrancar: release o snapshot) + **yt-cipher** + **spotify-tokener** + **moonlink.js 5.2**.
- YouTube ✅ · Spotify ✅: canciones, álbumes, playlists públicas y artistas (top 10). La API oficial bloquea a apps nuevas todo menos canciones, así que LavaSrc usa la API del reproductor web (`preferPartnerApi`) con el token anónimo del contenedor **spotify-tokener** (2026-11-17). Las playlists privadas o armadas para una cuenta (Daily Mix) no cargan. De cada playlist se cargan las primeras **100** (~30 s): LavaSrc pide el ISRC de cada canción de a una y con más se pasaba de los 100 s que espera moonlink.js. El bot reintenta una vez si el token falla.
- Botones del reproductor con **emojis propios** (tema araña). El botón ❤️ guarda favoritos en SQLite (`data/bot.db`).
- Repo actual: SpiderSoundJs (público). Migración en PR #38 y paso a Bun en PR #40. MultiPurposeBotTS queda como respaldo privado (falta archivarlo).
- Licencia: **Apache 2.0** con archivo `NOTICE` (crédito a BrayanBCode), desde 2026-11-15. Antes era una licencia propia sin uso comercial.
- Última release: [v3.2.0](https://github.com/BrayanBCode/SpiderSoundJs/releases/tag/v3.2.0) (2026-11-17): álbumes, playlists y artistas de Spotify, cola nueva, `/loop`, `/shuffle`, `/move`, `/help` por secciones, límites de recursos y licencia Apache 2.0.
- Web: https://spiderbotsite.netlify.app/ (repo privado `spider-bot-page`, con su propio roadmap).

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

- [x] Runtime del bot en **Bun** (Lavalink sigue igual: es Java y corre aparte).
- [x] Ajustar `package.json`, scripts y `dockerfile` (imagen `oven/bun`).
- [x] Verificar compatibilidad: discord.js, moonlink.js, winston, `dotenv` (Bun ya lee `.env` solo). _Typecheck, carga de módulos y prueba en Discord OK._
- [x] Revisar scripts con sintaxis de Windows (`rd /s /q`, `set`) y dejarlos multiplataforma.

**Hecho:** Bun ejecuta `src/` directo (sin `tsc` ni `dist/`); `bun.lock` reemplaza a `package-lock.json` (mismas versiones); se quitaron `dotenv`, `node-fetch`, `@discordjs/voice` y `tsx` (sin uso). La imagen trae código y dependencias; del host solo se montan `.env`, `logs/` y `.moonlink/`.

---

## 3. Plugin de YouTube automatizado

- [x] Un ajuste de configuración (`YOUTUBE_PLUGIN_CHANNEL=release|dev` en `.env`) que elija entre la **última release** o la **rama dev (snapshot)**.
- [x] Al arrancar Lavalink, resolver la última versión del canal elegido desde `maven.lavalink.dev` (`maven-metadata.xml`) y usarla (+ `snapshot: true` si es dev).
- [x] Log claro de qué versión quedó en uso.

**Hecho:** `lavalink-entrypoint.sh` corre antes de Lavalink, consulta `maven-metadata.xml` y pasa la versión por `YOUTUBE_PLUGIN_VERSION` / `YOUTUBE_PLUGIN_SNAPSHOT`, que `application.yml` lee como `${...}` (no se reescribe el archivo: tiene secretos). Sin canal, con un valor inválido o si maven no responde, queda la versión fija de `application.yml` con un aviso `[YouTubePlugin]` en el log. No se usaron variables `LAVALINK_PLUGINS_N_...`: Spring reemplaza la lista de plugins entera, así que habría que repetir también LavaSrc.

---

## 4. Base de datos

**Decisión:** con Bun, usar **`bun:sqlite`** (incluido en Bun, sin dependencias ni compilación) en `data/bot.db`. `data/` en `.gitignore` y montado como volumen.

- [x] Tablas de favoritos y playlists por usuario.
- [x] Habilitar el botón ❤️: guarda o quita la canción actual de **los favoritos de quien lo pulsa** (respuesta efímera).
- [x] Logs: quién agregó/quitó qué.

**Hecho:** `src/core/db/database.ts` (`BotDatabase`) crea `favorites`, `playlists` y `playlist_tracks` al arrancar (WAL y `busy_timeout` para que varios shards compartan el archivo). Se guarda el enlace, título, artista, duración y portada, lo justo para mostrar la canción y volver a buscarla. El ❤️ funciona aunque no estés en el canal de voz (no controla la reproducción). Las playlists solo tienen la tabla: sus funciones llegan con la etapa 5. Tests en `test/core/db/database.test.ts`.

---

## 5. Comandos experimentales de playlists de usuario

- [x] Gestionar favoritos y playlists con **menús de Discord** (select menus, botones, modales).
  - [x] `/favoritos play [cantidad] [mezclar]`: carga los favoritos de quien lo usa en la cola (hasta 100, buscando de a 5) (PR #47).
  - [x] `/favoritos ver`: lista paginada efímera con menú para quitar canciones (PR #47).
  - [x] `/favoritos agregar [busqueda]`: guarda una canción buscada (mismo autocompletado que `/play`, sin pedir canal de voz) o la que suena; no duplica ni quita (PR #48).
  - [x] `/favoritos reproducir` pasa a `/favoritos play`, igual que `/playlist play` (PR #49).
  - [x] `/playlist crear · agregar · play · ver · renombrar · borrar`: hasta 25 playlists de 100 canciones por usuario; `agregar` acepta playlists de YouTube (agrega en orden hasta llenarla, sin repetir); `borrar` pide confirmación; código compartido con `/favoritos` en `src/core/music/savedTracks.ts` (PR #49).
- [x] Controlador de interfaces: `DisplayEngine` no existe en este repo (quedó en MultiPurposeBotTS); los menús nuevos usan collectors de discord.js atados a su mensaje y con prefijo de `customId`, sin hacer falta un controlador nuevo. Se conserva `DisplayButtonsBuilder` para el reproductor (PR #49).
- [x] Marcarlos como experimentales hasta estabilizarlos: la descripción de `/favoritos` y `/playlist` empieza con "🧪 Experimental" (PR #49).

---

## 6. Mejorar la interfaz "Escuchando"

- [x] Barra de progreso **descartada**: editar cada pocos segundos en cada servidor con música serían miles de llamadas por hora, cerca de los límites de Discord y con parpadeo. En su lugar, "Termina" usa `<t:…:R>`, que Discord actualiza solo; pausada muestra "Va por" (PR #52).
- [x] Embed nuevo: "Escuchando 🎶" verde o "En pausa ⏸️" gris; artista y duración, Termina, Loop (OFF / Canción / Cola) y Siguiente en líneas de la descripción (las columnas se desalineaban con artistas largos); pie con quién la pidió y la cola. La portada de YouTube va como imagen (320×180; Discord ajusta el embed a su ancho, así que se ve grande); las otras fuentes, como miniatura. Se probó armar una portada chica con `sharp` y se descartó (ver Ideas sueltas). El botón ⏯️ ya reanuda (miraba `playing`, que moonlink deja en true durante la pausa) (PR #52).
- [x] El mensaje se edita en su lugar cuando cambia algo, escuchando eventos de moonlink.js (pausa, seek, repetición, mezcla, cola); varios cambios seguidos se juntan en una edición (`PlayerMessage.update`). Antes solo cambiaba con la canción (PR #52).
- [x] Avisos de agregar a la cola: encabezado según el comando (`/play`, `/playnext`, `/forceplay` o "Sonando ahora" si no sonaba nada), título con enlace, posición y cuándo suena; playlist con duración total y las 3 primeras limpias. Se borran solos al minuto (PR #52).

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

- [x] `titleCleaner` (`src/utils/tools.ts`): regex revisado y 34 tests con títulos reales (PR #44).
- [x] `BClient` pedía 11 intents (3 privilegiados) y usaba 2: quedan `Guilds` y `GuildVoiceStates`, sin partials. Ya no hay que activar intents en el Developer Portal. Para los roles por reacción (etapa 9) habrá que sumar `GuildMessageReactions` y los partials de mensaje y reacción.
- [x] Si falta `lavalinkPassword` en el `.env`, el bot no arranca y lo dice (antes probaba con `"password"`).
- [x] Dependencia circular entre `BClient` y `PlayerMessage`: `PlayerMessage` solo usaba el tipo, así que pasa a `import type` y el ciclo desaparece en tiempo de ejecución. No hizo falta reestructurar.
- [x] Tests en una carpeta aparte, como en Maven: `src/` con el código y `test/` con la misma estructura (`src/core/music/timing.ts` → `test/core/music/timing.test.ts`). `test/` está en el `include` del `tsconfig.json` para el typecheck; `bun test` los encuentra solo. La imagen de Docker solo copia `src/`, así que los tests ya no entran en ella (2026-11-17).
- [x] Mejoras visibles (2026-11-17): estado del bot "Escuchando /play · N servidores" (se actualiza al entrar o salir de un servidor), comandos `/loop` (con `modo` opcional) y `/shuffle` (antes solo eran botones), `/move` para reordenar la cola, y `/skip` con el mismo formato que los avisos de agregar a la cola. El botón 🔁 y `/loop` comparten la lógica (`nextLoopMode`, `loopMessage`).
- [x] `/queue` y el botón 📜 con diseño nuevo (2026-11-17): lo que suena, 10 canciones por página en una línea cada una (título hasta 32 caracteres, artista hasta 18), pie con página, total y loop, y botones ⏮ ◀ `1/N` ▶ ⏭ que se desactivan en los bordes (Discord admite 5 por fila). Solo la ve quien la pide y cada página se arma con la cola del momento (`src/core/music/queueView.ts`).
- [x] Logs de `[PlayerMessage]` con el `#canal` y aviso cuando el mensaje "Escuchando" cambia de canal (PR #43).
- [x] `/help` (lista generada con los comandos cargados) y `/ping` (latencia de respuesta y del gateway); se quitó `/hi` (PR #50).
- [x] Logs `[Servidores]`: al entrar o salir de un servidor y la lista de servidores al arrancar (PR #50).
- [x] Avisos al servidor del dev (`DEV_GUILD_ID`) en `#notificaciones-bot` (privado: solo `ownerID` y administradores): bot en línea, servidor nuevo o perdido, error y vuelta de Lavalink, errores no controlados (máximo uno por minuto del mismo). `unhandledRejection` ahora registra el motivo (antes quedaba vacío) y cada shard carga los manejadores de errores (PR #51).

---

## 9. Nueva etapa del bot — funciones más allá de la música

- [ ] Roles por reacción (reaction roles).
- [ ] Otros comandos generales (definir lista antes de empezar).

---

## 10. Bot en inglés

**Objetivo:** que cada servidor pueda usar el bot en inglés. Hoy todos los textos están en español y escritos en el código.

- [ ] Juntar los textos del bot en un solo lugar por idioma (respuestas, avisos, embeds del reproductor y de la cola, errores) en vez de tenerlos repartidos en cada comando.
- [ ] Versión en inglés de todos esos textos.
- [ ] Nombres, descripciones y opciones de los comandos en inglés con las localizaciones de Discord (`setNameLocalizations` / `setDescriptionLocalizations`): cada usuario los ve en el idioma de su Discord.
- [ ] Elegir el idioma de las respuestas: por defecto el del servidor (`guild.preferredLocale`), con un comando para cambiarlo, guardado en `data/bot.db`.
- [ ] README en inglés (o un `README.en.md`) y la web con versión en inglés.

---

## Mantenimiento

- Si YouTube deja de sonar: revisar `docker compose logs lavalink` (motivo por cliente). Si aparece `oauth2 token fetch: 400`, regenerar el refresh token. El log arranca con `[YouTubePlugin]` y la versión del plugin en uso; si la última del canal falla, probar el otro canal (`YOUTUBE_PLUGIN_CHANNEL` en `.env`) o dejarlo vacío para usar la versión fija de `application.yml`, y recrear Lavalink (`docker compose up -d lavalink`).
- **Emojis de botones**: para cambiar uno hay que borrarlo y volver a subirlo (cambia el ID) y actualizar `src/core/buttons/emojis.ts`. Fuentes en `assets/emojis/`.
- Calidad de audio (opcional): `resamplingQuality: LOW → HIGH` en `application.yml`; lo que más pesa es el bitrate del canal de voz.
- Si álbumes, playlists o artistas de Spotify dejan de cargar: revisar `docker compose logs spotify-tokener` y buscar `Partner API failed` en los logs de Lavalink. Puede que Spotify haya cambiado algo y haga falta actualizar la imagen (`docker compose pull spotify-tokener`) o LavaSrc.
- **Límites de recursos** en `docker-compose.yml` (medidos el 2026-11-17 con una canción sonando): bot 256 MB / 0,5 núcleo, Lavalink 1 GB / 1,5 núcleos con heap de 512 MB (`-Xmx512m`; antes la JVM se reservaba ~4 GB), yt-cipher 384 MB / 1, spotify-tokener 512 MB / 1. Cada uno por encima del pico medido. Si un contenedor se reinicia solo, revisar `docker inspect -f '{{.State.OOMKilled}}'` y subirle el límite; con varios servidores escuchando a la vez, Lavalink va a necesitar más.
- No probado aún: mover el bot de canal con música sonando.

---

## Fuera de alcance (por ahora)

- Volver a NodeLink (Lavalink funciona).
- Playlists compartidas entre usuarios; importar playlists de Spotify.
- Letras de canciones.

## Ideas sueltas (no planificadas)

_Anotar acá antes de empezarlas._

- Tarjeta "Escuchando" generada como imagen: Discord no deja elegir el tamaño de la imagen de un embed. Si se quiere controlar el tamaño de la portada, que sea una imagen propia con varios datos (portada, título, artista, progreso, loop…) y no solo la portada achicada (se probó con `sharp`, 2026-11-15, y no convenció). Requiere `sharp` o un canvas y subir la imagen en cada canción.
- Hilo "¿Cómo ejecuto el bot?" en Discord: corregir o borrar el mensaje "DEPRECATED bun→npm, lavalink→nodelink" (ya no es cierto).
