import yt_dlp
import re


class SongData():
    def __init__(self, video_url) -> None:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'forcedescription': True,
            'forcejson': True,
            'nocheckcertificate': True,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            self.info = ydl.extract_info(video_url, download=False)

            self.title = self.info.get('title', 'Canción sin título')
            self.artist = self.info.get('artist', 'Artista desconocido')
            self.duration = self.info.get('duration', 'Duración desconocida')
            self.thumbnail = self.info.get('thumbnail', 'Sin foto de portada')


class SongBasic:
    def __init__(self, title: str, artist: str, duration, thumbnail: str, avatar: str, author: str, id: int,
                 download_path: str = None) -> None:

        self.title = self.cleanTitle(title)
        self.artist = artist
        self.duration = float(duration)
        self.thumbnail = thumbnail
        self.avatar = avatar
        self.author = author
        self.download_path = download_path
        self.url = f"https://www.youtube.com/watch?v={id}"
        self.id = id

    def __str__(self):
        return (
            f"title: {self.title}\n"
            f"artist: {self.artist}\n"
            f"duration: {self.duration}\n"
            f"thumbnail: {self.thumbnail}\n"
            f"avatar: {self.avatar}\n"
            f"author: {self.author}\n"
            f"download_path: {self.download_path}\n"
            f"url: {self.url}\n"
            f"id: {self.id}\n"
        )

    @staticmethod
    def cleanTitle(titulo):
        # Eliminar las etiquetas entre corchetes
        titulo = re.sub(r'\[.*?\]', '', titulo)
        # Eliminar las etiquetas entre paréntesis
        titulo = re.sub(r'\(.*?\)', '', titulo)
        # Eliminar las etiquetas entre llaves
        titulo = re.sub(r'\{.*?\}', '', titulo)
        # Eliminar los caracteres especiales
        titulo = re.sub(r'[^\w\s]', '', titulo)
        # Eliminar los espacios adicionales
        titulo = re.sub(r'\s+', ' ', titulo).strip()
        return titulo
