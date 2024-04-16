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
    def __init__(self, title: str, artist: str, duration, thumbnail: str, avatar: str, author: str, id: int) -> None:
        self.title = self.cleanTitle(title)
        self.artist = artist
        self.duration = float(duration)
        self.thumbnail = thumbnail
        self.avatar = avatar
        self.author = author
        self.url = f"https://www.youtube.com/watch?v={id}"
        self.id = id
        print(self)

    def __str__(self):
        return (
            f"title: {self.title}\n"
            f"artist: {self.artist}\n"
            f"duration: {self.duration}\n"
            f"thumbnail: {self.thumbnail}\n"
            f"avatar: {self.avatar}\n"
            f"author: {self.author}\n"
            f"url: {self.url}\n"
            f"id: {self.id}\n"
        )

    @staticmethod
    def cleanTitle(title):
        # Lista de palabras a eliminar del título
        palabras_a_eliminar = ['official', 'lyrics', 'Lyric', 'video', 'hd', '4k', 'clip', 'audio', 'Letra', 'Oficial', 'song',
                               'Song']

        # Agrega el nombre del artista a la lista de palabras a eliminar

        # Crea una expresión regular con las palabras a eliminar
        regex = '|'.join(palabras_a_eliminar)

        # Reemplaza las palabras a eliminar con una cadena vacía
        titulo_limpio = re.sub(regex, '', title, flags=re.IGNORECASE)

        # Elimina los espacios en blanco adicionales
        titulo_limpio = ' '.join(titulo_limpio.split())

        # Elimina los caracteres no deseados al principio y al final del título
        titulo_limpio = titulo_limpio.strip('- ()')

        return titulo_limpio
