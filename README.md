[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/BrayanBCode/SpiderSoundJs)

# 🕷️ Araña Sound

![logo](https://github.com/BrayanBCode/SpiderBot/assets/134159765/527b4a22-a501-4ba1-b2bf-d7eefd0e9fa4)

**Araña Sound** es un bot de música para Discord hecho con **Bun**, **discord.js 14**, **moonlink.js 5** y **Lavalink 4**, todo en Docker. Reproduce desde YouTube y Spotify, con una cola interactiva y controles por botones.

> [!NOTE]
> Proyecto retomado. El plan de trabajo está en [`docs/ROADMAP.md`](docs/ROADMAP.md).

---

## 📦 Características

- 🎵 YouTube (búsqueda, links y playlists) y **canciones sueltas de Spotify**.
- 📃 Cola interactiva con paginación, `/playnext`, `/forceplay`, `/remove`.
- 🔁 Repetición de canción o de cola, mezclar, adelantar y retroceder.
- 🎚️ Mensaje "Escuchando" con botones y emojis propios (tema araña).
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

Los comandos que controlan la reproducción solo funcionan si estás en el mismo canal de voz que el bot.

---

## 🚀 Puesta en marcha (Docker)

Requisitos: **Docker** con Docker Compose. El bot corre con **Bun** dentro de su contenedor: no hace falta instalar nada más.

1. **Configuración**

   ```bash
   cp .env.example .env
   cp application.example.yml application.yml
   ```

   - En `.env`: `token` y `botClientID` de tu bot ([Developer Portal](https://discord.com/developers/applications)), y contraseñas propias para `lavalinkPassword` y `YT_CIPHER_TOKEN`.
   - En `application.yml`: las mismas contraseñas en `server.password` y `plugins.youtube.remoteCipher.password`, y (opcional) el Client ID/Secret de una app de Spotify.

2. **Levantar**

   ```bash
   docker compose up --build -d
   ```

   Levanta tres contenedores: `yt-cipher` (descifrado de YouTube), `lavalink` (audio) y `discord-bot`. Después de cambiar el código, el mismo comando reconstruye la imagen del bot.

   Los slash commands se registran solos cada vez que el bot arranca.

### Desarrollo sin Docker (opcional)

Con [Bun](https://bun.sh) 1.4+ instalado: `bun install`, levantar solo Lavalink con `docker compose up -d lavalink` (en el `.env`, `lavalinkHost="localhost"`) y correr el bot con `bun start`. Bun lee el `.env` solo y ejecuta TypeScript directo, sin compilar. Para revisar tipos: `bun run typecheck`.

### Token de YouTube (OAuth)

YouTube pide iniciar sesión para reproducir. Con `refreshToken: ""` y `skipInitialization: false` en `application.yml`, al arrancar Lavalink muestra en `docker compose logs lavalink` un código para `https://www.google.com/device`. Autorizá con una **cuenta secundaria** (no la principal), copiá el refresh token que aparece en el log a `application.yml` y poné `skipInitialization: true`.

### Emojis de los botones

Los íconos están en [`assets/emojis/`](assets/emojis). Los IDs de [`src/core/buttons/emojis.ts`](src/core/buttons/emojis.ts) son los de la app original: si usás tu propio bot, subí esos PNG en *Developer Portal → tu app → Emojis* y reemplazá los IDs.

> [!WARNING]
> Nunca subas `.env` ni `application.yml`: tienen tokens y contraseñas. Ya están en `.gitignore`.

---

## 📄 Licencia

Este proyecto usa una [licencia propia](LICENCE.md): uso personal o educativo, **sin fines comerciales** y con **atribución obligatoria** a BrayanBCode. No se permite redistribuir el código tal cual sin permiso.

> Si vas a usar partes del código, por favor da créditos.

## ✨ Autor

**BrayanBCode** — 🕸️ GitHub: [@BrayanBCode](https://github.com/BrayanBCode)
