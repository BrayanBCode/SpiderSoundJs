# Araña Sound Development
![logo](https://github.com/BrayanBCode/SpiderBot/assets/134159765/527b4a22-a501-4ba1-b2bf-d7eefd0e9fa4)

### Warning Lib FFMPEG
La libreria solo srive para windows si se quiere utilizar en linux borre este archivo o ignorelo ya que no interfiere, Requierements.txt ya incluye una libreria compatible con linux 

### Implementaciones y por implementar - To Do List

Implementado:
+ Sección de Musica
	+ Slash Commands para sección de Musica.
	+ Logica de búsqueda, reproducción y gestión de Musica.
	+ Interfaz de canción en reproducción.
	+ Comandos básicos de Musica.

Por implementar:
+ Sección de Bot:
	+ Agregar descripción personalizada al Bot
	+ Implementar compatibilidad de los comandos ya implementados (Slash Commands) con comandos Prefix
	+ Dashboard interactiva para Dev's

+ Sección de Musica:
	+ Panel de control de reproducción - Botones en el ultimo mensaje ejemplo: Botón de Siguiente canción, pausar canción, parar reproducción, mostrar listado de canciones
	+ Manejo de errores en el código
	+ Dashboard interactiva para usuarios y para Dev's (prioridad a Dev)

## Bot de pruebas: 

[https://discord.com/oauth2/authorize?client_id=1114600638043660288&permissions=8&scope=bot+applications.commands](Invita al bot ArañaBot a tu Servidor - Este es un utilizado para la prueba de codigo)

## Código utilizado para el testeo

Este código crea de ser necesario un txt y imprime en el lo que se encuentre dentro de file.write() - en este caso es un JSON
```python
with open("output.txt", "w", encoding="utf8") as file:
    file.write(json.dumps(info, indent=4))  # Convertimos el diccionario a una cadena JSON para escribirlo en el archivo
```

