from src.utils.music_control.Song import SongInfo
from src.utils.music_control.Video_handlers.MediaHandler import MediaHandler
from discord.commands.context import ApplicationContext
import re
import yt_dlp

class YoutubePlaylist(MediaHandler):
    ydl_opts_Playlist = {
        'quiet': True,
        'no_warnings': True,
        'skip_download': True,
        'writesubtitles': False,
        'writeautomaticsub': False,
        'playlistend': 50, 
        'extract_flat': True,
    }

    def getResult(self, search, ctx: ApplicationContext, instance = None):
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
        # print('YoutubePlaylist: ', bool(coincidencias))
        return bool(coincidencias)

    def search(self, url, ctx):
        with yt_dlp.YoutubeDL(self.ydl_opts_Playlist) as ydl:
            try:
                info_dict = ydl.extract_info(url, download=False)
                if 'entries' in info_dict:
                    # Es una lista de reproducción
                    songs = info_dict['entries']
                else:
                    # Es un video individual
                    return self.search(info_dict['url'], ctx)

                song_data = []
                for song in songs:  
                    try:
                        song_data.append(self.extract(song, ctx))
                    except yt_dlp.utils.ExtractorError as e:
                        print(f"Video restringido encontrado: {e}")
                        song_data.append(SongInfo(title="None", artist="None", duration=0, thumbnail="None", avatar="None", author="None", id=0000, Error=str(e)))
                    except yt_dlp.DownloadError as e:
                        print(f"Error de descarga: {e}")
                        song_data.append(SongInfo(title="None", artist="None", duration=0, thumbnail="None", avatar="None", author="None", id=0000, Error=str(e)))

                return song_data

            except Exception as e:
                print(f"Error general: {e}")
                with open("Errorlog.txt", "w", encoding="utf-8") as file:
                    file.write(str(info_dict))
                return []