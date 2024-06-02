from testing.MediaHandler import MediaHandler
from utils.music_control.Song import SongBasic
import yt_dlp


class YoutubeSearch(MediaHandler):
    ydl_opts_Search = {
        'default_search': 'ytsearch',  # Usa la búsqueda de YouTube como motor de búsqueda predeterminado
        'quiet': True,
        'no_warnings': True,
        'skip_download': True,
        'writesubtitles': False,
        'writeautomaticsub': False,
    }

    def getResult(self, search, ctx, instance = None):
        Song = self.search(search, ctx)
        print("YoutubeSearch - getResult")

        return Song

    def search(self, search, ctx, num_videos=1):
        with yt_dlp.YoutubeDL(self.ydl_opts_Search) as ydl:
            try:
                result = ydl.extract_info(f"ytsearch{num_videos}:{search}", download=False)
                SongsList = result['entries']
                Song = []
                for song in SongsList:
                    try:
                        Song.append(self.extract(song, ctx))
                    except yt_dlp.utils.ExtractorError as e:
                        print(f"Video restringido encontrado: {e}")
                        Song.append(SongBasic(title="None", artist="None", duration=0, thumbnail="None", avatar="None", author="None", id=0000, Error=str(e)))
                    except yt_dlp.DownloadError as e:
                        print(f"Error de descarga: {e}")
                        Song.append(SongBasic(title="None", artist="None", duration=0, thumbnail="None", avatar="None", author="None", id=0000, Error=str(e)))
                return Song
            except Exception as e:
                print(f"Error general: {e}")
                return []
