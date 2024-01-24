## Main
``` python
import os
import sys
import discord
from discord import app_commands

from discord.ext import commands
from dotenv import load_dotenv
from discord import Activity, ActivityType

try:
    from utils.extensions.Music_Extend import Music_Ext
    #from utils.extensions.Gestion_Extend import Gestion_ext
    from utils.extensions.Buttons_Extend import Buttons_Ext
except Exception as e:
    print(str(e))

load_dotenv()

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="-", intents=intents)
tree = app_commands.CommandTree(bot)

bot.remove_command('help')

#! eventos --------------------------------------------------------------------

@bot.event
async def on_ready():
    await Status()
    try:
        await bot.add_cog(Music_Ext(bot, tree))
        #await bot.add_cog(Gestion_ext(bot))
        #await bot.add_cog(Buttons_Ext(bot))
    except Exception as e:
        print(str(e))

async def Status():
    status = 1
    print(f"Ya estoy activo {bot.user} al servicio")
    if status == 1:
        custom_status = Activity(
            name='Music Player "=help"', type=ActivityType.playing)
        await bot.change_presence(status=discord.Status.online, activity=custom_status)
    else:
        custom_status = Activity(
            name="Fuera de Servicio", type=ActivityType.playing)
        await bot.change_presence(activity=custom_status, status=discord.Status.do_not_disturb)

# * Comandos -------------------------------------------------------------------

@bot.command()
async def help(ctx):
    embed = discord.Embed(title="Guia de de comandos",
                          description="En esta guia se nombraran los comandos implementados en el Bot.", color=0x7289DA)
    embed.add_field(name=f"**{bot.command_prefix}play**",
                    value=f"Para reproducir música, simplemente escribe **{bot.command_prefix}play** seguido del nombre de la canción, el artista o la URL de la canción que desees escuchar.", inline=False)
    embed.add_field(name=f"**{bot.command_prefix}stop**",
                    value=f"Para pausar la comandos.Musica utilize **{bot.command_prefix}stop** una vez para reanudar la comandos.Musica utilize **{bot.command_prefix}stop** nuevamente", inline=False)
    embed.add_field(name=f"**{bot.command_prefix}skip**",
                    value=f"Para saltear una cancion utilize **{bot.command_prefix}skip**, para saltear varias agrege un numero, ejemplo: **{bot.command_prefix}skip 3**", inline=False)
    embed.add_field(name=f"**{bot.command_prefix}queue**",
                    value=f"Muestra la playlist y la cancion que se esta reproduciendo actualmente", inline=False)
    embed.add_field(name=f"**{bot.command_prefix}remove**",
                    value=f"Quita de la playlist la cancion que el usuario desee ejemplo: **{bot.command_prefix}remove 5**", inline=False)
    embed.add_field(name=f"**{bot.command_prefix}clear**",
                    value=f"Limpia la playlist", inline=False)
    embed.add_field(name=f"**{bot.command_prefix}loop**",
                    value=f"Activa el modo loop de la playlist lo que hace que se repita indefinidamente la playlist.", inline=False)
    embed.add_field(name=f"\n**Novedades**",
                    value=f"+ Ahora admitimos canciones y playlist de Spotify", inline=False)

    await ctx.send(embed=embed)

# * Comandos comandos.Musica ---------------------------

bot.run(os.environ.get("TEST"))

```

### Music_Extend
``` python
import os
import re
import asyncio
import discord

from discord.ext import commands
from discord import Embed, FFmpegPCMAudio
from discord.ui import Button, View
from youtubesearchpython import VideosSearch
from pytube import Playlist, YouTube
from discord import ActionRow, Button
from utils.extensions.Buttons_Extend import Pagination

from utils.db import *

import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

CURRENTLY_PLAYING = {}
INACTIVE_TIMERS = {}
ACTIVE_LOOP = {}

class Music_Ext(commands.Cog):
    def __init__(self, bot, tree):
        self.bot = bot
        self.tree = tree

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
    async def Queue(self, ctx):
        ServerID = ctx.guild.id
        # Obtener canciones de la base de datos
        CancionesInfo = get_all_items(f'Playlist_{str(ServerID)}')

        if CancionesInfo:
            
            CancionesURL = [info[1] for info in CancionesInfo]
            print(f'{type(CancionesURL)} - {CancionesURL}')
            # Creacion del Embed personalizado
            embed = discord.Embed(title='Lista de Reproduccion', color=0x6a0dad)
            # Cantidad de canciones por pagina
            maxVideosToShow = 5
            #Duracion total de la playlist
            DuracionPlaylist = sum(YouTube(str(URL)).length for URL in CancionesURL)
            total_min, total_seg = divmod(DuracionPlaylist, 60)
            total_horas, total_min = divmod(total_min, 60)
            totalDuracionFormateada = '{:02d}{:02d}{:02d}'.format(total_horas, total_min, total_seg)

            embed.set_footer(text=f"Página 1 - Duración total de la lista de reproducción: {totalDuracionFormateada}")

            CancionActual = CURRENTLY_PLAYING.get(ServerID)
            if CancionActual:

                embed.insert_field_at(
                    index=0,
                    name=f"**Reproduciendo Ahora**\n[{CancionActual['title']}] | [{CancionActual['author']}]",
                    value=f"Duración: {CancionActual['duration']}\n[Ver en YouTube]({CancionActual['url']})",
                    inline=False
                )
                embed.set_thumbnail(url=CancionActual['thumbnail'])
            
            startIndex = 0
            endIndex = min(len(CancionesInfo), maxVideosToShow)

            CancionesToShow = CancionesInfo[startIndex:endIndex]

            # Mostar lista de reproduccion

            for index, URL in enumerate(CancionesToShow, start=startIndex + 1):

                video = YouTube(URL[1])

                duracion = video.length

                mins, seg = divmod(DuracionPlaylist, 60)
                horas, mins = divmod(mins, 60)
                DuracionFormateada = '{:02d}{:02d}{:02d}'.format(horas, mins, seg)

                embed.add_field(
                    name=f'{index}. {video.title} de {video.author}',
                    value=f'Duración: {DuracionFormateada}\n[Ver en YouTube]({URL})',
                    inline=True
                )

                message = await ctx.send(embed=embed, view=Pagination)



  
  
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
            description="Lista de reproducción borrada.", color=0x6a0dad)
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
                    duration_formatted = '{:02d}:{:02d}:{:02d}'.format(
                        hours, mins, secs)

                    embed = Embed(title="Canción removida", color=0x7289DA)
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

                table_name = f"Playlist_{str(GuildActual.id)}"
                if not tabla_existe(table_name):
                    Crear_Tabla(
                        GuildActual, dynamic_Model_table_Playlist(f"Playlist_{str(GuildActual.id)}"))

                if re.match(YouTube_pattern, command):
                    songs_added = self.addToPlaylistYT(
                        YouTube_pattern, songs_added, table_name, command)

                elif re.match(spotify_pattern, command):
                    result = await self.addToPlaylistSpotify(ctx, table_name, command, songs_added)
                    if result[0]:
                        songs_added = result[1]
                    else:
                        await ctx.send(f'No se encontraron búsquedas válidas para {result[1]}.')
                else:
                    result = self.SearchInYT(table_name, songs_added, command)
                    if result[0]:
                        songs_added = result[1]
                    else:
                        await ctx.send(f'No se encontraron búsquedas válidas para {result[1]}.')

                embed_title = "Canción agregada a la playlist" if len(
                    songs_added) == 1 else "Canciones agregadas a la playlist"
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
                            # Cambiar *texto a (Peticion de X usuario)
                            value=f"Total de canciones agregadas: {len(songs_added)}",
                            inline=False
                        )
                        break

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
                result = self.SearchInYT(GuildActual, songs_added, search)
                if result:
                    songs_added = result
                    if not loop:
                        asyncio.create_task(self.play_next(ctx))
                        loop = True
                else:
                    print(
                        f'No se encontraron búsquedas válidas para [ {search} ].')

                count += 1
                if count == 6:
                    embed = Embed(title="Estamos agregando muchas canciones",
                                  description="Esto puede tardar un poco...")
                    await ctx.send(embed=embed)

                await asyncio.sleep(0.5)

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

                        embed = Embed(
                            title="Reproduciendo", description=f"{video.title} - {video.author}\n[Ver en Youtube]({videoUrl})\nDuración: {duration_formatted}", color=0x6a0dad)

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
            duration_formatted = '{:02d}:{:02d}:{:02d}'.format(
                hours, mins, secs)

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

        add_item(GuildActual, dict_list)
        return songs_added

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
                'artist': video.author
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
```
