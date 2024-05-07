from utils.logic.Song import SongBasic
from utils.logic.Video_handlers.MediaHandler import MediaHandler
from utils.logic.Video_handlers.YoutubeVideo import YoutubeVideo
import discord
from discord import Embed
from discord.commands.context import ApplicationContext
from discord import Embed
import re
import yt_dlp


class YoutubePlaylist(MediaHandler):
    ydl_opts_Playlist = {
        'quiet': False,
        'no_warnings': True,
        'skip_download': True,
        'writesubtitles': False,
        'writeautomaticsub': False,
        'playlistend': 50, 
        'extract_flat': True,
    }

    def getResult(self, search, ctx: ApplicationContext, instance):
        Songs = self.search(search, ctx)
        print("YoutubeSearch - getResult")

        return Songs

    def check(self, arg):
        # Patrón regex para buscar un identificador de playlist de YouTube
        patron_playlist = re.compile(
            r'(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:playlist(?:s)?)\/|\S*?[?&]list=)|youtu\.be\/)([a-zA-Z0-9_-]+)'
        )

        # Buscar el patrón en la cadena
        coincidencias = patron_playlist.search(arg)

        # Sí se encuentra una coincidencia, devolver el identificador, de lo contrario, devolver None
        print('YoutubePlaylist: ', bool(coincidencias))
        return bool(coincidencias)


    def search(self, playlist_url, ctx):
        with yt_dlp.YoutubeDL(self.ydl_opts_Playlist) as ydl:
            try:
                info_dict = ydl.extract_info(playlist_url, download=False)
                if 'entries' in info_dict:
                    songs = info_dict['entries']
                else:
                    raise 

                song_data = []
                for song in songs:
                    try:
                        song_data.append(self.extract(song, ctx))
                    except yt_dlp.utils.ExtractorError as e:
                        print(f"Video restringido encontrado: {e}")
                        song_data.append(SongBasic(title="None", artist="None", duration=0, thumbnail="None", avatar="None", author="None", id=0000, Error=str(e)))
                    except yt_dlp.DownloadError as e:
                        print(f"Error de descarga: {e}")
                        song_data.append(SongBasic(title="None", artist="None", duration=0, thumbnail="None", avatar="None", author="None", id=0000, Error=str(e)))

                return song_data

            except Exception as e:
                print(f"Error general: {e}")
                return []