## Araña Sound - EN DESARROLLO ' puto
<img src="https://github.com/BrayanBCode/ProyectoFinalKodland/assets/134159765/7f81ca3a-6e63-437d-baaf-6799bca6109c" alt="Araña Sound Logo" width="50%">

El bot esta hosteado las 24/7.
[Invita Araña Sound a tu servidor](https://discord.com/api/oauth2/authorize?client_id=1177344170638180503&permissions=8&scope=bot)

## Bot de Musica de discord
El bot es capaz de reproducir musica utilizando busquedas de youtube, el bot cuenta con una interfaz amigable e intuitiba para el usuario, el bot soporta multiple servidores al mismo tiempo lo que significa que se puede utilizar en multiples servidores al mismo tiempo, el bot se conecta a **un canal de voz** por servidor, cuando el usuario que quiera utilizarlo debe esciribir el comando =play o =p para utilizar este comando se debe escibir en un canal de texto el cual el bot tenga acceso para utilizar el comando, se debe escribir =play SkyFall o el url de la cancion o video que quieras que el bot reproduzca el audio.

### Guia de comandos
El prefijo del bot es " = " el prefijo es aquel caracter el cual el bot utiliza para darse cuenta de si lo que escribio el usuario es un comando o simplemente texto

+ **help** - Muestra la guia de comandos.
+ **play** - Para reproducir música, simplemente escribe **=play** seguido del nombre de la canción, el artista o la URL de la canción que desees escuchar.
+ **stop** - Para pausar la musica utilize **=stop**, para reanudar la musica utilize **=stop** nuevamente.
+ **skip** - Para saltear una cancion utilize **=skip**, para saltear varias agrege un numero, ejemplo: **=skip 3**.
+ **queue** - Muestra la playlist y la cancion que se esta reproduciendo actualmente.
+ **remove** - Quita de la playlist la cancion que el usuario desee ejemplo: **=remove 5**.
+ **clear** - Limpia la playlist.
+ **loop** - Activa el modo loop de la playlist lo que hace que se repita indefinidamente la playlist.

## Instalacion
### Instalacion de librerias necesarias
pipenv

discord.py

youtube-search-python

pytube

Flask

Flask-SQLAlchemy
#### Como instalarlas
pip install pipenv

pipenv install discord.py

pipenv install youtube-search-python

pipenv install pytube

pipenv install Flask

pipenv install Flask-SQLAlchemy

### Adicion al PATH necesaria
Se debe añadir al path el archivo bin encontrado en la carpeta "utils\ffmpeg-master-latest-win64-gpl-shared\bin"

![BIN](https://github.com/BrayanBCode/ProyectoFinalKodland/assets/134159765/c5fbac21-2854-40ef-9c06-2dd9f4ce59cc)

Para añadir bin al PATH utilize el buscador de windows y escriba Variables de entorno
![Variable de entrono busqueda](https://github.com/BrayanBCode/ProyectoFinalKodland/assets/134159765/7fa8bdb3-e799-4bc0-89d5-e35258d4de34)

![**](https://github.com/BrayanBCode/ProyectoFinalKodland/assets/134159765/aed77a4d-5d0c-4706-aa17-ba48bfceccea)

Una vez dentro deben clikear 2 veces en donde dice PATH y agregarle la direccion del archivo BIN y listo
![image](https://github.com/BrayanBCode/ProyectoFinalKodland/assets/134159765/ceb729a3-0daa-40c8-b661-d5199a0018ea)

## Parches
+ 1.0 - Fixeo de error de borrado de playlist y adicion de desconexion por ausencia de usuario
+ 2.0 - Adicion de comando Loop
+ 3.0 - Implementacion de base de datos

## Funciones adicionales del bot
+ funciona en multiplas servidores al mismo tiempo
+ Descarga las canciones directamente de YT obteniendo la claidad mas alta disponible (Terminada la reprouccion el bot elimina el archivo).
+ Es capaz de detectar cuando el bot se queda solo en un canal de voz y cuando esta inactivo por 2 minutos desconectadose automaticamente.
+ Cada servidor tiene una playlist designada por defecto, lo que significa que cada servidor puede escuchar las canciones o audios que quiera.
+ Reporduce de manera automatica la siguiente cancion en la playlist.
+ La playlist del servidor en el que el bot se desconecta se borra.
+ Se utiliza Embeds para enviar los mensajes del bot para que sea mas estetico y amigable a la vista. 


