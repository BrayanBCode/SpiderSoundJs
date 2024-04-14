import asyncio
import discord
import os
import yt_dlp
from discord import FFmpegPCMAudio
from discord.commands.context import ApplicationContext
from dotenv import load_dotenv

from utils.logic.Song import SongBasic
from utils.logic.Video_handlers.Search_handler import searchModule
from utils.logic.config import ConfigMediaSearch
from utils.logic.structure import MediaPlayerStructure, PlayingSong

load_dotenv()
api_key = os.getenv('YT_KEY')


class MusicPlayer(MediaPlayerStructure):
    def __init__(self, bot, guild) -> None:
        super().__init__(bot=bot, guild=guild)
        self.Queue: list = []
        self.stoped: bool = True
        self.LastCtx: ApplicationContext = None
        self.is_loop: bool = False
        self.PlayingSong: PlayingSong = None
        self.voice_client: discord.VoiceClient = None
        self.PlayingSongMsg: discord.Embed = None
        self.inactivity_task: asyncio.Task = None
        self.CheckTaskHandler: bool = False
        self.Tasks: list = []

        print(f"Intancia de MusicPlayer creada para {self.guild.id}")

    def disconnectProtocol(self):
        self.setStoped(True)
        self.Queue.clear()
        self.is_loop = False
        self.PlayingSong = None
        if self.voice_client.is_connected():
            self.voice_client.disconnect()

        if self.voice_client.is_playing() or self.voice_client.is_paused():
            self.voice_client.stop()

        if self.inactivity_task:
            self.inactivity_task.cancel()

        if len(self.Tasks) != 0:
            for task in self.Tasks:
                task.cancel()

    def setStoped(self, check: bool):
        self.stoped = check

    def getQueue(self):
        return self.Queue

    async def PlaySong(self, ctx: ApplicationContext):
        if self.stoped:
            return

        if self.voice_client == None or not self.voice_client.is_connected():
            self.voice_client = await self.join(ctx)

            if not self.voice_client:
                return

        if self.voice_client.is_paused():
            return

        # if search:
        #     self.Tasks.append(asyncio.create_task(self.AddSongs(search, ctx)))

        if self.voice_client.is_playing():
            return

        if len(self.Queue) == 0:
            await self.Messages.NoSongInQueueMessage(ctx)
            return

        self.PlayingSong = None

        ydl_opts = {
            'api_key': api_key,
            'quiet': False,
            'format': 'bestaudio/best',  # Descargar el mejor formato de audio disponible
            'outtmpl': f'temp/%(id)s.%(ext)s',  # Nombre del archivo de salida
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',  # Especificar MP3 como el códec preferido
            }],
        }

        Song: SongBasic = self.Queue[0]
        self.Queue.pop(0)

        try:
            video_file_path: str
            with (yt_dlp.YoutubeDL(ydl_opts) as ydl):

                ydl.download([Song.url])  # Descargar la canción
                video_file_path = os.path.join('temp', f"{Song.id}.mp3")
                print(f"Se descargo: {video_file_path}")

            audio_source = FFmpegPCMAudio(video_file_path)
            self.voice_client.play(audio_source, after=lambda e: (
                self.Queue.append(Song.url) if self.is_loop else None,
                self.bot.loop.create_task(
                    self.PlaySong(self.LastCtx)),
                os.remove(video_file_path)
            )
                                   )

            self.PlayingSong = PlayingSong(
                title=Song.title,
                artist=Song.artist,
                duracion=Song.duration,
                thumbnail=Song.thumbnail,
                url=Song.url
            )

            if self.inactivity_task is None or self.inactivity_task.done():
                self.inactivity_task = asyncio.create_task(self.check_inactivity())

            self.LastCtx = ctx

            self.PlayingSongMsg = await self.Messages.PlayMessage(ctx, Song)

        except yt_dlp.DownloadError as e:
            await ctx.send(f"Error al descargar la canción: {str(e)}")

    async def AddSongs(self, ctx: ApplicationContext, search: str):

        message = await self.Messages.AddSongsWaiting(ctx)
        result = await searchModule(ctx, search, self, ConfigMediaSearch.default())

        print(result)
        if len(result) == 0:
            await self.Messages.AddSongsError(ctx)
            return

        await self.Messages.AddedSongsMessage(message, result)

        # ! Agrega a la base de datos - TOCA CAMBIAR AL TENER LA BD
        self.Queue.extend(result)
        self.CheckTaskHandler = False
        await self.TaskHandler()
        return

    async def TaskHandler(self, ctx: ApplicationContext = None, search: str = None):
        try:
            if search:
                self.Tasks.append(asyncio.create_task(self.AddSongs(ctx, search)))

            if self.CheckTaskHandler:
                return

            if len(self.Tasks) == 0:
                return

            if not self.Tasks[0].done():
                self.CheckTaskHandler = True
                return

            if self.Tasks[0].done():
                self.Tasks.pop(0)

                if len(self.Tasks) > 0:
                    await self.Tasks[0]
                return

        except Exception as e:
            print(str(e))

    async def check_inactivity(self):
        try:
            time = 0

            while True:
                await asyncio.sleep(5)
                if self.voice_client.is_playing():
                    time = 0
                else:
                    time += 5
                if time >= 300:  # 10 minutos de inactividad
                    await self.voice_client.disconnect()
                    await self.Messages.InactiveMessage(self.LastCtx)
                    self.inactivity_task = None
                    break

        except Exception as e:
            print("Error check_inactivity - AttributeError: 'NoneType' object has no attribute 'is_playing'")

    async def Stop(self, ctx: ApplicationContext):
        voice_client: discord.VoiceClient = ctx.voice_client
        if not voice_client:
            voice_client.stop()
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

    async def join(self, ctx: ApplicationContext):
        # Verificar si el autor del comando está en un canal de voz
        if ctx.author.voice:
            try:
                # Unirse al canal de voz del autor
                channel = ctx.author.voice.channel
                voice_channel = await channel.connect()
                await self.Messages.JoinMessage(ctx)
                return ctx.voice_client
            except discord.ClientException:
                await self.Messages.JoinMessage(ctx)
                return ctx.voice_client
            except Exception as e:
                await self.Messages.JoinErrorMessage(ctx, e)
                return None
        else:
            await self.Messages.JoinMissingChannelError(ctx)
            return None

    async def loop(self, ctx: ApplicationContext):
        self.is_loop = not self.is_loop
        await self.Messages.LoopMessage(ctx, self.is_loop)

    async def leave(self, ctx: ApplicationContext):
        if ctx.voice_client:
            self.setStoped(True)
            self.is_loop = False

            await ctx.voice_client.disconnect()
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
        if posicion > self.Queue or posicion < 0:
            await self.Messages.RemoveLenghtError(ctx)
            return

        SongDeleted = self.Queue[posicion - 1]
        self.Queue.pop(posicion - 1)

        await self.Messages.RemoveMessage(ctx, SongDeleted)

    async def clear(self, ctx):
        self.Queue.clear()
        await self.Messages.ClearMessage(ctx)

    async def forceplay(self, ctx: ApplicationContext, url: str):
        AddMessage = await self.Messages.AddSongsWaiting(ctx)
        result = await searchModule(ctx, url, self, ConfigMediaSearch.forcePlayConfig())

        self.Queue = result + self.Queue
        await self.Messages.AddedSongsMessage(AddMessage, result)

        if self.voice_client is None:
            self.voice_client = await self.join(ctx)

        if self.voice_client.is_playing():
            self.voice_client.stop()
            return

        if self.voice_client:
            await self.PlaySong(ctx, None)
