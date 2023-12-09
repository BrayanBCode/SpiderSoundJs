# ProyectoFinalKodland


# Bot de Musica
## Comandos:
- [x] Añadir comando " Play "
- [x] Añadir comando " stop "
- [x] Añadir comando " clear "
- [x] Añadir comando " pause "
- [x] Añadir comando " resume "
- [ ] Añadir comando " loop "
- [ ] Añadir comando " download "
- [x] Añadir comando " queue "

## Funcionalidad:
- Play: El comando debe añadir a una **playlist** las canciones que pida el usuario, el comando debe admitir *urls* de YouTube, *playlist* de Youtube y *busquedas* de Youtube
+ Stop: El comando cancela la reproducción de la canción actual y pausa la playlist
+ Clear: El comando limpia la playlist pero no cancela la reproducción de la canción actual
+ Pause: Detiene la reproducción
+ Resume: Reanuda la reproducción
+ Loop: El comando activa el bucle de reproducción, al usarse de nuevo lo desactiva, por defecto desactivado
+ Download: El Bot trata de enviar el archivo .mp4 que se esta en reproducción
+ Queue: Muestra la cola de reproducción, y la canción que se esta escuchando 

## Logica:

---

Para crear un embed en Discord, es útil tener conocimientos básicos sobre el formato JSON y entender cómo se estructuran los mensajes embed. Aquí hay algunos conceptos clave y cosas que debes saber para crear un embed:

### 1. Estructura del mensaje Embed:
Un mensaje embed en Discord tiene varios campos como `title`, `description`, `color`, `fields`, `thumbnail`, `image`, `footer`, entre otros. Estos campos te permiten personalizar la apariencia del mensaje.

### 2. Creación de un Embed:
Puedes usar la clase `discord.Embed` para crear un mensaje embed. Aquí tienes un ejemplo básico:

```python
from discord import Embed

embed = Embed(title="Título del Embed", description="Descripción del Embed", color=0x7289DA)
embed.set_thumbnail(url="URL de la miniatura")
embed.add_field(name="Campo 1", value="Valor 1", inline=False)
embed.add_field(name="Campo 2", value="Valor 2", inline=True)
embed.set_footer(text="Texto del pie de página")
```

### 3. Atributos importantes del Embed:
   - `title`: El título del embed.
   - `description`: La descripción del embed.
   - `color`: El color del borde del embed (en hexadecimal).
   - `fields`: Campos que muestran información relevante.
   - `thumbnail` e `image`: URLs para mostrar imágenes en miniatura o imágenes más grandes.
   - `footer`: Texto que aparece en la parte inferior del embed.

### 4. Personalización adicional:
Puedes personalizar aún más el embed ajustando otras propiedades como `author`, `timestamp`, `URLs`, entre otros.

### 5. Enviando el Embed:
Una vez que hayas configurado tu embed, puedes enviarlo a un canal específico usando `await ctx.send(embed=embed)` dentro de un comando de Discord.

### Ejemplo de uso:
Aquí tienes un ejemplo básico de cómo enviar un embed:

```python
from discord import Embed

@bot.command()
async def mi_comando(ctx):
    embed = Embed(title="Título del Embed", description="Descripción del Embed", color=0x7289DA)
    embed.set_thumbnail(url="URL de la miniatura")
    embed.add_field(name="Campo 1", value="Valor 1", inline=False)
    embed.add_field(name="Campo 2", value="Valor 2", inline=True)
    embed.set_footer(text="Texto del pie de página")

    await ctx.send(embed=embed)
```

Este código enviará el embed al canal donde se haya llamado al comando `mi_comando`.

Recuerda ajustar los valores de los campos según tus necesidades y preferencias visuales para crear embeds atractivos y útiles para tus usuarios en Discord.

---

# Errores y soluciones

+ Los Embed tienen un máximo de caracteres aprox 6000 caracteres asique si la playlist es demasiado larga debo separar la muestra de la playlist este separa en secciones por lo tanto el comando Queue debe poder mostrar por separado o implementar una interfaz que lo permita.
+ Loop me esta costando implementar una solución compatible con skip.
+ El código de desconexión por inactividad tirar error. Es posible que el codigo se ejecute 2 veces - una para la desconecion y la otra porque el evento de async def on_voice_state_update(member, before, after) detecta todos los cambios en el estado de voz.
+ Posible error por la API de discord y Youtube el cual tira error cuando un video esta en emision, directo, es muy largo o no se descarga bien esto genera que el bot se trabe por bastante tiempo. Solucion temporal Reiniciarlo
