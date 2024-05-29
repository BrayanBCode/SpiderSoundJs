import asyncio
import discord
import yt_dlp

import os

from discord.commands.context import ApplicationContext
from discord import Embed
from dotenv import load_dotenv

from utils.logic.Video_handlers.Search_handler import searchModule
from utils.logic.structure import MediaPlayerStructure, PlayingSong
from utils.logic.config import ConfigMediaSearch
from utils.logic.Song import SongInfo
from utils.logic.ThrowError import Error

load_dotenv()
api_key = os.getenv('YT_KEY')

class MusicPlayer(MediaPlayerStructure):
    def __init__(self, bot, guild) -> None:
        super().__init__(bot=bot, guild=guild)
        self.Queue: list = []
        self.is_loop: bool = False
        self.LastCtx: ApplicationContext = None
        self.PlayingSong: PlayingSong = None
        self.voice_client: discord.VoiceClient = None
        self.voiceChannel: discord.VoiceClient = None
        self.inactivity_task: asyncio.Task = None

        # Variables de control
        self.LockPlay: bool = True
        self.disconnect_timer: bool = False
        self.download_counter: int = 0
        self.contador: int = 0
        self.semaphore = asyncio.Semaphore(3)
        self.tasks = []

        print(f"Intancia de MusicPlayer creada para '{self.guild.name}'")

    async def disconnectProtocol(self, channel):
        
        if self.disconnect_timer:
            return
        
        if len(channel.members) == 1 or not self.voice_client.is_playing():
            self.disconnect_timer = True
            await asyncio.sleep(120)  # Espera 2 minutos
            if len(channel.members) == 1 or not self.voice_client.is_playing():  # Si el bot es el único en el canal de voz
                print(f"-- Protocolo de Desconexion para el servidor {self.guild.name} --")
                self.disconnect_timer = False
                
                self.LockPlay = True
                self.Queue.clear()
                self.is_loop = False
                self.PlayingSong = None
                self.NextSong = None
                
                if self.voice_client.is_connected():
                    await self.voice_client.disconnect()
                
                if self.voice_client.is_playing() or self.voice_client.is_paused():
                    self.voice_client.stop()
                
                if self.inactivity_task:
                    self.inactivity_task.cancel()
                
                if len(self.tasks) != 0:
                    for task in self.tasks:
                        task.cancel()
            else:
                self.disconnect_timer = False
    
    def setStoped(self, check: bool):
        self.LockPlay = check

    def getQueue(self):
        return self.Queue

    async def Stop(self, ctx: ApplicationContext):
        if self.voice_client.is_playing():
            self.voice_client.stop()
            await self.Messages.StopMessage(ctx)
            return

        await self.Messages.StopErrorMessage(ctx)

    async def Skip(self, ctx: ApplicationContext, posicion: int = None):
        voice_client: discord.VoiceClient = ctx.voice_client
        if voice_client is None:
            await self.Messages.SkipErrorMessage(ctx)
            return

        if len(self.Queue) == 0 and voice_client.is_playing():
            voice_client.stop()
            await self.Messages.SkipWarning(ctx)
            self.setStoped(True)
            return

        if posicion is None or posicion <= 1:
            voice_client.stop()
            await self.Messages.SkipSimpleMessage(ctx)
            return

        skipedSongs = self.Queue[:posicion - 1]
        self.Queue = self.Queue[posicion - 1:]

        await self.Messages.SkipMessage(ctx, skipedSongs)
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
                
        self.Queue.extend(tempQueue)
        
        if len(Errors) > 0:
            await self.Messages.AddedSongsErrorMessage(ctx, Errors)
        
        if len(tempQueue) > 0:
            await self.Messages.AddedSongsMessage(ctx, tempQueue)
            self.voice_client.stop()
            await self.PlayModule(ctx)
            self.setStoped(False)
                
                
            

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
        try:
            if len(self.Queue) == 0:
                await self.Messages.QueueEmptyMessage(ctx)
                self.bot.loop.create_task(self.disconnectProtocol(self.voice_client.channel))
                return

            if self.LockPlay:
                return

            if self.voice_client.is_playing():
                return

            if self.voice_client.is_paused():
                return

            video: SongInfo = self.Queue.pop(0)

            await self.PlaySound(video)
            await self.Messages.PlayMessage(ctx, video, self.Queue)
        
        except Exception as e:
            print(e)
            await self.Messages.SendFollowUp(ctx, Embed(description=f"Error: {e}"))

    # self.bot.loop.create_task(self.PlaySong(self.LastCtx)),

    async def PlaySound(self, video: SongInfo):
        try:
            
            url = video.webPlayer if video.webPlayer is None else video.webPlayer

                
            # audio_source = FFmpegPCMAudio(video.download_path)
            FFMPEG_OPTIONS = {'before_options': '-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5', 'options': '-vn'}
            self.voice_client.play(
                discord.FFmpegPCMAudio(url, **FFMPEG_OPTIONS), 
                after=lambda e: (
                        self.bot.loop.create_task(self.PlayModule(self.LastCtx)),
                        self.Queue.append(video) if self.is_loop else None
                )
            )
        except Exception as e:
            print(e)
            await self.PlayModule(self.LastCtx)
    
    def extractUrlPlayer(video: SongInfo):
        try:
            ydl_opts = {'format': 'bestaudio'}
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video.url, download=False)
                return info['url']
        except Exception as e:
            return e

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
