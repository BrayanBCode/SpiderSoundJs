
class SongBasic():
    def __init__(self, title: str, artist: str, duration: int, thumbnail: str, id: int) -> None:
        self.title = title
        self.artist = artist
        self.duration = duration
        self.thumbnail = thumbnail
        self.avatar = None
        self.author = None
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
            f"url: {self.url}\n"
            f"id: {self.id}\n"
        )
        
# Crear una instancia de SongBasic
mi_cancion = [] 
mi_cancion.append(SongBasic(title="Cancion Ejemplo", artist="Artista de Ejemplo", duration=180, thumbnail="enlace_thumbnail_ejemplo", id=12345))
mi_cancion.append(SongBasic(title="Cancion Ejemplo", artist="Artista de Ejemplo", duration=180, thumbnail="enlace_thumbnail_ejemplo", id=12345))
mi_cancion.append(SongBasic(title="Cancion Ejemplo", artist="Artista de Ejemplo", duration=180, thumbnail="enlace_thumbnail_ejemplo", id=12345))
mi_cancion.append(SongBasic(title="Cancion Ejemplo", artist="Artista de Ejemplo", duration=180, thumbnail="enlace_thumbnail_ejemplo", id=12345))
mi_cancion.append(SongBasic(title="Cancion Ejemplo", artist="Artista de Ejemplo", duration=180, thumbnail="enlace_thumbnail_ejemplo", id=12345))

# Imprimir la representación de cadena de la instancia
for a in mi_cancion:
    print(a)