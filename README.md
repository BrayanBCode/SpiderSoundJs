# Araña Sound Development

![logo](https://github.com/BrayanBCode/SpiderBot/assets/134159765/527b4a22-a501-4ba1-b2bf-d7eefd0e9fa4)

### Warning Lib FFMPEG

La libreria solo srive para windows si se quiere utilizar en linux borre este archivo o ignorelo ya que no interfiere solo ocupa espacio, Requierements.txt ya incluye una libreria compatible con linux

### Implementaciones y por implementar - To Do List

Las prioridades se marcaran como [Baja], [Media], [Alta] de no tener prioridad se tomara como [Baja]

- Implementaciones en General:

    - [ ] [baja] interfaz de desarrollador, hostear una pagina para que los owners de cada servidor tengan un dashboard interactivo.

- Sección de Musica:

    - Por implementar:

        - [ ] [baja] Base de datos, usaremos MongoDB por ahora.

    - Comandos:
        - [ ] [Alta] Help - Muestra la lista de comandos.
        - [ ] [Alta] Clear - limpia la lista de reprodución.
        - [ ] [Media] volume - Sube o baja el volumen interno del bot, el valor se debe guardar en la base de datos.
        - [ ] [Media] loop - Reproduce en loop la cancion actual.
        - [ ] [Alta] loopqueue - Reproduce en loop la lista de reprodución, osea al finalizar la cancion actual se debe agregar al final de la cola.
        - [ ] [Baja] join - El bot se une al canal de voz.
        - [ ] [baja] Revisar el tiempo de espera para la desconexion por inactividad, el bot se desconecta demaciado rapido.
        - [ ] [Alta] Agregar try/catch a todos los comandos para evitar crasheos (utilizar logger.error() para reportar los errores)

- Sección de Moderacion:

    - Por Implementar:
        - [ ] [Alta] Reaction rols - Al reaccionar a cierto mensaje con un emoji espesifico el bot debe darle un rol al usuario que reacciono. (Ejemplo: si reacionas con 🟩 a X mensaje se te dara el rol "Soy Verde")
        - [ ] [Alta] Comandos basicos de moderacion (/ban, /kick, /Timeout, /warn, /mute, /clear, etc)
        - [ ] [Baja] AntiSpam protection - Eliminar mensajes que incluyan Links
        - [ ] [Baja] Auto Moderación - Filtrado de insultos, texto repetido
        - [ ] [Alta] Mensajes customs para nuevos miembros
        - [ ] [Alta] Dar un rol a nuevos miembros

- Sección de Musica: (Deprecated)

    - [x] Slash Commands para sección de Musica.
    - [x] Logica de búsqueda, reproducción y gestión de Musica.
    - [x] Interfaz de canción en reproducción.
    - [x] Comandos básicos de Musica.
    - [ ] Eventos de gestion, trackEnd, trackStart, etc.
    - [ ] Arreglar Playing message

- Sección de Bot: (Deprecated)

    - [ ] Agregar descripción personalizada al Bot
    - [ ] Implementar compatibilidad de los comandos ya implementados (Slash Commands) con comandos Prefix
    - [ ] Dashboard interactiva para Dev's

- Sección de Musica: (Deprecated)

    - [ ] Panel de control de reproducción - Botones en el ultimo mensaje ejemplo: Botón de Siguiente canción, pausar canción, parar reproducción, mostrar listado de canciones
    - [ ] Manejo de errores en el código
    - [ ] Dashboard interactiva para usuarios y para Dev's (prioridad a Dev)

## Working in

- /queue command - Implementación y correxion de errores
- Sistema de desconexion

## Distribución de carpetas

Tratemos de separar el codigo en subcarpetas asi mantenemos el orden por ejemplo en donde va a ir la logica de clases va en src/class lo que son eventos que el bot necesita en la carpeta src/Events y asi cualquier cosa se ve entre el equipo la distribución

Todo lo que no se vaya a utilizar pero no queremos eliminarlo le agregaremos la etiqueta (deprecated) hay varios ejemplos por el codigo xD

##

## Bot de pruebas:

[Invita al bot ArañaBot a tu Servidor - Este es un utilizado para la prueba de codigo](https://discord.com/oauth2/authorize?client_id=1114600638043660288&permissions=8&scope=bot+applications.commands)

## Dev Notes

Para ejecutar el bot usar
`node launchtest.js` o `docker-compose up --build`
