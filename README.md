[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/BrayanBCode/SpiderSoundJs)

# 🕷️ Araña Sound

![logo](https://github.com/BrayanBCode/SpiderBot/assets/134159765/527b4a22-a501-4ba1-b2bf-d7eefd0e9fa4)

**Araña Sound** es un bot de música para Discord hecho con **Bun**, **discord.js 14**, **moonlink.js 5** y **Lavalink 4**, todo en Docker. Reproduce desde YouTube y Spotify, con una cola interactiva y controles por botones.

> [!NOTE]
> Proyecto retomado. El plan de trabajo está en [`docs/ROADMAP.md`](docs/ROADMAP.md).

---

## 📦 Características

- 🎵 YouTube (búsqueda, links y playlists) y Spotify (canciones, álbumes, playlists públicas y artistas).
- 📃 Cola interactiva con paginación, `/playnext`, `/forceplay`, `/remove`.
- 🔁 Repetición de canción o de cola, mezclar, adelantar y retroceder.
- 🎚️ Mensaje "Escuchando" con botones y emojis propios (tema araña): muestra cuándo termina, la repetición, la siguiente y la cola, y se actualiza al pausar o cambiar algo.
- ❤️ Favoritos por usuario: el botón ❤️ guarda o quita la canción actual (solo lo ve quien lo pulsa).
- 📂 Playlists propias de cada usuario (hasta 25, de 100 canciones), también desde playlists de YouTube.
- 💤 Se desconecta solo por inactividad o si queda solo en el canal.

## 🎮 Comandos

| Comando | Qué hace |
|---|---|
| `/play` | Reproduce o agrega a la cola (texto o link, con autocompletado) |
| `/playnext` | Agrega la canción para que suene a continuación |
| `/forceplay` | Reproduce ya, saltando la actual |
| `/pause` · `/resume` | Pausa o reanuda la canción |
| `/skip` | Salta a la siguiente o a una posición de la cola (desde 1, como en `/queue`) |
| `/remove` | Quita una canción de la cola por su posición |
| `/queue` | Muestra la cola |
| `/clear` | Vacía la cola |
| `/forward` · `/backward` | Adelanta o retrocede segundos |
| `/stop` | Detiene y desconecta el bot |
| `/favoritos play` | Carga tus favoritos (❤️) en la cola; opcional: `cantidad` y `mezclar` |
| `/favoritos agregar` | Guarda una canción en tus favoritos (con búsqueda, o la que suena si no escribís nada) |
| `/favoritos ver` | Muestra tus favoritos (solo vos) y permite quitarlos |
| `/playlist crear` | Crea una playlist vacía |
| `/playlist agregar` | Agrega una canción, una playlist de YouTube entera o la que suena |
| `/playlist play` | Carga una playlist en la cola; opcional: `mezclar` |
| `/playlist ver` | Lista tus playlists, o las canciones de una con menú para quitarlas |
| `/playlist renombrar` · `/playlist borrar` | Cambia el nombre o borra una playlist (pide confirmación) |
| `/help` | Lista todos los comandos (se arma sola con los comandos cargados) |
| `/ping` | Muestra la latencia del bot en ms |

Los comandos que controlan la reproducción solo funcionan si estás en el mismo canal de voz que el bot.

---

## 🚀 Puesta en marcha (Docker)

Requisitos: **Docker** con Docker Compose. El bot corre con **Bun** dentro de su contenedor: no hace falta instalar nada más.

### Antes de empezar: tu app en el Developer Portal

En el [Developer Portal](https://discord.com/developers/applications) creá una aplicación (o usá una que ya tengas) y revisá:

- **Bot → Privileged Gateway Intents**: activá **Presence Intent**, **Server Members Intent** y **Message Content Intent**. El bot los pide al conectarse; si alguno está apagado, Discord lo rechaza con `Used disallowed intents` y no arranca.
- **Bot → Authorization Flow**: **Requires OAuth2 Code Grant** tiene que quedar **apagado** (si no, la invitación falla). **Public Bot** prendido si querés que otros lo inviten a sus servidores; apagado si es solo para vos.
- **Bot → Token**: el `token` del `.env` (con *Reset Token*). No lo compartas ni lo subas a ningún lado.
- **General Information → Application ID**: es el `botClientID` del `.env`. Tu propio ID de usuario de Discord va en `ownerID`.
- **Invitar el bot**: en **OAuth2 → URL Generator** marcá los scopes `bot` y `applications.commands`, y estos permisos: Ver canales, Enviar mensajes, Insertar enlaces, Leer el historial de mensajes, Usar emojis externos, Conectar y Hablar. Abrí la URL generada y elegí tu servidor.

### Instalación

1. **Configuración**

   ```bash
   cp .env.example .env
   cp application.example.yml application.yml
   ```

   - En `.env`: `token` y `botClientID` de tu bot ([Developer Portal](https://discord.com/developers/applications)), y contraseñas propias para `lavalinkPassword` y `YT_CIPHER_TOKEN`.
   - En `application.yml`: las mismas contraseñas en `server.password` y `plugins.youtube.remoteCipher.password`, y (opcional) el Client ID/Secret de una app de Spotify.
   - Plugin de YouTube: `YOUTUBE_PLUGIN_CHANNEL` en `.env` elige qué versión baja Lavalink al arrancar: `release` (última estable) o `dev` (último snapshot). Vacío usa la versión fija de `application.yml`. La versión en uso aparece en `docker compose logs lavalink` (líneas `[YouTubePlugin]`). Si tu `application.yml` es anterior a este ajuste, copiá la línea del plugin de YouTube (con `${YOUTUBE_PLUGIN_VERSION:...}`) y su `snapshot` desde `application.example.yml`.

2. **Levantar**

   ```bash
   docker compose up --build -d
   ```

   Levanta cuatro contenedores: `yt-cipher` (descifrado de YouTube), `spotify-tokener` (token de Spotify para álbumes, playlists y artistas), `lavalink` (audio) y `discord-bot`. Después de cambiar el código, el mismo comando reconstruye la imagen del bot.

   Los slash commands se registran solos cada vez que el bot arranca.

   Los favoritos y las playlists se guardan en `data/bot.db` (SQLite), en la carpeta `data/` del proyecto. Si movés el bot a otra PC, copiá esa carpeta.

   Opcional: con `DEV_GUILD_ID` en el `.env` (ID de tu servidor), el bot crea ahí `#notificaciones-bot` y avisa arranques, servidores nuevos o perdidos, errores no controlados y caídas de Lavalink. El canal es privado: solo lo ven el dueño del bot (`ownerID`) y los administradores. Necesita el permiso Gestionar canales.

### Desarrollo sin Docker (opcional)

Con [Bun](https://bun.sh) 1.4+ instalado: `bun install`, levantar solo Lavalink con `docker compose up -d lavalink` (en el `.env`, `lavalinkHost="localhost"`) y correr el bot con `bun start`. Bun lee el `.env` solo y ejecuta TypeScript directo, sin compilar. Para revisar tipos: `bun run typecheck`; para los tests: `bun test`.

### Token de YouTube (OAuth)

YouTube pide iniciar sesión para reproducir. Con `refreshToken: ""` y `skipInitialization: false` en `application.yml`, al arrancar Lavalink muestra en `docker compose logs lavalink` un código para `https://www.google.com/device`. Autorizá con una **cuenta secundaria** (no la principal), copiá el refresh token que aparece en el log a `application.yml` y poné `skipInitialization: true`.

### Emojis de los botones

Los íconos están en [`assets/emojis/`](assets/emojis). Los IDs de [`src/core/buttons/emojis.ts`](src/core/buttons/emojis.ts) son los de la app original: si usás tu propio bot, subí esos PNG en *Developer Portal → tu app → Emojis* y reemplazá los IDs.

> [!WARNING]
> Nunca subas `.env` ni `application.yml`: tienen tokens y contraseñas. Ya están en `.gitignore`.

---

## 📄 Licencia

Este proyecto usa la [licencia Apache 2.0](LICENSE): podés usarlo, modificarlo y redistribuirlo, **también con fines comerciales**.

Si redistribuís el código (tal cual o modificado), tenés que:

- Incluir una copia de la [licencia](LICENSE) y del archivo [NOTICE](NOTICE), que da el crédito a **BrayanBCode**.
- Marcar los archivos que cambiaste.
- No usar el nombre del autor para promocionar tu versión sin permiso.

## ✨ Autor

**BrayanBCode** — 🕸️ GitHub: [@BrayanBCode](https://github.com/BrayanBCode)
