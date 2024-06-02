import threading
import asyncio
import discord
import yt_dlp
import os

from discord.commands.context import ApplicationContext
from discord import FFmpegPCMAudio
from discord import Embed
from dotenv import load_dotenv

from utils.Video_handlers.Search_handler import searchModule
from utils.music_control.structure import MediaPlayerStructure, PlayingSong
from utils.config import ConfigMediaSearch
from utils.music_control.Song import SongBasic

load_dotenv()
api_key = os.getenv('YT_KEY')


class UsuarioNoEnCanalDeVozError(Exception):
    pass


class Test(MediaPlayerStructure):

    def __init__(self, bot, guild) -> None:
        super().__init__(bot=bot, guild=guild)
        self.Queue: list = []
        self.LastCtx: ApplicationContext = None
        self.LastTxtChannel: discord.channel = None
        self.voiceChannel: discord.VoiceChannel = None
        self.voice_client: discord.VoiceClient = None

        # Variables de control
        self.LockPlay: bool = False
        self.download_counter = 0
        self.contador = 0
        self.semaphore = asyncio.Semaphore(3)  # Crear un semáforo con capacidad para 3 tareas asincrónicas

        print(f"Intancia de MusicPlayer creada para '{self.guild.name}'")

    async def PlayInput(self, ctx: ApplicationContext, search):
        try:

            await self.JoinVoiceChannel(ctx)

            if search:
                await self.Messages.AddSongsWaiting(ctx)
                result = await self.AddSongs(ctx, search)
                await self.Messages.AddedSongsMessage(ctx, result)

            await self.PlayModule(ctx)

        except Exception as e:
            print(str(e))
            await self.Messages.SendFollowUp(ctx, Embed(description=f"Error: {e}"))

    async def PlayModule(self, ctx):

        try:
            if len(self.Queue) == 0:
                self.Messages.QueueEmptyMessage(ctx)
                return

            if self.LockPlay:
                return

            if self.voice_client.is_playing():
                return

            if self.voice_client.is_paused():
                return

            self.LastCtx = ctx

            video: SongBasic = self.Queue[0]
            print("A reproducir:", video)

            self.PlaySound(video)
            await self.Messages.PlayMessage(ctx, video, self.Queue)

        except Exception as e:
            print(str(e))
            await self.Messages.SendFollowUp(ctx, Embed(description=f"Error: {e}"))

    # self.bot.loop.create_task(self.PlaySong(self.LastCtx)),

    def PlaySound(self, video: SongBasic):
        try:
            audio_source = FFmpegPCMAudio(video.download_path)
            self.voice_client.play(audio_source, after=lambda e: (
                self.PlayModule(self.LastCtx)
            ))

        except Exception as e:
            raise UsuarioNoEnCanalDeVozError(f"Error al reproducir la canción: {str(e)}")

    async def JoinVoiceChannel(self, ctx: ApplicationContext):
        if self.voice_client is None or not self.voice_client.is_connected():
            if ctx.author.voice:
                self.voiceChannel = ctx.author.voice.channel

                self.voice_client = await self.voiceChannel.connect()

                await self.Messages.JoinMessage(ctx)
            else:
                await self.Messages.JoinMissingChannelError(ctx)
                raise UsuarioNoEnCanalDeVozError("El usuario no está en un canal de voz válido al emitir el comando")
        else:
            if ctx.author.voice:
                self.voiceChannel = ctx.author.voice.channel

                if self.voice_client and self.voice_client.channel != self.voiceChannel:
                    await self.voice_client.move_to(self.voiceChannel)  # Mover al canal del autor

                    await self.Messages.JoinMessage(ctx)
            else:
                await self.Messages.JoinMissingChannelError()
                raise UsuarioNoEnCanalDeVozError("El usuario no está en un canal de voz válido al emitir el comando")

    async def DownloadModule(self, video: SongBasic):
        ydl_opts = {
            'api_key': api_key,
            'quiet': False,
            'format': 'bestaudio/best',  # Descargar el mejor formato de audio disponible
            'outtmpl': f'temp/{self.download_counter}_{self.guild.id}_%(id)s.%(ext)s',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',  # Especificar MP3 como el códec preferido
            }],
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([video.url])
                video_file_path = os.path.join('temp', f'{self.download_counter}_{self.guild.id}_{video.id}.mp3')
                self.download_counter += 1
                print(f"Se descargó la canción {video.title}, ID: {video.id}")
                video.download_path = video_file_path

                return video_file_path
        except Exception as e:
            print(str(e))
            raise e

    async def DownloadSongs(self, lista: list):
        try:
            tasks = []
            for item in lista:
                # Adquirir el semáforo antes de iniciar la descarga
                await self.semaphore.acquire()
                task = asyncio.create_task(self.DownloadModule(item))
                tasks.append(task)

            await tasks[0]
            await self.PlayModule(self.LastCtx)

            # Esperar a que todas las tareas terminen
            await asyncio.gather(*tasks)
        except Exception as e:
            print("DownloadSongs", e)

    async def AddSongs(self, ctx: ApplicationContext, search: str):

        result = searchModule(ctx, search, self, ConfigMediaSearch.default())

        self.Queue.extend(result)
        await self.DownloadSongs(result)

        return result
