# Imports basicos
import discord, os
from discord.ext import commands, tasks

# Short cut Imports
from discord.commands.context import ApplicationContext
 

# Imports utiles para los Cogs
from utils.logic import Structures, SongMenu
from discord import option

# Imports para YT
from youtubesearchpython import VideosSearch
from pytube import Playlist, YouTube

from utils.logic import url_handler, InactiveTest

# Imports para API Spotify
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

# Imports para reproduccion de audio
from discord import FFmpegPCMAudio
import asyncio

# Imports de Interaz
from discord import Embed
from typing import List


#! SOLUCION TEMPORAL - DEBE IMPLEMENTARSE LA BD


class Music_Cog(commands.Cog):
    def __init__(self, bot: discord.bot):
        self.bot = bot
        self.serverQueue = {}  # Diccionario para guardar las colas de reproducción
        self.disconnect_tasks = {}  # Diccionario para guardar las tareas de desconexión
        self.PlayingSong = {}
        self.ctxs = {}  # Diccionario para guardar los contextos
    
    @discord.slash_command(name = "play", description = "Agrega y reproduce musica desde YT")
    @option('search', str, description="Nombre o url de la cancion")
    async def play(self, ctx: ApplicationContext, search: str = None):
        await ctx.defer()
        try:
            channel = ctx.author.voice.channel
        except Exception as e:
            channel = False
        voice_client = ctx.guild.voice_client
        Guild = ctx.guild
        
        """Verifica si el autor de comando esta conectado a un canal de voz"""
        if not voice_client:
            if channel:
                await channel.connect()
            else:
                await ctx.followup.send(embed=Embed(description='❌ Debe estar conectado a un canal de voz'))  
                                        
        if search != None:
            await self.addToQueue(search, Guild.id)


        await ctx.followup.send(embed=await self.PlaySong(ctx))
  
        #await asyncio.create_task(await PlaySong(ctx))

    @discord.slash_command(name = "forceplay", description = "salta una o mas canciones")
    async def forceplay(self, ctx: ApplicationContext, url: str):
        await ctx.respond("Sin implementar")

    @discord.slash_command(name = "skip", description = "salta una o mas canciones")
    @option('posición', int, description="Posición en la que se encuentra en la cola")
    async def skip(self, ctx: ApplicationContext, posición: int = None):
        ctx.defer()
        result = self.SkipFunction(ctx, posición)
        await ctx.followup.send(embed=result)
        
    @discord.slash_command(name = "remove", description = "Quita una cancion de la cola a eleccion, vea la posicion de la cancion con /queue")
    async def remove(self, ctx: ApplicationContext, posición: int):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "pause", description = "Pausa la reproduccion")
    async def pause(self, ctx: ApplicationContext):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "resume", description = "reanuda la reproduccion")
    async def resume(self, ctx: ApplicationContext):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "stop", description = "Detiene la reproduccion")
    async def stop(self, ctx: ApplicationContext):
        voice_client: discord.VoiceClient = ctx.guild.voice_client
        if self.PlayNext.is_running():
            self.PlayNext.cancel()
        voice_client.stop()
        await ctx.respond(embed=Embed(description="Cancion detenida con exito"))
        
    @discord.slash_command(name = "queue", description = "Muestra la cola de reproduccion")
    async def queue(self, ctx: ApplicationContext):

        guild = ctx.guild.id
        if guild in self.serverQueue and self.serverQueue[guild]:
            queue = self.serverQueue[guild][1:]  # Las canciones en cola

            # Crear una lista de diccionarios para cada canción en la cola
            queue_info = []
            for url in queue:
                video = YouTube(url)
                duration = video.length
                mins, secs = divmod(duration, 60)
                hours, mins = divmod(mins, 60)
                duration_formatted = '{:02d}:{:02d}:{:02d}'.format(hours, mins, secs)
                queue_info.append({"title": video.title, "author": video.author, "duration": duration_formatted, "url": url})

            view = SongMenu.PaginationView(queue_info, self.playing_song[guild], ctx)
            embed = await view.get_embed()
            await ctx.send(embed=embed, view=view)
        else:
            await ctx.send('No hay canciones en la lista de reproducción.')
        
    @discord.slash_command(name = "clear", description = "Limpia la cola")
    async def clear(self, ctx: ApplicationContext):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "loop", description = "Activa o desactiva el loop de la cola")
    async def loop(self, ctx: ApplicationContext):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "leave", description = "Desconecta el bot del canal de voz")
    async def leave(self, ctx: ApplicationContext):
        await ctx.respond("Sin implementar")
        
    @commands.Cog.listener()
    async def on_guild_join(self, guild):
        self.serverQueue[guild.id] = []
        
    @commands.Cog.listener()
    async def on_ready(self) -> None:
        guilds = self.bot.guilds
        for guild in guilds:
            self.serverQueue[guild.id] = []
          
          
    # TASKS SECTION --------------------------------------------------------------------------------
    

    @commands.Cog.listener()
    async def on_voice_state_update(self, member, before, after):
        if member.id == self.bot.user.id and after.channel is not None:
            # El bot se ha unido a un canal de voz, programamos la desconexión
            guild_id = after.channel.guild.id  # Obtenemos el ID del servidor
            if guild_id in self.disconnect_tasks:
                # Si ya hay una tarea programada para este servidor, la cancelamos
                self.disconnect_tasks[guild_id].cancel()
            # Creamos una nueva tarea de desconexión para este servidor
            self.disconnect_tasks[guild_id] = asyncio.create_task(self.disconnect_after_inactivity(guild_id))

        if member.id == self.bot.user.id and after.channel is None and before.channel is not None:
            # El bot se ha desconectado de un canal de voz
            guild_id = before.channel.guild.id  # Obtenemos el ID del servidor
            if guild_id in self.disconnect_tasks and not self.disconnect_tasks[guild_id].done():
                # Si la tarea de desconexión aún está pendiente, la desconexión fue causada por un tercero
                self.disconnect_tasks[guild_id].cancel()  # Cancelamos la tarea de desconexión
                voice_channel = before.channel  # Obtenemos el canal de voz del que se desconectó el bot
                voice_client = await voice_channel.connect()  # Reconectamos el bot al canal de voz
                await self.PlaySong(self.ctxs[guild_id])  # Reanudamos la reproducción

    async def disconnect_after_inactivity(self, guild_id):
        await asyncio.sleep(120)  # Esperamos 2 minutos
        voice_client = next((vc for vc in self.bot.voice_clients if vc.guild.id == guild_id), None)
        if voice_client is not None and (not voice_client.is_playing() or len(voice_client.channel.members) == 1):  # Si el bot no está reproduciendo nada o está solo en el canal
            await voice_client.disconnect()  # Desconectamos el bot
            del self.disconnect_tasks[guild_id]  # Eliminamos la tarea del diccionario    
    
    

    @tasks.loop(seconds=3)
    async def PlayNext(self, ctx: ApplicationContext):
        voice_client = ctx.guild.voice_client
        if not voice_client.is_playing():
            if len(self.serverQueue[ctx.guild.id]) > 0:
                await ctx.send(embed=await self.PlaySong(ctx))
            else:
                await self.InactiveTimer(ctx)

    async def InactiveTimer(self, ctx: ApplicationContext):
        await asyncio.sleep(60)
        print("Inactive timer")
        voice_client = ctx.guild.voice_client
        if not voice_client.is_playing():
            await voice_client.disconnect()
            self.PlayNext.cancel()
                                
    async def addToQueue(self, arg: str, guild: int):
        result: tuple = (False, 'Link invalido')
        mediaplayers = [ url_handler.YoutubePlaylist(), url_handler.YoutubeVideo(), url_handler.SpotifyPlaylist(), url_handler.SpotifySong(), url_handler.YoutubeSearch() ]
        for player in mediaplayers:
            if player.check(arg):
                result = player.search(arg)
                break
        
        #! Agrega a la base de datos - TOCA CAMBIAR AL TENER LA BD
        for data in result:
            self.serverQueue[guild].append(data[1])
            print(f'Se agrego {data[1]} al server {guild}')          

    async def PlaySong(self, ctx):
        if len(self.serverQueue[ctx.guild.id]) > 0:
            if not ctx.voice_client.is_playing():
                guild = ctx.guild.id
                voice_client = ctx.voice_client

                video_url = self.serverQueue[guild][0]
                self.serverQueue[guild].pop(0)
                
                try:
                    video = YouTube(video_url)
                    video_stream = video.streams.get_audio_only()
                    output_path = 'temp'
                    video_path = os.path.join(output_path, video_stream.default_filename)
                    video_stream.download(output_path=output_path)

                    audio_source = FFmpegPCMAudio(video_path)   
                    voice_client.play(audio_source, after=lambda e: self.bot.loop.create_task(self.PlaySong(self.ctxs[guild])))     
                    
                    duration = video.length
                    mins, secs = divmod(duration, 60)
                    hours, mins = divmod(mins, 60)
                    duration_formatted = '{:02d}:{:02d}:{:02d}'.format(hours, mins, secs)

                    embed = Embed(title="Reproduciendo", color=0x120062)
                    embed.add_field(name=video.title, value=video.author, inline=True)
                    embed.add_field(name=f'Duracion: {duration_formatted}', value=f'Ver en Youtube')
                    embed.set_thumbnail(url=video.thumbnail_url)

                    self.ctxs[guild] = ctx  # Guardamos el contexto actual
                    self.PlayingSong[guild] = {
                        'title' : video.title,
                        'author' : video.author,
                        'duration': duration_formatted,
                        'url' : video.url
                    }

                    return embed
                
                except Exception as e:
                    return Embed(description=f'Error de reproduccion: {e}')
            else:
                return Embed(description=f'Cancion agregada a la cola')
                    
                
        else:
            return Embed(description='No hay canciones en la cola')

        
    async def SkipFunction(self, ctx: ApplicationContext, posición):
        voice_client = ctx.guild.voice_client
        if len(self.serverQueue[ctx.guild.id]) > 0:
            if isinstance(posición, int):
                voice_client.stop()
                ctx.send(embed=Embed(description="Saltando canciones"))
                for data in range(posición):
                    self.serverQueue.pop(data)
                return await self.PlaySong(ctx)

            else:
                voice_client.stop()
                ctx.send(embed=Embed(description="Saltando cancion"))
                return await self.PlaySong(ctx)        
        else:
            return Embed(description="No hay canciones en la cola")

    async def forcePlayFunction(self, ctx: ApplicationContext, search):
        voice_client = ctx.guild.voice_client
        result: tuple = (False, 'Link invalido')
        mediaplayers = [ url_handler.YoutubePlaylist(), url_handler.YoutubeVideo(), url_handler.SpotifyPlaylist(), url_handler.SpotifySong(), url_handler.YoutubeSearch() ]
        for player in mediaplayers:
            if player.check(search):
                result = player.search(search)
                break
        
        # agrega los resultados de la busqueda al principio de la cola
        self.serverQueue[ctx.guild.id].extend(result[1])
        voice_client.stop()
        return await self.PlaySong(ctx)
    
        
        
    

def setup(bot):
    bot.add_cog(Music_Cog(bot))
