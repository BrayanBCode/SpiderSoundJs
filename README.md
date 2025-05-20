

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
````

2. Instalá las dependencias:

```bash
npm install
```

3. Copiá y configurá el archivo `.env` (o `config.js` según tu estructura):

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

* Node.js v18+
* Lavalink (correr en contenedor)
* Token de bot de Discord
* YouTube API key (No necesario)

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
├── commands/
│   ├── music/
│   └── dev/
├── class/
├── config/
├── utils/
├── main.ts
launchtest.js
docker-compose.yml
```

---

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).

> Si vas a usar partes del código, por favor da créditos.

---

## ✨ Autor

**Brayan BCode**
🕸️ GitHub: [@BrayanBCode](https://github.com/BrayanBCode)

---
