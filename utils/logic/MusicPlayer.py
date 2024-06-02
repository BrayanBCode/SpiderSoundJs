import asyncio
import discord
import yt_dlp
import json
import traceback

import os

from discord.commands.context import ApplicationContext
from discord import FFmpegPCMAudio, Embed
from dotenv import load_dotenv

from utils.logic.Video_handlers.Search_handler import searchModule
from utils.logic.structure import PlayerStructure, PlayingSong
from utils.logic.config import ConfigMediaSearch
from utils.logic.Song import SongInfo
from utils.logic.ThrowError import Error

load_dotenv()
api_key = os.getenv('YT_KEY')

class MusicPlayer(PlayerStructure):
    def __init__(self, bot, guild) -> None:
        """
        Inicializa una instancia de MusicPlayer.

        Esta clase maneja la reproducción de música en un servidor de Discord, incluyendo la cola de canciones,
        el manejo de la conexión al canal de voz y las tareas de inactividad.

        Args:
            bot: La instancia del bot de Discord.
            guild: El servidor (guild) donde se usa el bot.
        """
        super().__init__(bot=bot, guild=guild)
        self.Queue: list = [] # Inicializa la cola de canciones.        
        self.is_loop: bool = False # Indica si el modo bucle está activado.       
        self.LastCtx: ApplicationContext = None # Último contexto de aplicación (ApplicationContext) donde se usó el bot.  
        self.PlayingSong: PlayingSong = None # La canción que se está reproduciendo actualmente.        
        self.voice_client: discord.VoiceClient = None # Cliente de voz de Discord.
        self.voiceChannel: discord.VoiceChannel = None # Canal de voz de Discord.
        self.inactivity_task: asyncio.Task = None # Tarea de inactividad (asyncio.Task) que maneja la desconexión por inactividad.

        self.LockPlay: bool = True # Bloquea la reproducción.
        self.disconnect_timer: bool = False # Indica si el temporizador de desconexión está activo.
        self.download_counter: int = 0 # Contador de descargas.
        self.contador: int = 0 # Contador genérico (puede ser usado para cualquier propósito).
        self.semaphore = asyncio.Semaphore(3) # Semáforo para limitar tareas concurrentes.
        self.tasks = [] # Lista de tareas asincrónicas activas.

        print(f"Instancia de MusicPlayer creada para '{self.guild.name}'")

    async def disconnectProtocol(self, channel: discord.VoiceChannel):
        """
        Desconecta el bot del canal de voz si está inactivo.

        Este método inicia un temporizador de 2 minutos. Si después de esos 2 minutos el bot es
        el único miembro en el canal de voz o no está reproduciendo música, se desconectará.

        Args:
            channel (discord.VoiceChannel): El canal de voz del que el bot podría desconectarse.
        """

        # Si el temporizador de desconexión ya está activo, salir de la función.
        if self.disconnect_timer:
            return

        # Verificar si el bot es el único miembro en el canal o si no está reproduciendo música.
        if len(channel.members) == 1 or not self.voice_client.is_playing():
            self.disconnect_timer = True  # Activar el temporizador de desconexión.
            await asyncio.sleep(120)  # Esperar 2 minutos.

            # Verificar de nuevo si el bot es el único miembro en el canal o si no está reproduciendo música.
            if len(channel.members) == 1 or not self.voice_client.is_playing():
                print(f"-- Protocolo de Desconexión para el servidor {self.guild.name} --")
                self.disconnect_timer = False  # Reiniciar el temporizador de desconexión.
                
                self.LockPlay = True  # Bloquear la reproducción.
                self.Queue.clear()  # Vaciar la cola de reproducción.
                self.is_loop = False  # Desactivar el modo bucle.
                self.PlayingSong = None  # Limpiar la canción en reproducción.
                self.NextSong = None  # Limpiar la siguiente canción.
                
                # Desconectar el bot si está conectado a un canal de voz.
                if self.voice_client.is_connected():
                    await self.voice_client.disconnect()
                
                # Detener cualquier reproducción o pausa activa.
                if self.voice_client.is_playing() or self.voice_client.is_paused():
                    self.voice_client.stop()
                
                # Cancelar la tarea de inactividad si existe.
                if self.inactivity_task:
                    self.inactivity_task.cancel()
                
                # Cancelar todas las tareas activas en la lista de tareas.
                if len(self.tasks) != 0:
                    for task in self.tasks:
                        task.cancel()
            else:
                # Si hay miembros en el canal o el bot está reproduciendo música, reiniciar el temporizador de desconexión.
                self.disconnect_timer = False

    def setStoped(self, check: bool):
        """
        Establece el estado de bloqueo de reproducción.

        Args:
            check (bool): Estado para bloquear (True) o desbloquear (False) la reproducción.
        """
        self.LockPlay = check

    def getQueue(self):
        """
        Devuelve la cola de canciones.

        Returns:
            list: La cola de canciones actual.
        """
        return self.Queue

    async def Stop(self, ctx: ApplicationContext):
        """
        Detiene la reproducción de música.

        Si el bot está reproduciendo música, detiene la reproducción y envía un mensaje de confirmación.
        Si no está reproduciendo música, envía un mensaje de error.

        Args:
            ctx (ApplicationContext): El contexto de la aplicación desde el cual se llamó este método.
        """
        if self.voice_client.is_playing():
            self.voice_client.stop()
            await self.Messages.StopMessage(ctx)  # Enviar mensaje de confirmación de parada.
            return

        await self.Messages.StopErrorMessage(ctx)  # Enviar mensaje de error si no se está reproduciendo música.

    async def Skip(self, ctx: ApplicationContext, posicion: int = None):
        """
        Salta la canción actual o varias canciones en la cola.

        Args:
            ctx (ApplicationContext): El contexto de la aplicación desde el cual se llamó este método.
            posicion (int, optional): La posición en la cola hasta la cual se deben saltar las canciones. 
                                    Si es None o menor o igual a 1, solo se salta la canción actual.
        """
        voice_client: discord.VoiceClient = ctx.voice_client
        if voice_client is None:
            await self.Messages.SkipErrorMessage(ctx)  # Enviar mensaje de error si no hay un cliente de voz.
            return

        # Si la cola está vacía y hay una canción en reproducción, detener la reproducción.
        if len(self.Queue) == 0 and voice_client.is_playing():
            voice_client.stop()
            await self.Messages.SkipWarning(ctx)  # Enviar mensaje de advertencia.
            self.setStoped(True)  # Bloquear la reproducción.
            return

        # Si no se especifica una posición o la posición es menor o igual a 1, saltar la canción actual.
        if posicion is None or posicion <= 1:
            voice_client.stop()
            await self.Messages.SkipSimpleMessage(ctx)  # Enviar mensaje de salto simple.
            return

        # Saltar varias canciones en la cola hasta la posición especificada.
        skipedSongs = self.Queue[:posicion - 1]
        self.Queue = self.Queue[posicion - 1:]

        await self.Messages.SkipMessage(ctx, skipedSongs)  # Enviar mensaje de las canciones saltadas.
        voice_client.stop()

    async def JoinVoiceChannel(self, ctx: ApplicationContext):
        if self.voice_client is None or not self.voice_client.is_connected():
            if ctx.author.voice:
                self.voiceChannel = ctx.author.voice.channel

                self.voice_client = await self.voiceChannel.connect()

                await self.Messages.JoinMessage(ctx)
            else:
                await self.Messages.JoinMissingChannelError(ctx)
                raise Error("El usuario no está en un canal de voz válido al emitir el comando")
        else:
            if ctx.author.voice:
                self.voiceChannel = ctx.author.voice.channel

                if self.voice_client and self.voice_client.channel != self.voiceChannel:
                    await self.voice_client.move_to(self.voiceChannel)  # Mover al canal del autor

                    await self.Messages.JoinMessage(ctx)
            else:
                await self.Messages.JoinMissingChannelError()
                raise Error("El usuario no está en un canal de voz válido al emitir el comando")

    async def loop(self, ctx: ApplicationContext):
        self.is_loop = not self.is_loop
        await self.Messages.LoopMessage(ctx, self.is_loop)

    async def leave(self, ctx: ApplicationContext):
        if ctx.voice_client:
            self.setStoped(True)
            self.is_loop = False

            await self.voice_client.disconnect()
            await self.Messages.LeaveMessage(ctx)
            # ctx.send(embed=Embed(description="Me desconecte con exito"))
        else:
            await self.Messages.LeaveMessage(ctx)
            # ctx.send(embed=Embed(description="No estoy en un canal de voz"))

    async def queue(self, ctx: ApplicationContext):
        await self.Messages.QueueList(ctx=ctx, queue=self.Queue)

    async def pause(self, ctx: ApplicationContext):
        self.setStoped(True)
        self.voice_client.pause()
        await self.Messages.PauseMessage(ctx)

    async def resume(self, ctx: ApplicationContext):
        self.setStoped(False)
        self.voice_client.resume()
        await self.Messages.ResumeMessage(ctx)

    async def remove(self, ctx: ApplicationContext, posicion: int):
        posicion -= 1
        if len(self.Queue) == 0:
            await self.Messages.RemoveErrorEmptyQueueMessage(ctx)
            return

        if posicion > len(self.Queue) or len(self.Queue) < posicion:
            await self.Messages.RemoveErrorPositionMessage(ctx)
            return

        rmvSong = self.Queue.pop(posicion)

        await self.Messages.RemoveMessage(ctx, rmvSong)

    async def clear(self, ctx):
        self.Queue.clear()

        await self.Messages.ClearMessage(ctx)

    async def forceplay(self, ctx: ApplicationContext, search: str):
        
        await self.JoinVoiceChannel(ctx)
        
        self.LastCtx = ctx
        
        msg = await self.Messages.AddSongsWaiting(ctx)
        result = await self.AddSongs(ctx, search)
        await self.Messages.AddSongsDelete(msg)
        
        tempQueue = result.copy()
        Errors = []
        
        for error in result:
            if error.Error is not None:
                print(error)
                Errors.append(error)
                tempQueue.remove(error)
                
        self.Queue[0:0] = tempQueue
        
        if len(Errors) > 0:
            await self.Messages.AddedSongsErrorMessage(ctx, Errors)
        
        if len(tempQueue) > 0:
            await self.Messages.AddedSongsMessage(ctx, tempQueue)
            self.voice_client.stop()
            await self.PlayModule(ctx)
            self.setStoped(False)
        else:
            await self.PlayModule(ctx)
            
    async def playnext(self, ctx: ApplicationContext, search: str):
        
        await self.JoinVoiceChannel(ctx)
        
        self.LastCtx = ctx
        
        msg = await self.Messages.AddSongsWaiting(ctx)
        result = await self.AddSongs(ctx, search)
        await self.Messages.AddSongsDelete(msg)
        
        tempQueue = result.copy()
        Errors = []
        
        for error in result:
            if error.Error is not None:
                print(error)
                Errors.append(error)
                tempQueue.remove(error)
                
        self.Queue[0:0] = tempQueue
        
        if len(Errors) > 0:
            await self.Messages.AddedSongsErrorMessage(ctx, Errors)
        
        if len(tempQueue) > 0:
            await self.Messages.AddedSongsMessage(ctx, tempQueue)
        else:
            await self.PlayModule(ctx)

    async def PlayInput(self, ctx: ApplicationContext, search):

        await self.JoinVoiceChannel(ctx)

        self.LastCtx = ctx

        if search:
            
            msg = await self.Messages.AddSongsWaiting(ctx)
            result = await self.AddSongs(ctx, search)
            await self.Messages.AddSongsDelete(msg)
            
            tempQueue = result.copy()
            Errors = []
            
            for error in result:
                if error.Error is not None:
                    print(error)
                    Errors.append(error)
                    tempQueue.remove(error)
            
            self.Queue.extend(tempQueue)
            
            if len(Errors) > 0:
                await self.Messages.AddedSongsErrorMessage(ctx, Errors)
            
            if len(tempQueue) > 0:
                await self.Messages.AddedSongsMessage(ctx, tempQueue)
                await self.PlayModule(ctx)

    async def PlayModule(self, ctx):

        if len(self.Queue) == 0:
            await self.Messages.QueueEmptyMessage(ctx)
            self.bot.loop.create_task(self.disconnectProtocol(self.voice_client.channel))
            return

        if self.LockPlay:
            return

        if not self.voice_client.is_connected():
            return

        if self.voice_client.is_playing():
            return

        if self.voice_client.is_paused():
            return

        video: SongInfo = self.Queue.pop(0)

        await self.PlaySound(video)
        await self.Messages.PlayMessage(ctx, video, self.Queue)

    async def PlaySound(self, video: SongInfo):
        try:
            
            video.webPlayer = video.webPlayer if video.webPlayer is not None else await self.extractUrlPlayer(video)
            FFMPEG_OPTIONS = {'before_options': '-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5', 'options': '-vn'}
            self.voice_client.play(
                discord.FFmpegPCMAudio(video.webPlayer, **FFMPEG_OPTIONS), 
                after=lambda e: (
                        self.bot.loop.create_task(self.PlayModule(self.LastCtx)),
                        self.Queue.append(video) if self.is_loop else None
                )
            )
        except Exception as e:
            print(e)
            await self.PlayModule(self.LastCtx)
    
    async def extractUrlPlayer(self, video: SongInfo):
        try:
            ydl_opts = {
                    'format': 'bestaudio', 
                    'quiet': True
                }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video.url, download=False)
                return info['url']
        except Exception as e:
            print(f"An error occurred: {e}")
            return None  # Retorna None en caso de excepción

    async def JoinVoiceChannel(self, ctx: ApplicationContext):
        if self.voice_client is None or not self.voice_client.is_connected():
            if ctx.author.voice:
                self.voiceChannel = ctx.author.voice.channel

                self.voice_client = await self.voiceChannel.connect()

                await self.Messages.JoinMessage(ctx)
            else:
                await self.Messages.JoinMissingChannelError(ctx)
                raise Error("El usuario no está en un canal de voz válido al emitir el comando")
        else:
            if ctx.author.voice:
                self.voiceChannel = ctx.author.voice.channel

                if self.voice_client and self.voice_client.channel != self.voiceChannel:
                    await self.voice_client.move_to(self.voiceChannel)  # Mover al canal del autor

                    await self.Messages.JoinMessage(ctx)
            else:
                await self.Messages.JoinMissingChannelError()
                raise Error("El usuario no está en un canal de voz válido al emitir el comando")

    async def AddSongs(self, ctx: ApplicationContext, search: str) -> list:

        result = searchModule(ctx, search, self, ConfigMediaSearch.default())

        # await self.DownloadSongs(result)

        return result

    def restart(self):
        self.voice_client.disconnect()
        if len(self.tasks) != 0:
            for task in self.Tasks:
                task.cancel()

        self.Queue: list = []
        self.is_loop: bool = False
        self.LastCtx: ApplicationContext = None
        self.PlayingSong: PlayingSong = None
        self.voice_client: discord.VoiceClient = None
        self.inactivity_task: asyncio.Task = None

        # Variables de control
        self.LockPlay: bool = True
        self.download_counter = 0
        self.contador = 0
        self.semaphore = asyncio.Semaphore(3)
        self.tasks = []

    # async def DownloadModule(self, video: SongInfo):
    #     ydl_opts = {
    #         'api_key': api_key,
    #         'quiet': False,
    #         'format': 'bestaudio/best',  # Descargar el mejor formato de audio disponible
    #         'outtmpl': f'temp/{self.download_counter}_{self.guild.id}_%(id)s.%(ext)s',
    #         'postprocessors': [{
    #             'key': 'FFmpegExtractAudio',
    #             'preferredcodec': 'mp3',  # Especificar MP3 como el códec preferido
    #         }],
    #     }

    #     with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    #         ydl.download([video.url])

    #     video_file_path = os.path.join('temp', f'{self.download_counter}_{self.guild.id}_{video.id}.mp3')
    #     self.download_counter += 1
    #     print(f"Se descargó la canción {video.title}, ID: {video.id}")
    #     video.download_path = video_file_path

        # return video_file_path

    # async def DownloadSongs(self, lista: list = None):
    #     print("async def DownloadSongs(self, lista: list = None)")

    #     print(self.tasks)
    #     self.tasks = [item for item in self.tasks if not item.done()]

    #     if len(self.tasks) == 0:
    #         if lista and not self.voice_client.is_playing():
    #             first = lista[0]

    #             await self.DownloadModule(first)
    #             await self.PlayModule(self.LastCtx)
    #         else:
    #             lista = self.Queue

    #         count = 0
    #         for item in lista[:3]:
    #             print("DownloadSongs - iteracion:", item)
    #             item: SongInfo
    #             print(item.title, item.download_path)
    #             if item.download_path is None:
    #                 print("self.tasks.append(asyncio.create_task(self.DownloadModule(item)))")
    #                 item.download_path = "temp/untitled.txt"
    #                 self.tasks.append(asyncio.create_task(self.DownloadModule(item)))
