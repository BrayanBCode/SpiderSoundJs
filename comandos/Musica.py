import os, re, asyncio, discord
from discord.ext import commands
from discord import Embed, FFmpegPCMAudio
from youtubesearchpython import VideosSearch
from pytube import Playlist, YouTube
from utils.db import *

CurrentlyPlaying = {}
inactive_timers = {}
ActiveLoop = {}


async def play_next(ctx):
    GuildActual = ctx.guild.id
    voice_client = ctx.voice_client
    with app.app_context():
        if len(get_all_items(GuildActual)) > 0:
            if not voice_client.is_playing():
                video_url = str(get_all_items(GuildActual)[0][1])
                remove_item_by_id(GuildActual, 1)
                try:
                    video = YouTube(video_url)
                    best_audio = video.streams.get_audio_only()
                    filename = best_audio.default_filename
                    best_audio.download(filename=filename, output_path='Musica')

                    audio_source = FFmpegPCMAudio(os.path.join('Musica', filename))
                    voice_client.play(audio_source, after=lambda e: (
                        clearMusicFolder()

                    ))

                    # Enviar mensaje con la canción que está siendo reproducida
                    duration = video.length
                    mins, secs = divmod(duration, 60)
                    hours, mins = divmod(mins, 60)
                    duration_formatted = '{:02d}:{:02d}:{:02d}'.format(hours, mins, secs)

                    embed = Embed(title="Reproduciendo", description=f"{video.title} - {video.author}\n[Ver en Youtube]({video_url})\nDuración: {duration_formatted}", color=0x6a0dad)

                    embed.set_thumbnail(url=video.thumbnail_url)
                    await ctx.send(embed=embed)

                    CurrentlyPlaying[GuildActual] = {
                        'title': video.title,
                        'artist': video.author,
                        'duration': duration_formatted,
                        'url': video_url,
                        'thumbnail': video.thumbnail_url,
                        'author': video.author
                    }

                    await play_next_controler(ctx)
                    await asyncio.sleep(30)
                except Exception as e:
                    await ctx.send(f'Error al descargar la canción: {str(e)}')
                    print(f'Error al descargar la canción: {str(e)}')

async def play_next_controler(ctx):
    while True:
        voice_client = ctx.guild.voice_client
        GuildActual = ctx.guild.id

        if voice_client.is_playing():
            while voice_client.is_playing():
                await asyncio.sleep(1)
            continue

        if len(get_all_items(GuildActual)) > 0:
            await play_next(ctx)
        elif ActiveLoop[GuildActual]:
            video_url = CurrentlyPlaying[GuildActual]['url']
            add_item(GuildActual,[{'url': str(video_url)}])
            await play_next(ctx)
        else: 
            break

        if len(get_all_items(GuildActual)) == 0:
            await asyncio.sleep(5)
            if len(get_all_items(GuildActual)) == 0:
                break
        
        await asyncio.sleep(2)
        print("play_next_controler: En reproduccion")

async def check_voice_activity(guild): # Esta función verificará si el bot está inactivo en un canal de voz durante 2 minutos y lo desconectará
    while True:
        voice_client = guild.voice_client
        if voice_client and voice_client.channel:
            # Verificar si el bot está solo en el canal de voz
            if len(voice_client.channel.members) == 1 and voice_client.channel.members[0] == guild.me or not voice_client.is_playing():
                await asyncio.sleep(120)  # Esperar 2 minutos para verificar la inactividad
                if len(voice_client.channel.members) == 1 and voice_client.channel.members[0] == guild.me or not voice_client.is_playing():
                    await voice_client.disconnect()
                    print(f"El bot ha sido desconectado del canal de voz en '{guild.name}' debido a la inactividad.")
                    if check_folder_contents():
                        clearMusicFolder()
                    # Verificar si la clave existe antes de intentar eliminarla
                    if guild.id in inactive_timers:
                        inactive_timers.pop(guild.id)  # Eliminar el temporizador de inactividad para este servidor
        await asyncio.sleep(10)  # Verificar la inactividad cada 10 segundos

async def startup(bot):
    StartupLoop(bot)

    crear_carpeta_si_no_existe()

    with app.app_context():
        eliminar_entradas_de_todas_las_tablas()

def StartupLoop(bot):
    ids_servidores = bot.guilds
    for servidor_id in ids_servidores:
        ActiveLoop[servidor_id.id] = False

def check_folder_contents():
    folder_path = './Musica'  # Ruta a la carpeta

    # Lista los archivos en la carpeta
    files_in_folder = os.listdir(folder_path)

    # Comprueba si hay algún archivo en la carpeta
    if files_in_folder:
        print("La carpeta contiene archivos.")
        return True
    else:
        print("La carpeta está vacía.")
        return False

def clearMusicFolder():
    archivos = os.listdir('./Musica')
    if archivos:
        for archivo in archivos:
            try:                
                os.remove(os.path.join('./Musica', archivo))
                print(f"Archivo '{archivo}' eliminado correctamente.")
            except Exception as e:
                continue  # Pasar al siguiente archivo si no se puede eliminar

def crear_carpeta_si_no_existe():
    nombre_carpeta = 'Musica'
    
    ruta_carpeta = os.path.join(os.getcwd(), nombre_carpeta)
    
    if not os.path.exists(ruta_carpeta):
        try:
            os.makedirs(ruta_carpeta)
            print(f"Carpeta '{nombre_carpeta}' creada exitosamente.")
        except OSError as e:
            print(f"Error al crear la carpeta '{nombre_carpeta}': {e}")
    else:
        print(f"La carpeta '{nombre_carpeta}' ya existe.")

async def Event(member, before, after, bot):
    if member == bot.user and after.channel:
        afterguild = after.channel.guild

        if afterguild.id not in inactive_timers:
            inactive_timers[afterguild.id] = bot.loop.create_task(check_voice_activity(afterguild))
    try:
        beforeguild = before.channel.guild
        if before.channel and not after.channel and member == bot.user:  # Se desconectó de un canal de voz
            remove_all_items(beforeguild.id) # Borrar la lista de reproducción del servidor
            print(f"La lista de reproducción para el servidor {beforeguild.name} ha sido limpiada.")
    except:
        print(f"Evento de Voz detectado - Usuario: {member} en {member.guild.name}")

# ------------
        
async def stop(ctx):
    voice_client = ctx.guild.voice_client

    if voice_client.is_playing():
        voice_client.pause()
        await ctx.send("Canción pausada")
    elif voice_client.is_paused():
        voice_client.resume()
        await ctx.send("Canción reanudada")
    else:
        await ctx.send("No hay ninguna canción en reproducción para pausar o reanudar.")

async def queue(ctx, bot):
    GuildActual = ctx.guild.id
    songs_info = get_all_items(GuildActual)  # Obtener canciones de la base de datos

    if songs_info:
        songs = [info[1] for info in songs_info]  # Obtener las URL de las canciones

        embed = Embed(title="Lista de Reproducción", color=0x6a0dad)
        max_videos_to_display = 5  # Número máximo de videos para mostrar en una página
        total_duration = sum(YouTube(song_url).length for song_url in songs)  # Duración total de la lista de reproducción en segundos
        total_mins, total_secs = divmod(total_duration, 60)
        total_hours, total_mins = divmod(total_mins, 60)
        total_duration_formatted = '{:02d}:{:02d}:{:02d}'.format(total_hours, total_mins, total_secs)
        embed.set_footer(text=f"Página 1 - Duración total de la lista de reproducción: {total_duration_formatted}")

        current_song = CurrentlyPlaying.get(GuildActual)
        if current_song:
            current_song_url = current_song['url']
            embed.insert_field_at(
                index=0,
                name=f"**Reproduciendo Ahora**\n[{current_song['title']}] | [{current_song['author']}]",
                value=f"Duración: {current_song['duration']}\n[Ver en YouTube]({current_song_url})",
                inline=False
            )
            embed.set_thumbnail(url=current_song['thumbnail'])

        start_idx = 0
        end_idx = min(len(songs), max_videos_to_display)
        songs_to_display = songs[start_idx:end_idx]

        # Mostrar lista de reproducción
        for idx, song_url in enumerate(songs_to_display, start=start_idx + 1):
            video = YouTube(song_url)
            duration = video.length
            mins, secs = divmod(duration, 60)
            hours, mins = divmod(mins, 60)
            duration_formatted = '{:02d}:{:02d}:{:02d}'.format(hours, mins, secs)

            embed.add_field(
                name=f"{idx}. [{video.title}] | [{video.author}]",
                value=f"Duración: {duration_formatted}\n[Ver en YouTube]({song_url})",
                inline=False
            )

        message = await ctx.send(embed=embed)

        if len(songs) > max_videos_to_display:
            await message.add_reaction('◀️')  # Flecha izquierda
            await message.add_reaction('▶️')  # Flecha derecha

            def check(reaction, user):
                return user == ctx.author and str(reaction.emoji) in ['◀️', '▶️']

            while True:
                try:
                    reaction, user = await bot.wait_for('reaction_add', timeout=60.0, check=check)

                    if str(reaction.emoji) == '▶️' and end_idx < len(songs):
                        start_idx = end_idx
                        end_idx = min(start_idx + max_videos_to_display, len(songs))
                    elif str(reaction.emoji) == '◀️' and start_idx > 0:
                        end_idx = start_idx
                        start_idx = max(0, end_idx - max_videos_to_display)

                    songs_to_display = songs[start_idx:end_idx]

                    embed.clear_fields()

                    if current_song:
                        embed.insert_field_at(
                            index=0,
                            name=f"**Reproduciendo Ahora**\n[{current_song['title']}] | [{current_song['author']}]",
                            value=f"Duración: {current_song['duration']}\n[Ver en YouTube]({current_song_url})",
                            inline=False
                        )
                        embed.set_thumbnail(url=current_song['thumbnail'])

                    for idx, song_url in enumerate(songs_to_display, start=start_idx + 1):
                        video = YouTube(song_url)
                        duration = video.length
                        mins, secs = divmod(duration, 60)
                        hours, mins = divmod(mins, 60)
                        duration_formatted = '{:02d}:{:02d}:{:02d}'.format(hours, mins, secs)

                        embed.add_field(
                            name=f"{idx}. [{video.title}] | [{video.author}]",
                            value=f"Duración: {duration_formatted}\n[Ver en YouTube]({song_url})",
                            inline=False
                        )

                    await message.edit(embed=embed)
                    await reaction.remove(user)

                except asyncio.TimeoutError:
                    break               
    else:
        embed = Embed(description="No hay lista de reproducción para este servidor.", color=0x6a0dad)
        await ctx.send(embed=embed)

async def skip(ctx, command: int = 1):
    GuildActual = ctx.guild.id
    voice_client = ctx.guild.voice_client

    if command <= 0:
        await ctx.send("Por favor, proporciona un número positivo de canciones para saltar.")
        return

    if command == 1:
        voice_client.stop()
        await play_next(ctx)
        return

    # Obtener las canciones de la base de datos
    results = get_all_items(GuildActual)
    songs_info = [item[1] for item in results]
    playlist_length = len(songs_info)

    if playlist_length == 0 or None:
        await ctx.send("No hay más canciones en la lista de reproducción para saltar.")
        return
    
    if not ActiveLoop[GuildActual]:
        delete_items_up_to_id(GuildActual, command - 1)
        print("Saltando canciones")
    else:
        loopedPlaylist(GuildActual, command - 1)

    voice_client.stop()
    await play_next(ctx)

async def clear(ctx):
    GuildActual = ctx.guild.id
    remove_all_items(GuildActual)
    embed = Embed(description="Lista de reproducción borrada.", color=0x6a0dad)
    await ctx.send(embed=embed)

async def remove(ctx, command):
    try:
        command = int(command)
        GuildActual = str(ctx.guild.id)  # No se necesita conversión aquí si ya es una cadena de texto

        songs_info = get_all_items(GuildActual)  # Obtener canciones de la base de datos

        if songs_info:
            if len(songs_info) >= command >= 1:
                removed_item_id = songs_info[command - 1][0]  # Obtener el ID del elemento a eliminar en la base de datos
                remove_item_by_id(GuildActual, removed_item_id)  # Eliminar la canción de la base de datos

                video = YouTube(songs_info[command - 1][1])
                duration = video.length
                mins, secs = divmod(duration, 60)
                hours, mins = divmod(mins, 60)
                duration_formatted = '{:02d}:{:02d}:{:02d}'.format(hours, mins, secs)

                embed = Embed(title="Canción removida", color=0x7289DA)
                thumbnail = video.thumbnail_url
                embed.set_thumbnail(url=thumbnail)
                embed.add_field(name="Canción eliminada", value=f"[{video.title}] | [{video.author}]")
                embed.add_field(name="Duración", value=duration_formatted)

                await ctx.send(embed=embed)
            else:
                await ctx.send("El número proporcionado está fuera del rango de canciones disponibles.")
        else:
            await ctx.send("No hay canciones en la lista de reproducción para eliminar.")
    except ValueError:
        print("command no es un int")
        await ctx.send("Por favor, proporciona un número válido para remover una canción.")

async def loop(ctx):
    GuildActual = ctx.guild.id
    ActiveLoop[GuildActual] = not ActiveLoop[GuildActual]
    Status = 'Activado' if ActiveLoop[GuildActual] else 'Desactivado'
    await ctx.send(f"Loop: {Status}")

#! Trabajando en estas funciones --------------------------

async def AddSongs(ctx, command, bot):
    GuildActual = ctx.guild
    voice_client = ctx.guild.voice_client

    try:
        channel = ctx.author.voice.channel
    except:
        await ctx.send("Debe estar conectado a un canal de voz")
        return

    print(f'\nComando emitido por [{ctx.author.name}] en ({ctx.guild.name}) - command: {bot.command_prefix}play {command}\n')

    clearMusicFolder()
    songs_added = []
    with app.app_context():
        if channel:
            if voice_client or command == None:
                voice_client.pause()
                await voice_client.move_to(channel)
                voice_client.resume()
                if command == None:
                    return
            else:
                try:
                    voice_client = await channel.connect()
                except Exception as e:
                    print(f'Error al conectar al canal de voz: {e}')
                    return
                
            spotify_pattern = r'(https?://(?:open\.spotify\.com/(?:track|playlist)/|spotify:(?:track|playlist):)[a-zA-Z0-9]+)'
            YouTube_pattern = r'(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[^\s]+)'

            if not tabla_existe(GuildActual.id):
                Crear_Tabla(GuildActual, dynamic_Model_table(GuildActual.id))
            
            if re.match(YouTube_pattern, command):
                songs_added = addToPlaylistYT(YouTube_pattern, songs_added, GuildActual, command)
            
            elif re.match(spotify_pattern, command):
                #TODO: addToPlaylistSpotify()
                print('Link de spotify')
            else:
                result = SearchInYT(GuildActual, songs_added, command)
                if result:
                    songs_added = result
                else:                
                    await ctx.send('No se encontraron búsquedas válidas.')

            embed_title = "Canción agregada a la playlist" if len(songs_added) == 1 else "Canciones agregadas a la playlist"
            embed = Embed(title=embed_title, color=0x6a0dad)

            i = 0
            for song in songs_added:
                i += 1
                if i <= 5:
                    embed.add_field(
                        name=f"{song['title']} - {song['artist']}",
                        value=f"Duración: {song['duration']}",
                        inline=False
                    )
                    embed.set_thumbnail(url=song['thumbnail'])
                else:
                    embed.add_field(
                    name=f"**Y {len(songs_added) - 5} canciones más...**",
                    value=f"Total de canciones agregadas: {len(songs_added)}", # Cambiar *texto a (Peticion de X usuario)
                    inline=False
                )
                    break

            await ctx.send(embed=embed)

            if not voice_client.is_playing():
                await play_next(ctx)

        else:
            await ctx.send("¡Debes estar en un canal de voz para reproducir música!")

def addToPlaylistYT(YouTube_pattern, songs_added, GuildActual, command):
    url_list = []

    urls = re.findall(YouTube_pattern, command)
    for url in urls:
        playlist = Playlist(url) if 'list' in url.lower() else None
        video_urls = playlist.video_urls if playlist else [url]


    for video_url in video_urls:
        video = YouTube(video_url)
        url_list.append(video_url)


        duration = video.length
        mins, secs = divmod(duration, 60)
        hours, mins = divmod(mins, 60)
        duration_formatted = '{:02d}:{:02d}:{:02d}'.format(hours, mins, secs)

        thumbnail = video.thumbnail_url

        songs_added.append({
            'title': video.title,
            'duration': duration_formatted,
            'thumbnail': thumbnail,
            'artist': video.author
        })

    dict_list = []
    for item in url_list:
        dict_list.append({'url': item})

    add_item(GuildActual.id, dict_list)
    return songs_added

def SearchInYT(GuildActual, songs_added, command):
    videos = VideosSearch(command, limit=1)
    results = videos.result()

    if len(results['result']) > 0:
        video_url = results['result'][0]['link']
        video = YouTube(video_url)
        add_item(GuildActual.id, [{'url': video_url}])

        duration = video.length
        mins, secs = divmod(duration, 60)
        hours, mins = divmod(mins, 60)
        duration_formatted = '{:02d}:{:02d}:{:02d}'.format(hours, mins, secs)

        thumbnail = video.thumbnail_url

        songs_added.append({
            'title': video.title,
            'duration': duration_formatted,
            'thumbnail': thumbnail,
            'artist': video.author
        })
        return songs_added
    else:
        return False

#TODO: def addToPlaylistSpotify():


