from utils.logic.Video_handlers.MediaHandler import MediaHandler
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

    def getResult(self, search, ctx, instance):
        Song = self.search(search, ctx)
        print("YoutubeSearch - getResult")

        return Song

    def search(self, search, ctx, num_videos=1):
        with yt_dlp.YoutubeDL(self.ydl_opts_Search) as ydl:
            try:
                result = ydl.extract_info(f"ytsearch{num_videos}:{search}", download=False)

                SongsList = result['entries']
                Song = [self.extract(song, ctx) for song in SongsList]

                return Song

            except yt_dlp.DownloadError as e:
                return []
