import asyncio
import discord
import yt_dlp
import json
import traceback

import os

from discord.commands.context import ApplicationContext
from discord import FFmpegPCMAudio, Embed
from dotenv import load_dotenv

from src.utils.music_control.Video_handlers.Search_handler import searchModule
from src.utils.music_control.structure import PlayerStructure, PlayingSong
from src.utils.music_control.Song import SongInfo
from src.utils.music_control.ThrowError import Error
from src.utils.SearchConfig import ConfigMediaSearch

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
        """
        Conecta el bot a un canal de voz.

        Si el bot no está ya conectado a un canal de voz, se conectará al canal de voz del autor del comando.
        Si el bot ya está conectado, se moverá al canal de voz del autor del comando si es diferente.

        Args:
            ctx (ApplicationContext): El contexto de la aplicación desde el cual se llamó este método.
        
        Raises:
            Error: Si el autor del comando no está en un canal de voz válido.
        """
        # Verificar si el bot no está conectado a un canal de voz.
        if self.voice_client is None or not self.voice_client.is_connected():
            if ctx.author.voice:
                self.voiceChannel = ctx.author.voice.channel  # Obtener el canal de voz del autor.

                # Conectar al canal de voz del autor.
                self.voice_client = await self.voiceChannel.connect()

                await self.Messages.JoinMessage(ctx)  # Enviar mensaje de confirmación de conexión.
            else:
                await self.Messages.JoinMissingChannelError(ctx)  # Enviar mensaje de error si el autor no está en un canal de voz.
                raise Error("El usuario no está en un canal de voz válido al emitir el comando")
        else:
            if ctx.author.voice:
                self.voiceChannel = ctx.author.voice.channel  # Obtener el canal de voz del autor.

                # Mover al canal de voz del autor si es diferente al actual.
                if self.voice_client and self.voice_client.channel != self.voiceChannel:
                    await self.voice_client.move_to(self.voiceChannel)

                    await self.Messages.JoinMessage(ctx)  # Enviar mensaje de confirmación de movimiento.
            else:
                await self.Messages.JoinMissingChannelError()  # Enviar mensaje de error si el autor no está en un canal de voz.
                raise Error("El usuario no está en un canal de voz válido al emitir el comando")

    async def loop(self, ctx: ApplicationContext):
        """
        Activa o desactiva el modo bucle para la reproducción de música.

        Alterna el estado de `is_loop` y envía un mensaje indicando el nuevo estado.

        Args:
            ctx (ApplicationContext): El contexto de la aplicación desde el cual se llamó este método.
        """
        self.is_loop = not self.is_loop  # Alternar el estado del modo bucle.
        await self.Messages.LoopMessage(ctx, self.is_loop)  # Enviar mensaje indicando el nuevo estado del modo bucle.

    async def leave(self, ctx: ApplicationContext):
        """
        Desconecta el bot del canal de voz.

        Si el bot está conectado a un canal de voz, se desconecta y envía un mensaje de confirmación.
        Si no está conectado, envía un mensaje indicando que no está en un canal de voz.

        Args:
            ctx (ApplicationContext): El contexto de la aplicación desde el cual se llamó este método.
        """
        if ctx.voice_client:
            self.setStoped(True)  # Bloquear la reproducción.
            self.is_loop = False  # Desactivar el modo bucle.

            await self.voice_client.disconnect()  # Desconectar del canal de voz.
            await self.Messages.LeaveMessage(ctx)  # Enviar mensaje de confirmación de desconexión.
        else:
            await self.Messages.LeaveMessage(ctx)  # Enviar mensaje indicando que no está en un canal de voz.

    async def queue(self, ctx: ApplicationContext):
        """
        Muestra la lista de canciones en la cola.

        Args:
            ctx (ApplicationContext): El contexto de la aplicación desde el cual se llamó este método.
        """
        await self.Messages.QueueList(ctx=ctx, queue=self.Queue)  # Enviar mensaje con la lista de canciones en la cola.

    async def pause(self, ctx: ApplicationContext):
        """
        Pausa la reproducción de música.

        Args:
            ctx (ApplicationContext): El contexto de la aplicación desde el cual se llamó este método.
        """
        self.setStoped(True)  # Bloquear la reproducción.
        self.voice_client.pause()  # Pausar la reproducción de música.
        await self.Messages.PauseMessage(ctx)  # Enviar mensaje de confirmación de pausa.

    async def resume(self, ctx: ApplicationContext):
        """
        Reanuda la reproducción de música pausada.

        Args:
            ctx (ApplicationContext): El contexto de la aplicación desde el cual se llamó este método.
        """
        self.setStoped(False)  # Desbloquear la reproducción.
        self.voice_client.resume()  # Reanudar la reproducción de música.
        await self.Messages.ResumeMessage(ctx)  # Enviar mensaje de confirmación de reanudación.

    async def remove(self, ctx: ApplicationContext, posicion: int):
        """
        Elimina una canción de la cola en la posición especificada.

        Args:
            ctx (ApplicationContext): El contexto de la aplicación desde el cual se llamó este método.
            posicion (int): La posición de la canción en la cola a eliminar.
        """
        posicion -= 1  # Ajustar la posición a índice de lista (base 0).
        if len(self.Queue) == 0:
            await self.Messages.RemoveErrorEmptyQueueMessage(ctx)  # Enviar mensaje de error si la cola está vacía.
            return

        if posicion >= len(self.Queue):
            await self.Messages.RemoveErrorPositionMessage(ctx)  # Enviar mensaje de error si la posición es inválida.
            return

        rmvSong = self.Queue.pop(posicion)  # Eliminar la canción de la cola.
        await self.Messages.RemoveMessage(ctx, rmvSong)  # Enviar mensaje de confirmación de eliminación.

    async def clear(self, ctx: ApplicationContext):
        """
        Limpia todas las canciones de la cola.

        Args:
            ctx (ApplicationContext): El contexto de la aplicación desde el cual se llamó este método.
        """
        self.Queue.clear()  # Vaciar la cola de canciones.
        await self.Messages.ClearMessage(ctx)  # Enviar mensaje de confirmación de limpieza.

    async def forceplay(self, ctx: ApplicationContext, search: str):
        """
        Fuerza la reproducción de una nueva canción, interrumpiendo la actual si es necesario.

        Args:
            ctx (ApplicationContext): El contexto de la aplicación desde el cual se llamó este método.
            search (str): La búsqueda de la canción a reproducir.
        """
        await self.JoinVoiceChannel(ctx)  # Conectar al canal de voz.
        self.LastCtx = ctx  # Actualizar el último contexto.

        msg = await self.Messages.AddSongsWaiting(ctx)  # Enviar mensaje de espera.
        result = await self.AddSongs(ctx, search)  # Añadir canciones según la búsqueda.
        await self.Messages.AddSongsDelete(msg)  # Eliminar mensaje de espera.

        tempQueue = result.copy()  # Copiar el resultado para manipular.
        Errors = []

        # Procesar errores y limpiar resultados.
        for error in result:
            if error.Error is not None:
                print(error)
                Errors.append(error)
                tempQueue.remove(error)

        self.Queue[0:0] = tempQueue  # Añadir canciones al principio de la cola.

        if len(Errors) > 0:
            await self.Messages.AddedSongsErrorMessage(ctx, Errors)  # Enviar mensaje de error si hubo errores.

        if len(tempQueue) > 0:
            await self.Messages.AddedSongsMessage(ctx, tempQueue)  # Enviar mensaje de confirmación de canciones añadidas.
            self.voice_client.stop()  # Detener la reproducción actual.
            await self.PlayModule(ctx)  # Iniciar el módulo de reproducción.
            self.setStoped(False)  # Desbloquear la reproducción.
        else:
            await self.PlayModule(ctx)  # Iniciar el módulo de reproducción si no hay nuevas canciones.

    async def playnext(self, ctx: ApplicationContext, search: str):
        """
        Añade una nueva canción al principio de la cola para que se reproduzca a continuación.

        Args:
            ctx (ApplicationContext): El contexto de la aplicación desde el cual se llamó este método.
            search (str): La búsqueda de la canción a añadir.
        """
        await self.JoinVoiceChannel(ctx)  # Conectar al canal de voz.
        self.LastCtx = ctx  # Actualizar el último contexto.

        msg = await self.Messages.AddSongsWaiting(ctx)  # Enviar mensaje de espera.
        result = await self.AddSongs(ctx, search)  # Añadir canciones según la búsqueda.
        await self.Messages.AddSongsDelete(msg)  # Eliminar mensaje de espera.

        tempQueue = result.copy()  # Copiar el resultado para manipular.
        Errors = []

        # Procesar errores y limpiar resultados.
        for error in result:
            if error.Error is not None:
                print(error)
                Errors.append(error)
                tempQueue.remove(error)

        self.Queue[0:0] = tempQueue  # Añadir canciones al principio de la cola.

        if len(Errors) > 0:
            await self.Messages.AddedSongsErrorMessage(ctx, Errors)  # Enviar mensaje de error si hubo errores.

        if len(tempQueue) > 0:
            await self.Messages.AddedSongsMessage(ctx, tempQueue)  # Enviar mensaje de confirmación de canciones añadidas.
        else:
            await self.PlayModule(ctx)  # Iniciar el módulo de reproducción si no hay nuevas canciones.

    async def PlayInput(self, ctx: ApplicationContext, search):
        """
        Reproduce una canción o añade canciones a la cola de reproducción.

        Args:
            ctx (ApplicationContext): El contexto de la aplicación desde el cual se llamó este método.
            search (str): La búsqueda de la canción o lista de canciones a reproducir.
        """
        await self.JoinVoiceChannel(ctx)  # Conectar al canal de voz.

        self.LastCtx = ctx  # Actualizar el último contexto.

        if search:
            msg = await self.Messages.AddSongsWaiting(ctx)  # Enviar mensaje de espera.
            result = await self.AddSongs(ctx, search)  # Añadir canciones según la búsqueda.
            await self.Messages.AddSongsDelete(msg)  # Eliminar mensaje de espera.

            tempQueue = result.copy()  # Copiar el resultado para manipular.
            Errors = []

            # Procesar errores y limpiar resultados.
            for error in result:
                if error.Error is not None:
                    print(error)
                    Errors.append(error)
                    tempQueue.remove(error)

            self.Queue.extend(tempQueue)  # Añadir canciones al final de la cola.

            if len(Errors) > 0:
                await self.Messages.AddedSongsErrorMessage(ctx, Errors)  # Enviar mensaje de error si hubo errores.

            if len(tempQueue) > 0:
                await self.Messages.AddedSongsMessage(ctx, tempQueue)  # Enviar mensaje de confirmación de canciones añadidas.
                await self.PlayModule(ctx)  # Iniciar el módulo de reproducción.

    async def PlayModule(self, ctx: ApplicationContext):
        """
        Gestiona la reproducción de la siguiente canción en la cola.

        Args:
            ctx (ApplicationContext): El contexto de la aplicación desde el cual se llamó este método.
        """
        if len(self.Queue) == 0:
            await self.Messages.QueueEmptyMessage(ctx)  # Enviar mensaje si la cola está vacía.
            self.bot.loop.create_task(self.disconnectProtocol(self.voice_client.channel))  # Desconectar si la cola está vacía.
            return

        if self.LockPlay:
            return

        if not self.voice_client.is_connected():
            return

        if self.voice_client.is_playing():
            return

        if self.voice_client.is_paused():
            return

        video: SongInfo = self.Queue.pop(0)  # Obtener la siguiente canción de la cola.

        await self.PlaySound(video)  # Reproducir la canción.
        await self.Messages.PlayMessage(ctx, video, self.Queue)  # Enviar mensaje de confirmación de reproducción.

    async def PlaySound(self, video: SongInfo):
        """
        Reproduce una canción específica utilizando FFmpeg.

        Args:
            video (SongInfo): La información de la canción a reproducir.
        """
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
        except yt_dlp.DownloadError as e:
            video.webPlayer = None
            await self.PlaySound(video)  # Intentar reproducir de nuevo si hay un error de descarga.
            print(e)
        except Exception as e:
            print(e)
            await self.PlayModule(self.LastCtx)  # Continuar con el módulo de reproducción en caso de error.

    async def extractUrlPlayer(self, video: SongInfo):
        """
        Extrae la URL del reproductor de un video utilizando yt-dlp.

        Args:
            video (SongInfo): La información de la canción para extraer la URL.

        Returns:
            str: La URL del reproductor del video.
        """
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
            return None  # Retorna None en caso de excepción.

    async def JoinVoiceChannel(self, ctx: ApplicationContext):
        """
        Conecta el bot al canal de voz del autor del comando.

        Args:
            ctx (ApplicationContext): El contexto de la aplicación desde el cual se llamó este método.
        """
        if self.voice_client is None or not self.voice_client.is_connected():
            if ctx.author.voice:
                self.voiceChannel = ctx.author.voice.channel
                self.voice_client = await self.voiceChannel.connect()  # Conectar al canal de voz del autor.
                await self.Messages.JoinMessage(ctx)  # Enviar mensaje de confirmación de conexión.
            else:
                await self.Messages.JoinMissingChannelError(ctx)  # Enviar mensaje de error si el autor no está en un canal de voz.
                raise Error("El usuario no está en un canal de voz válido al emitir el comando")
        else:
            if ctx.author.voice:
                self.voiceChannel = ctx.author.voice.channel
                if self.voice_client and self.voice_client.channel != self.voiceChannel:
                    await self.voice_client.move_to(self.voiceChannel)  # Mover al canal de voz del autor.
                    await self.Messages.JoinMessage(ctx)  # Enviar mensaje de confirmación de conexión.
            else:
                await self.Messages.JoinMissingChannelError()
                raise Error("El usuario no está en un canal de voz válido al emitir el comando")

    async def AddSongs(self, ctx: ApplicationContext, search: str) -> list:
        """
        Añade canciones a la cola de reproducción basándose en una búsqueda.

        Args:
            ctx (ApplicationContext): El contexto de la aplicación desde el cual se llamó este método.
            search (str): La búsqueda de canciones a añadir.

        Returns:
            list: La lista de canciones añadidas.
        """
        result = searchModule(ctx, search, self, ConfigMediaSearch.default())
        # await self.DownloadSongs(result)
        return result

    def restart(self):
        """
        Reinicia el estado del reproductor de música, desconectando y limpiando la cola y tareas.
        """
        self.voice_client.disconnect()  # Desconectar del canal de voz.
        if len(self.tasks) != 0:
            for task in self.tasks:
                task.cancel()  # Cancelar tareas pendientes.

        self.Queue: list = []  # Reiniciar la cola.
        self.is_loop: bool = False  # Reiniciar el estado de bucle.
        self.LastCtx: ApplicationContext = None  # Reiniciar el último contexto.
        self.PlayingSong: PlayingSong = None  # Reiniciar la canción en reproducción.
        self.voice_client: discord.VoiceClient = None  # Reiniciar el cliente de voz.
        self.inactivity_task: asyncio.Task = None  # Reiniciar la tarea de inactividad.

        # Variables de control
        self.LockPlay: bool = True  # Bloquear la reproducción.
        self.download_counter = 0  # Reiniciar el contador de descargas.
        self.contador = 0  # Reiniciar el contador.
        self.semaphore = asyncio.Semaphore(3)  # Reiniciar el semáforo.
        self.tasks = []  # Reiniciar las tareas.

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
