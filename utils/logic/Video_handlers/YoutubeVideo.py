from utils.logic.Video_handlers.MediaHandler import MediaHandler
import yt_dlp
import re


class YoutubeVideo(MediaHandler):
    ydl_opts_Video = {
        'quiet': False,
        'extract_flat': True,
    }

    async def getResult(self, search, ctx, instance):
        Song = self.search(search, ctx)
        print("YoutubeVideo - getResult")

        return Song

    def check(self, arg):
        # Patrón de expresión regular para encontrar identificadores de videos de YouTube
        patron_youtube = re.compile(
            r'(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})')

        # Buscar coincidencias en la cadena
        coincidencias = patron_youtube.findall(arg)

        # Devolver True si se encontró al menos una coincidencia, de lo contrario, False
        print('YoutubeVideo: ', bool(coincidencias))
        return bool(coincidencias)

    def search(self, search, ctx):
        with yt_dlp.YoutubeDL(self.ydl_opts_Video) as ydl:
            try:
                result = ydl.extract_info(search, download=False)
                Song = [self.extract(result, ctx)]

                return Song

            except yt_dlp.DownloadError as e:
                return []