import re

class SongInfo:
    def __init__(self, title: str, artist: str, duration, thumbnail: str, avatar: str, author: str, id: int, webPlayer: str = None, Error: str = None) -> None:

        self.title = self.cleanTitle(title)
        self.artist = artist
        self.duration = float(duration)
        self.thumbnail = thumbnail
        self.avatar = avatar
        self.author = author
        self.url = f"https://www.youtube.com/watch?v={id}"
        self.id = id
        self.webPlayer = webPlayer
        self.Error = Error

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
            f"webPlayer: {self.webPlayer}\n"
            f"Error: {self.Error}\n"
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
