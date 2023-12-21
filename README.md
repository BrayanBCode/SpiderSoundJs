# Proyecto Final Kodland
Este bot fue desarrollado para el poryecto final de Kodland del curso de Python Pro 2023

## Araña Sound
<img src="https://github.com/BrayanBCode/ProyectoFinalKodland/assets/134159765/7f81ca3a-6e63-437d-baaf-6799bca6109c" alt="Araña Sound Logo" width="50%">

El bot suele estar hosteado 24/7 a no ser que no pueda tenerlo hosteado.
[Invita Araña Sound a tu servidor](https://discord.com/api/oauth2/authorize?client_id=1177344170638180503&permissions=8&scope=bot)


## Bot de Musica de discord
Mi proyecto consta de un bot de discord el cual es capaz de reproducir musica utilizando busquedas de youtube, el bot consta de una interfaz amigable e intuitiba para el usuario, el bot soporta multiple servidores al mismo tiempo lo que significa que se puede utilizar en multimples servidores al mismo tiempo, el bot se conecta a *un canal de voz* cuando el usuario que quiera utilizarlo ponga el comando =play o =p para utilizar este comando se debe escibir en un canal de texto el cual el bot tenga acceso para utilizar el comando se debe escribir =play SkyFall o el nombre de la cancion o video que quieras que el bot reproduzca el audio.

### Guia de comandos
EL prefijo del bot es " = " el prefijo es aquel caracter el cual el bot utiliza para darse cuenta de si lo que escribio el usuario es un comando o simplemente texto

+ **play** - Para reproducir música, simplemente escribe **=play** seguido del nombre de la canción, el artista o la URL de la canción que desees escuchar.
+ **stop** - Para pausar la musica utilize **=stop** una vez para reanudar la musica utilize **=stop** nuevamente.
+ **skip** - Para saltear una cancion utilize **=skip**, para saltear varias agrege un numero, ejemplo: **=skip 3**.
+ **queue** - Muestra la playlist y la cancion que se esta reproduciendo actualmente.
+ **remove** - Quita de la playlist la cancion que el usuario desee ejemplo: **=remove 5**.
+ **clear** - Limpia la playlist".

### Instalacion de librerias necesarias
pipenv
discord.py
youtube-search-python
pytube

#### Como instalarlas
pip install pipenv
pipenv install discord.py
pipenv install youtube-search-python
pipenv install pytube

### Adicion al PATH necesaria
Se debe añadir al path el archivo bin encontrado en la carpeta "utils\ffmpeg-master-latest-win64-gpl-shared"

![BIN](https://github.com/BrayanBCode/ProyectoFinalKodland/assets/134159765/c5fbac21-2854-40ef-9c06-2dd9f4ce59cc)

Para añadir bin al PATH utilize el buscador de windows y escriba Variables de entorno
![Variable de entrono](https://github.com/BrayanBCode/ProyectoFinalKodland/assets/134159765/7fa8bdb3-e799-4bc0-89d5-e35258d4de34)

![PATH1](https://github.com/BrayanBCode/ProyectoFinalKodland/assets/134159765/a15ef044-cade-4972-8d05-5ab317184c17)



### Parches
1.0 - Fixeo de error de borrado de playlist y adicion de desconexion por ausencia de usuario



