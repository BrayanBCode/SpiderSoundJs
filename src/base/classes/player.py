from discord import VoiceChannel, FFmpegPCMAudio
import discord
from discord.ext import commands
import yt_dlp

from base.interfaces.IVideo_Info import IVideo_Info

class Player:
    def __init__(self, bot):
        self.bot = bot
        self.guild = None
        self.queue = []
        self.voice_channel_id = None
        self.text_channel_id = None

    async def join_voice_channel(self, voice_channel: VoiceChannel):
        if voice_channel:
            self.voice_channel_id = voice_channel.id
            self.guild = voice_channel.guild
            vc = await voice_channel.connect()
            return vc
        return None

    async def play_youtube_audio(self, url):
        ydl_opts = {
            'format': 'bestaudio',
            'quiet': True,
            'no_warnings': True,
            'default_search': 'auto',
            'source_address': '0.0.0.0'
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ffmpg = FFmpegPCMAudio(url2, before_options="-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5")
            info = ydl.extract_info(url, download=False)
            url2 = info['url']
            vc = self.guild.voice_client
            if vc and vc.is_connected():
                vc.play(ffmpg, after=lambda e: print('Player error: %s' % e) if e else None)

    async def get_audio_stream(self, url):
        ydl_opts = {
            'format': 'bestaudio',
            'quiet': True,
            'no_warnings': True,
            'default_search': 'auto',
            'source_address': '0.0.0.0'
        }
    
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            audio_url = info['url']
            ffmpg_audio = FFmpegPCMAudio(audio_url, before_options="-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5")
        return ffmpg_audio
    
    async def get_video_info(self, url) -> list[IVideo_Info] | IVideo_Info:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'default_search': 'auto',
            'extract_flat': True,  # Importante para playlists, evita descargar los videos.
        }
    
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            if 'entries' in info:  # Verifica si es una playlist
                videos_info = []
                for entry in info['entries']:
                    video_info = IVideo_Info(
                        title=entry.get('title'),
                        duration=entry.get('duration'),
                        uploader=entry.get('uploader'),
                        webpage_url=entry.get('webpage_url'),
                        thumbnail=entry.get('thumbnail')
                        )
                    videos_info.append(video_info)
                return videos_info
            else:  # Si no es una playlist, maneja como un solo video
                video_info = IVideo_Info(
                    title=info.get('title'),
                    duration=info.get('duration'),
                    uploader=info.get('uploader'),
                    webpage_url=info.get('webpage_url'),
                    thumbnail=info.get('thumbnail')
                    )
        
    async def get_search(self, query) -> list[IVideo_Info]:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'default_search': 'auto',
            'extract_flat': True,  # Importante para playlists, evita descargar los videos.
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            result = ydl.extract_info(f"ytsearch10:{query}", download=False)
            videos_info = []
            for entry in result['entries']:
                video_info = IVideo_Info(
                    title=entry.get('title'),
                    duration=0,
                    uploader="",
                    webpage_url="",
                    thumbnail=""
                    )
                videos_info.append(video_info)
            return videos_info





    # ydl_opts_Search = {
    #     'default_search': 'ytsearch',  # Usa la búsqueda de YouTube como motor de búsqueda predeterminado
    #     'quiet': True,
    #     'no_warnings': True,
    #     'skip_download': True,
    #     'writesubtitles': False,
    #     'writeautomaticsub': False,
    # }

    # def search(self, search, ctx, num_videos=1):
    #     with yt_dlp.YoutubeDL(self.ydl_opts_Search) as ydl:
    #         try:
    #             result = ydl.extract_info(f"ytsearch{num_videos}:{search}", download=False)
    #             SongsList = result['entries']
    #             Song = []
    #             for song in SongsList:
    #                 try:
    #                     Song.append(self.extract(song, ctx))
    #                 except yt_dlp.utils.ExtractorError as e:
    #                     print(f"Video restringido encontrado: {e}")
    #                     Song.append(SongInfo(title="None", artist="None", duration=0, thumbnail="None", avatar="None", author="None", id=0000, Error=str(e)))
    #                 except yt_dlp.DownloadError as e:
    #                     print(f"Error de descarga: {e}")
    #                     Song.append(SongInfo(title="None", artist="None", duration=0, thumbnail="None", avatar="None", author="None", id=0000, Error=str(e)))
    #             return Song
    #         except Exception as e:
    #             print(f"Error general: {e}")
    #             return []









# Uso
bot = commands.Bot(command_prefix='!', intents=discord.Intents.default())

@bot.slash_command(name="play", description="Play", guild_ids=[1149753197573968024])
async def play(ctx, *, url):
    player = Player(bot)
    await player.join_voice_channel(ctx.author.voice.channel)
    await player.play_youtube_audio(url)

bot.run("MTExNDYwMDYzODA0MzY2MDI4OA.GHlSxA.6xAM1LKEiamGI7gDi9wXgO3-xwNkKFPoMUQ240")