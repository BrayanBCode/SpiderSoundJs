

# Araña Sound Development

[![logo](https://i.postimg.cc/76XFG7cH/logo.png)](https://postimg.cc/zbbt4L86)

## ¿Qué es Araña Sound?

Araña Sound es un bot de música para Discord que reproduce música desde YouTube utilizando la librería YT_dlp. Nuestro objetivo es ofrecer un bot multipropósito centrado en la reproducción de música. Además de gestionar tu servidor con un sistema de avisos y sanciones configurables, Araña Sound incluirá una IA para interactuar con los usuarios del servidor.

### Características Principales:
- **Reproducción de Música**: Comandos como `/play`, `/stop`, `/pause`, `/skip`, `/queue`, entre otros.
- **Favoritos**: Guarda tus canciones favoritas para escucharlas fácilmente en el futuro.
- **Sugerencias Inteligentes**: Comandos como `/autoplay` y búsqueda avanzada para facilitar la selección de canciones.
- **Gestión de Servidor**: Sistema de avisos y sanciones configurables para gestionar tu servidor de manera eficiente.

¡Hola! Soy el desarrollador de Araña Sound y actualmente estoy trabajando en el proyecto por mi cuenta. Los colaboradores que tengo me asesoran y ayudan a pulir el código. ¡Cualquier ayuda es bienvenida!

## Índice

- [Invita al Bot](#invita-al-bot)
- [Cómo Descargar y Usar el Bot](#cómo-descargar-y-usar-el-bot)
- [Notas de Desarrollo](#notas-de-desarrollo)
- [Índice de Clases](#índice-de-clases)

## Invita al Bot

Puedes invitar tanto al bot oficial como al bot de pruebas a tu servidor de Discord:

- **Bot de Pruebas**: [Invita al Bot de Pruebas](https://discord.com/oauth2/authorize?client_id=1256395249417457775&permissions=3018878550&integration_type=0&scope=bot+applications.commands)
- **Bot Oficial**: [Invita al Bot Oficial](https://discord.com/oauth2/authorize?client_id=1177344170638180503&permissions=3018878550&integration_type=0&scope=bot+applications.commands)

## Cómo Descargar y Usar el Bot

1. Descarga e instala [Python 3.12](https://www.python.org/downloads/) o superior. Asegúrate de marcar la casilla "Add to Path" durante la instalación. Descarga el código desde [GitHub](https://github.com/BrayanBCode/SpiderBot).

   [![imagen](https://i.postimg.cc/FRkZsqYm/imagen-2024-08-31-225627848.png)](https://postimg.cc/wyHJww5b)

2. Crea/Obtén tu **Token**, **ClientID** y **ID** de Discord. Para obtenerlos, entra a [Discord Developers](https://discord.com/developers/docs/intro), ve a **Applications** y haz clic en **"New Application"**. Una vez creado tu bot, en la sección **"General Information"** encontrarás el **"Application ID"** (ClientID) de tu bot.

   [![imagen](https://i.postimg.cc/bw6WZ7w2/imagen-2024-08-31-233641331.png)](https://postimg.cc/FYLDqnc9)

   En la sección de Bot, encontrarás el botón para **"Reset Token"** con este boton obtendras tu Token.

   [![imagen](https://i.postimg.cc/zfbtV3Q9/imagen-2024-08-31-234156719.png)](https://postimg.cc/hJnbY4cr)

   Asegúrate de marcar las casillas correspondientes, que se encuentran en la sección de Bot más abajo.

   [![imagen](https://i.postimg.cc/tT6Mm7th/imagen-2024-08-31-233807435.png)](https://postimg.cc/ygVjD1Gd)

3. Abre la carpeta `SpiderBot-Main` descargada y entra en `src`. Edita el archivo `.env` que se encuentra allí para agregar el Token y ClientID de tu bot.

4. Ejecuta el archivo `ArañaSound.bat` en la carpeta descargada. Este archivo descargará las dependencias necesarias y ejecutará el bot.

5. ¡Disfruta del bot!

## Notas de Desarrollo

En esta sección se incluyen ejemplos de uso para algunas de las clases implementadas en el código.

### Índice de Clases

- [User Class](#user-class)
- [Guild Class](#guild-class)

### User Class

La clase `User` gestiona los datos del usuario en la base de datos. Aquí tienes un ejemplo de cómo usarla:

```python
# Crear una instancia de conexión a la base de datos
mongoConn = MongoDBConnection("mongodb://localhost:27017/", "mi_base_de_datos")
mongoConn.connect()

# Datos de usuario
userData = {
    "_id": 1,
    "fav": {
        "albums": {
            "example": {
                "name": "Adele mix",
                "songs": [
                    {
                        "title": "Adele - Skyfall (Official Lyric Video)",
                        "url": "https://www.youtube.com/watch?v=DeumyOzKqgI",
                        "duration": 290,
                        "uploader": "Adele"
                    }
                ]
            }
        }
    }
}

# Crear un modelo de usuario
usuario = User(mongoConn, userData=userData)

# Insertar el usuario en la base de datos
usuario.insert()

# Actualizar los datos del usuario
usuario.addAlbum("newAlbum", {
    "name": "New Album Mix",
    "songs": [
        {
            "title": "New Song",
            "url": "https://www.example.com/new_song",
            "duration": 200,
            "uploader": "New Artist"
        }
    ]
})
usuario.update()

# Eliminar el usuario de la base de datos
usuario.delete()

# Desconectar de la base de datos
mongoConn.disconnect()
```

### Guild Class

La clase `Guild` gestiona la configuración de música para los servidores. Aquí tienes un ejemplo de cómo usarla:

```python
# Crear una instancia de conexión a la base de datos
mongoConn = MongoDBConnection("mongodb://localhost:27017/", "mi_base_de_datos")
mongoConn.connect()

# Datos de la guild
guildData = {
    "_id": 1,
    "music-setting": {
        "sourcevolumen": 80,
        "volume": 60
    }
}

# Crear un modelo de guild
guild = Guild(mongoConn, guildData=guildData)

# Insertar la guild en la base de datos
guild.insert()

# Modificar la configuración de música
guild.setMusicSetting("volume", 75)
guild.update()

# Buscar una guild por ID
guildData = guild.findOne({"_id": 1})

# Desconectar de la base de datos
mongoConn.disconnect()
```
