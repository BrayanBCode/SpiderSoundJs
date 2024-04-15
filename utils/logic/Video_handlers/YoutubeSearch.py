from utils.logic.Video_handlers.MediaHandler import MediaHandler
import yt_dlp


class YoutubeSearch(MediaHandler):
    ydl_opts_Search = {
        'quiet': False,  # Evita la salida de log
        'format': 'best',  # Elige el mejor formato disponible
        'extract_flat': True,  # Extrae solo la información básica
    }

    async def getResult(self, search, ctx, instance):
        Song = self.search(search, ctx)
        instance.Queue.extend(Song)
        print("YoutubeSearch - getResult")
        await instance.PlaySong(ctx)

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
