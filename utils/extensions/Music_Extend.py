import os
import re
import asyncio
import discord

from discord.ext import commands
from discord import Embed, FFmpegPCMAudio
from youtubesearchpython import VideosSearch
from pytube import Playlist, YouTube
from utils.extensions.Buttons import Queue_buttons

from utils.db import *

import spotipy
from spotipy.oauth2 import SpotifyClientCredentials


CURRENTLY_PLAYING = {}
INACTIVE_TIMERS = {}
ACTIVE_LOOP = {}



class Music_Ext(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

        ids_servidores = self.bot.guilds
        for servidor_id in ids_servidores:
            ACTIVE_LOOP[servidor_id.id] = False

        self.CrearTempSiNoExiste()

        with app.app_context():
            eliminar_entradas_de_todas_las_tablas()

    @commands.Cog.listener()
    async def on_voice_state_update(self, member, before, after):
        if member == self.bot.user and after.channel:
            afterguild = after.channel.guild

            if afterguild.id not in INACTIVE_TIMERS:
                INACTIVE_TIMERS[afterguild.id] = self.bot.loop.create_task(
                    self.checkVoiceActivity(afterguild))
        try:
            beforeguild = before.channel.guild
            if before.channel and not after.channel and member == self.user:  # Se desconectó de un canal de voz
                # Borrar la lista de reproducción del servidor
                remove_all_items(f"Playlist_{str(beforeguild.id)}")
                print(
                    f"La lista de reproducción para el servidor {beforeguild.name} ha sido limpiada.")
        except:
            print(
                f"Evento de Voz detectado - Usuario: {member} en {member.guild.name}")
            
    @commands.command(name='queue', aliases=['q'])
    async def queue(self, ctx):
        try:
            # Aquí va tu código para obtener la lista de canciones en la cola
            ServerID = ctx.guild.id
            queue = get_all_items(f'Playlist_{str(ServerID)}')
            queue = [url[1] for url in queue]
            
            displayMax = 6

            emb = discord.Embed(title="Araña Sound - Playlist", description="", color=0x120062)
            if len(queue) > 0:


                async def get_page(page: int):
                    try:
                        nonlocal emb
                        emb.clear_fields()
                        if ServerID in CURRENTLY_PLAYING:
                            videoCurrent = YouTube(CURRENTLY_PLAYING[ServerID]['url'])

                            duration = videoCurrent.length
                            mins, secs = divmod(duration, 60)
                            hours, mins = divmod(mins, 60)
                            duration_formatted = '{:02d}:{:02d}:{:02d}'.format(hours, mins, secs)

                            emb.add_field(name="Reproduciendo actual", 
                                        value=f"{videoCurrent.title} de {videoCurrent.author}\n Duracion: {duration_formatted}", 
                                        inline=False)
                            emb.set_thumbnail(url=videoCurrent.thumbnail_url)
                        offset = (page-1) * displayMax
                        
                        for index, url in enumerate(queue[offset:offset+displayMax], start=offset + 1):
                            video = YouTube(url)
                            duration1 = video.length
                            mins, secs = divmod(duration1, 60)
                            hours, mins = divmod(mins, 60)
                            duration_formatted = '{:02d}:{:02d}:{:02d}'.format(hours, mins, secs)

                            emb.add_field(name=f'{index}. {video.title} - {video.author}', value=f'Duración: {duration_formatted}\n[Ver en Youtube]({url})', inline=False)

                        n = Queue_buttons.compute_total_pages(len(queue), displayMax)
                        emb.set_footer(text=f"Pedido por {ctx.author} - Pagina {page} de {n}", icon_url=ctx.author.avatar.url)
                        return emb, n 
                    
                    except Exception as e:
                        print(f"Error al obtener la página: {e}")
                    #TODO aca termina la funcion get_page



                await Queue_buttons(ctx, get_page).navegate()
            else:
                emb.description = 'No hay canciones en la playlist'
                await ctx.send(embed=emb)

        except Exception as e:
            print(f"Error en el comando queue: {e}")

    @commands.command(name='skip', aliases=['s'])
    async def skip(self, ctx, command: int = 1):
        GuildActual = ctx.guild.id
        voice_client = ctx.guild.voice_client
        
        if command <= 0:
            await ctx.send("Por favor, proporciona un número positivo de canciones para saltar.")
            return

        if command == 1:
            voice_client.stop()
            return

        # Obtener las canciones de la base de datos
        results = get_all_items(f"Playlist_{str(GuildActual)}")
        songs_info = [item[1] for item in results]
        playlist_length = len(songs_info)

        if playlist_length == 0 or None:
            await ctx.send("No hay más canciones en la lista de reproducción para saltar.")
            return

        if not ACTIVE_LOOP[GuildActual]:
            delete_items_up_to_id(f"Playlist_{str(GuildActual)}", command - 1)
            print("Saltando canciones")            
        else:
            loopedPlaylist(f"Playlist_{str(GuildActual)}", command - 1)

        voice_client.stop()

    @commands.command(name='clear')
    async def clear(self, ctx):
        GuildActual = ctx.guild.id
        remove_all_items(f"Playlist_{str(GuildActual)}")
        embed = Embed(
            description="Lista de reproducción borrada.", color=0x120062)
        await ctx.send(embed=embed)

    @commands.command(name='remove', aliases=['r', 'rem'])
    async def remove(self, ctx, command):
        try:
            command = int(command)
            # No se necesita conversión aquí si ya es una cadena de texto
            GuildActual = str(ctx.guild.id)

            # Obtener canciones de la base de datos
            songs_info = get_all_items(f"Playlist_{str(GuildActual)}")

            if songs_info:
                if len(songs_info) >= command >= 1:
                    # Obtener el ID del elemento a eliminar en la base de datos
                    removed_item_id = songs_info[command - 1][0]

                    table_name = f"Playlist_{str(GuildActual)}"
                    # Eliminar la canción de la base de datos
                    remove_item_by_id(table_name, removed_item_id)

                    video = YouTube(songs_info[command - 1][1])
                    duration = video.length
                    mins, secs = divmod(duration, 60)
                    hours, mins = divmod(mins, 60)
                    duration_formatted = '{:02d}:{:02d}:{:02d}'.format(hours, mins, secs)

                    embed = Embed(title="Canción removida", color=0x120062)
                    thumbnail = video.thumbnail_url
                    embed.set_thumbnail(url=thumbnail)
                    embed.add_field(name="Canción eliminada",
                                    value=f"[{video.title}] | [{video.author}]")
                    embed.add_field(name="Duración", value=duration_formatted)

                    await ctx.send(embed=embed)
                else:
                    await ctx.send("El número proporcionado está fuera del rango de canciones disponibles.")
            else:
                await ctx.send("No hay canciones en la lista de reproducción para eliminar.")
        except ValueError:
            print("command no es un int")
            await ctx.send("Por favor, proporciona un número válido para remover una canción.")

    @commands.command(name='loop')
    async def loop(self, ctx):
        GuildActual = ctx.guild.id
        ACTIVE_LOOP[GuildActual] = not ACTIVE_LOOP[GuildActual]
        Status = 'Activado' if ACTIVE_LOOP[GuildActual] else 'Desactivado'
        await ctx.send(f"Loop: {Status}")

    @commands.command(name='play', aliases=['p'])
    async def AddSongs(self, ctx, *, command):
        GuildActual = ctx.guild
        voice_client = ctx.guild.voice_client

        try:
            channel = ctx.author.voice.channel
        except:
            await ctx.send("Debe estar conectado a un canal de voz")
            return

        print(
            f'\nComando emitido por [{ctx.author.name}] en ({ctx.guild.name}) - command: {self.bot.command_prefix}play {command}\n')

        self.clearMusicFolder()
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
                YouTube_playlist_pattern = r'(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[^\s]+(?:&list=[^\s]+)?[^\s]*)'

                table_name = f"Playlist_{str(GuildActual.id)}"
                if not tabla_existe(table_name):
                    Crear_Tabla(
                        GuildActual, dynamic_Model_table_Playlist(f"Playlist_{str(GuildActual.id)}"))

                if re.match(YouTube_playlist_pattern, command):
                    songs_added = await self.addToPlaylistMixYT(YouTube_playlist_pattern, songs_added, GuildActual.id, command, ctx)

                elif re.match(YouTube_pattern, command):
                    songs_added = self.addToPlaylistYT(
                        YouTube_pattern, songs_added, table_name, command)
                
                elif re.match(spotify_pattern, command):
                    result, songs = await self.addToPlaylistSpotify(ctx, table_name, command, songs_added)
                    if result:
                        songs_added = songs
                    else:
                        await ctx.send(f'No se encontraron búsquedas válidas para {songs}.')
                else:
                    result, songs = self.SearchInYT(table_name, songs_added, command)
                    if result:
                        songs_added = songs
                    else:
                        await ctx.send(f'No se encontraron búsquedas válidas para {songs}.')

                song = songs_added[0]
                embed = Embed(title=f'Araña Sound - Playlist', description=f'Se agrego a la playlist')
                embed.add_field(name=f'{song["title"]}', value=f'{song["artist"]}', inline=True)
                embed.add_field(name=f'{song["duration"]}', value=f'[Ver en YouTube]({song["url"]})', inline=True)
                if len(songs_added) > 0:
                    embed.description = f'Se agregaron {len(songs_added)} más.'

                await ctx.send(embed=embed)

                if not voice_client.is_playing():
                    await self.play_next(ctx)

            else:
                await ctx.send("¡Debes estar en un canal de voz para reproducir música!")

    @commands.command(name='stop', aliases=['pause', 'resume'])
    async def stop(self, ctx):
        voice_client = ctx.guild.voice_client

        if voice_client.is_playing():
            voice_client.pause()
            await ctx.send("Canción pausada")
        elif voice_client.is_paused():
            voice_client.resume()
            await ctx.send("Canción reanudada")
        else:
            await ctx.send("No hay ninguna canción en reproducción para pausar o reanudar.")
            
    async def play_next(self, ctx):
        GuildActual = ctx.guild.id
        voice_client = ctx.voice_client
        if not voice_client:
            return

        with app.app_context():

            if len(get_all_items(f"Playlist_{str(GuildActual)}")) > 0:
                if not voice_client.is_playing():
                    videoUrl = str(get_all_items(f"Playlist_{str(GuildActual)}")[0][1])

                    remove_item_by_id(f"Playlist_{str(GuildActual)}", 1)
                    try:
                        video = YouTube(videoUrl)

                        try:
                            # Intentar obtener la corriente de video en la calidad estándar
                            video_stream = video.streams.get_audio_only()

                        except ValueError as e:
                            print(e)
                        # Definir la ruta de descarga
                        output_path = 'temp'
                        video_path = os.path.join(output_path, video_stream.default_filename)


                        # Descargar el video
                        video_stream.download(output_path=output_path)


                        # Reproducir el video
                        audio_source = FFmpegPCMAudio(video_path)
                        voice_client.play(audio_source, after=lambda e: (
                            self.clearMusicFolder()
                        ))

                        # Enviar mensaje con la canción que está siendo reproducida
                        duration = video.length
                        mins, secs = divmod(duration, 60)
                        hours, mins = divmod(mins, 60)
                        duration_formatted = '{:02d}:{:02d}:{:02d}'.format(
                            hours, mins, secs)

                        embed = Embed(title="Reproduciendo", color=0x120062)
                        embed.add_field(name=video.title, value=video.author, inline=True)
                        embed.add_field(name=f'Duracion: {duration_formatted}', value=f'[Ver en Youtube]({videoUrl})')

                        embed.set_thumbnail(url=video.thumbnail_url)
                        await ctx.send(embed=embed)

                        CURRENTLY_PLAYING[GuildActual] = {
                            'title': video.title,
                            'artist': video.author,
                            'duration': duration_formatted,
                            'url': videoUrl,
                            'thumbnail': video.thumbnail_url,
                            'author': video.author
                        }

                        await self.play_next_controler(ctx)
                        await asyncio.sleep(30)
                    except Exception as e:
                        print(f'Error al descargar la canción: {str(e)}')

    async def play_next_controler(self, ctx):
        while True:
            voice_client = ctx.guild.voice_client
            GuildActual = ctx.guild.id

            if voice_client.is_playing() or voice_client.is_paused():
                while voice_client.is_playing() or voice_client.is_paused():
                    await asyncio.sleep(1)
                continue

            if len(get_all_items(f"Playlist_{str(GuildActual)}")) > 0 and not ACTIVE_LOOP[GuildActual]:
                await self.play_next(ctx)
            elif ACTIVE_LOOP[GuildActual]:
                video_url = str(CURRENTLY_PLAYING[GuildActual]['url'])
                add_item(f"Playlist_{str(GuildActual)}", [{'url': video_url}])
                await self.play_next(ctx)
            else:
                CURRENTLY_PLAYING.pop(GuildActual)
                break

            if len(get_all_items(f"Playlist_{str(GuildActual)}")) > 1:
                
                videoUrl = str(get_all_items(f"Playlist_{str(GuildActual)}")[1][1])
                print(videoUrl)

                try:
                    video = YouTube(videoUrl)

                    try:
                        # Intentar obtener la corriente de video en la calidad estándar
                        video_stream = video.streams.get_audio_only()

                    except ValueError as e:
                        print(e)
                    # Definir la ruta de descarga
                    output_path = 'temp'
                    video_path = os.path.join(output_path, video_stream.default_filename)


                    # Descargar el video
                    video_stream.download(output_path=output_path)
                except Exception as e:
                    print(f'play_next_controler: {e}')


            table_name = f"Playlist_{str(GuildActual)}"
            if len(get_all_items(table_name)) == 0:
                await asyncio.sleep(5)
                if len(get_all_items(table_name)) == 0:
                    break

            await asyncio.sleep(2)

    # Esta función verificará si el bot está inactivo en un canal de voz durante 2 minutos y lo desconectará
    async def checkVoiceActivity(self, guild):
        while True:
            voice_client = guild.voice_client
            if voice_client and voice_client.channel:
                # Verificar si el bot está solo en el canal de voz
                if len(voice_client.channel.members) == 1 and voice_client.channel.members[0] == guild.me or not voice_client.is_playing():
                    # Esperar 2 minutos para verificar la inactividad
                    await asyncio.sleep(120)
                    if len(voice_client.channel.members) == 1 and voice_client.channel.members[0] == guild.me or not voice_client.is_playing():
                        await voice_client.disconnect()
                        print(
                            f"El bot ha sido desconectado del canal de voz en '{guild.name}' debido a la inactividad.")
                        if self.checkFolderContent():
                            self.clearMusicFolder()
                        # Verificar si la clave existe antes de intentar eliminarla
                        if guild.id in INACTIVE_TIMERS:
                            # Eliminar el temporizador de inactividad para este servidor
                            INACTIVE_TIMERS.pop(guild.id)
            # Verificar la inactividad cada 10 segundos
            await asyncio.sleep(10)

    def checkFolderContent(self):
        folder_path = './temp'  # Ruta a la carpeta

        # Lista los archivos en la carpeta
        files_in_folder = os.listdir(folder_path)

        # Comprueba si hay algún archivo en la carpeta
        if files_in_folder:
            print("La carpeta contiene archivos.")
            return True
        else:
            print("La carpeta está vacía.")
            return False

    def clearMusicFolder(self):
        archivos = os.listdir('./temp')
        if archivos:
            for archivo in archivos:
                try:
                    os.remove(os.path.join('./temp', archivo))
                    print(f"Archivo '{archivo}' eliminado correctamente.")
                except Exception as e:
                    continue  # Pasar al siguiente archivo si no se puede eliminar

    def CrearTempSiNoExiste(self):
        nombre_carpeta = 'temp'

        ruta_carpeta = os.path.join(os.getcwd(), nombre_carpeta)

        if not os.path.exists(ruta_carpeta):
            try:
                os.makedirs(ruta_carpeta)
                print(f"Carpeta '{nombre_carpeta}' creada exitosamente.")
            except OSError as e:
                print(f"Error al crear la carpeta '{nombre_carpeta}': {e}")
        else:
            print(f"La carpeta '{nombre_carpeta}' ya existe.")
 
    def addToPlaylistYT(self, YouTube_pattern, songs_added, GuildActual, command):
        url_list = []
        video_urls = []

        urls = re.findall(YouTube_pattern, command)
        for url in urls:
            playlist = Playlist(url) if 'list' in url.lower() else None
            current_video_urls = playlist.video_urls if playlist else [url]
            video_urls.extend(current_video_urls)

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
                'artist': video.author,
                'url': video_url
            })

        dict_list = [{'url': item} for item in url_list]
        add_item(f"Playlist_{str(GuildActual)}", dict_list)

        return songs_added
        
    async def addToPlaylistMixYT(self, YouTube_playlist_pattern, songs_added, GuildActual, command, ctx):
        match = re.search(YouTube_playlist_pattern, command)
        if match:
            playlist_url = match.group(0)
            playlist = Playlist(playlist_url)
            video_urls = playlist.video_urls
            video_urls = list(video_urls)

            # Obtener la cola actual
            current_queue = get_all_items(f"Playlist_{str(GuildActual)}")
            print(current_queue)
            # Si no hay canciones en la cola, iniciar la reproducción de la primera canción
            if len(current_queue) == 0:
                first_video_url = video_urls[0]
                first_video = YouTube(first_video_url)
                
                duration = first_video.length
                mins, secs = divmod(duration, 60)
                hours, mins = divmod(mins, 60)
                duration_formatted = '{:02d}:{:02d}:{:02d}'.format(hours, mins, secs)

                thumbnail = first_video.thumbnail_url

                songs_added.append({
                    'title': first_video.title,
                    'duration': duration_formatted,
                    'thumbnail': thumbnail,
                    'artist': first_video.author,
                    'url': first_video_url
                })

                dict_list = [{'url': first_video_url}]
                add_item(f"Playlist_{str(GuildActual)}", dict_list)
                print()

                asyncio.create_task(self.play_next(ctx))  # Iniciar la reproducción de la primera canción

            # Agregar las demás canciones después de la primera

            for video_url in video_urls[1:]:
                video = YouTube(video_url)

                duration = video.length
                mins, secs = divmod(duration, 60)
                hours, mins = divmod(mins, 60)
                duration_formatted = '{:02d}:{:02d}:{:02d}'.format(hours, mins, secs)

                thumbnail = video.thumbnail_url

                songs_added.append({
                    'title': video.title,
                    'duration': duration_formatted,
                    'thumbnail': thumbnail,
                    'artist': video.author,
                    'url': video_url
                })

                dict_list = [{'url': video_url}]
                add_item(f"Playlist_{str(GuildActual)}", dict_list)

                await asyncio.sleep(0.3)  # Agrega un retraso de 0.3 segundos de forma asíncrona

        return songs_added

    async def addToPlaylistSpotify(self, ctx, GuildActual, command, songs_added):

        client_credentials_manager = SpotifyClientCredentials(client_id=os.environ.get(
            "clientID"), client_secret=os.environ.get("clientSecret"))
        sp = spotipy.Spotify(
            client_credentials_manager=client_credentials_manager)

        if "open.spotify.com/track/" in command:
            # Extraer el ID de la canción desde la URL
            track_id = command.split('/')[-1].split('?')[0]

            # Obtener información de la canción
            track_info = sp.track(track_id)

            # Obtener el nombre de la canción y el nombre del artista
            song_name = track_info['name']
            # Tomando solo el primer artista de la lista
            artist_name = track_info['artists'][0]['name']
            Search = f"{song_name} de {artist_name}"

            result = self.SearchInYT(GuildActual, songs_added, Search)
            if result:
                return (True, songs_added)
            else:
                return (False, f"No se encontro busqueda valida para {command}")

        elif "open.spotify.com/playlist/" in command:
            # Extraer el ID de la lista de reproducción desde la URL
            playlist_id = command.split('/')[-1].split('?')[0]

            # Obtener información de la lista de reproducción
            playlist_info = sp.playlist(playlist_id)

            # Crear una lista para almacenar los diccionarios de canciones
            spotify_list = []

            # Iterar sobre las pistas de la lista de reproducción y guardar información en la lista spotify_list
            for track in playlist_info['tracks']['items']:
                song_name = track['track']['name']
                artist_name = track['track']['artists'][0]['name']
                track_dict = {'name': song_name, 'author': artist_name}
                spotify_list.append(track_dict)

            loop = False
            count = 0
            for song_name in spotify_list:
                search = f"{song_name['name']} de {song_name['author']}"
                result, songs = self.SearchInYT(GuildActual, songs_added, search)
                if result:
                    songs_added = songs
                    if not loop:
                        asyncio.create_task(self.play_next(ctx))
                        loop = True
                else:
                    print(f'No se encontraron búsquedas válidas para [ {search} ].')

                count += 1
                if count == 4:
                    embed = Embed(title="Estamos agregando muchas canciones",
                                  description="Esto puede tardar un poco...")
                    await ctx.send(embed=embed)

                await asyncio.sleep(0.3)
            
            return (True, songs_added)

    def SearchInYT(self, GuildActual, songs_added, command):
        videos = VideosSearch(command, limit=1)
        results = videos.result()

        if len(results['result']) > 0:
            video_url = results['result'][0]['link']
            video = YouTube(video_url)
            add_item(GuildActual, [{'url': video_url}])

            duration = video.length
            mins, secs = divmod(duration, 60)
            hours, mins = divmod(mins, 60)
            duration_formatted = '{:02d}:{:02d}:{:02d}'.format(hours, mins, secs)

            thumbnail = video.thumbnail_url

            songs_added.append({
                'title': video.title,
                'duration': duration_formatted,
                'thumbnail': thumbnail,
                'artist': video.author,
                'url': video_url
            })
            return (True, songs_added)
        else:
            return (False, f"No se encontro busqueda valida para {command}")

    def SearchForFile(self, Dir, file):
        # Crear la ruta combinando el directorio y el nombre de archivo
        file_path = os.path.join(Dir, file)

        # Verificar si el archivo existe
        Search = os.path.isfile(file_path)

        return Search