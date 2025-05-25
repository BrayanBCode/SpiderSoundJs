# 🕷️ Araña Sound

![logo](https://github.com/BrayanBCode/SpiderBot/assets/134159765/527b4a22-a501-4ba1-b2bf-d7eefd0e9fa4)

**Araña Sound** es un bot de música para Discord creado con Node.js, Discord.js y Lavalink. Reproduce música desde YouTube, maneja una cola interactiva y cuenta con controles avanzados.

---

## 📦 Características

- 🎵 Reproducción de música desde YouTube
- 📃 Sistema de cola interactiva
- 🔄 Autoplay (sin implementar) y loop
- 🎚️ Controles mediante botones
- 🧪 Modo desarrollador para pruebas y paginadores
- ⚙️ Modular y fácil de extender
- 🐳 Utilizar con Docker

---

## 🚀 Instalación

### Usar Docker

1. Cloná el repositorio:

```bash
git clone https://github.com/BrayanBCode/SpiderBot.git
cd SpiderBot
```

2. Instalá las dependencias:

```bash
npm install
```

3. Copiá y configurá los archivos `.env` y `application.yml` (o `config.js` según tu estructura):

```bash
cp .env.example .env
cp application.example.yml application.yml
```

4. Iniciá el bot:

```bash
docker-compose up --build
```

---

## 🧰 Requisitos

- Node.js v18+
- Lavalink (correr en contenedor)
- Token de bot de Discord
- YouTube API key (No necesario)

---

## 🧪 Comandos principales

| Comando   | Descripción                     |
| --------- | ------------------------------- |
| `/play`   | Reproduce una canción           |
| `/queue`  | Muestra la cola de reproducción |
| `/skip`   | Salta a la siguiente canción    |
| `/stop`   | Detiene la música               |
| `/pause`  | Pausa la canción actual         |
| `/resume` | Reanuda la reproducción         |

---

## 🧑‍💻 Contribuir

Si querés ayudar al desarrollo:

1. Hacé un fork del proyecto
2. Creá una rama (`git checkout -b feature/nombre`)
3. Hacé tus cambios
4. Hacé push a tu rama y creá un PR

---

## 📂 Estructura del proyecto (simplificada)

```
src/
├── bot/                         # Lógica del cliente de Discord
│   ├── BotClient.ts
│   └── logger.ts
│
├── config/                      # Configuración general
│   └── config.ts
│
├── core/                        # Núcleo del bot
│   ├── commands/                # Comandos divididos por categoría
│   │   ├── dev/
│   │   ├── misc/
│   │   └── music/
│   │
│   ├── events/                  # Manejadores de eventos
│   │   ├── discord/
│   │   ├── lavalink/
│   │   └── nodeManager/
│   │
│   └── handlers/                # Registro de comandos y eventos
│
├── lavalink/                    # Integración con Lavalink
│
├── modules/                     # Lógica del reproductor, botones, colas
│   ├── buttons/
│   │
│   ├── strategy/                # Estrategias de reproducción
│   │
│   └── messages/                # Componentes de mensajes embebidos, etc.
│
├── types/                       # Tipos e interfaces de TS
│   ├── interfaces/
│   └── types/
│
├── utils/                       # Funciones utilitarias
│
├── index.ts                     # Punto de entrada del bot
└── env.ts                       # Carga y validación de variables de entorno


launchtest.js
docker-compose.yml
```

---

## Problemas con el servidor Lavalink

Ante problemas como "Encuentra la música pero no reproduce" o "No encuentra resultados" revisa los logs y verifica que no haya salido alguna version del plugin youtube-plugin

Los logs pueden no mostrar dicho error ya que el error puede ser reciente e indocumentado recomiendo revisar el servidor de discord de [Lavalink](https://discord.gg/7mZuAGQdBH) donde se reportan y publican las actualizaciones de dicho plugin

Al cambiar el plugin no basta solo con reemplazar el archivo además debes modificar el archivo `application.yml` y modificar la línea con la version actual del plugin

```yml
- dependency: 'dev.lavalink.youtube:youtube-plugin:1.13.2'
```

Suelo estar atento a dichos cambios por ende revisen los lanzamientos recientes

---

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).

> Si vas a usar partes del código, por favor da créditos.

---

## ✨ Autor

**BrayanBCode**
🕸️ GitHub: [@BrayanBCode](https://github.com/BrayanBCode)

---
