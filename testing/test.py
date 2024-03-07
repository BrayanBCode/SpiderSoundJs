import yt_dlp

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

class ExtractData:
    def extract(song):
        return [            
            SongBasic(                            
                title=song.get('title', 'Canción sin título'),
                artist=song.get('uploader', 'Artista desconocido'),
                duration=song.get('duration', 'Duración desconocida'),
                thumbnail=song.get('thumbnail', 'Sin foto de portada'),
                id=song.get('id')
            )            
        ]

def search(ydl_opts, url):
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            result = ydl.extract_info(url, download=False)
            if 'entries' in result:
                songs = result['entries']
                return [ExtractData.extract(song) for song in songs]
            else:
                return [ExtractData.extract(result)]
        except yt_dlp.DownloadError as e:
            return "Error de obtencion de datos"
        
ydl_opts1 = {
    'quiet': False,  # Evita la salida de log
    'skip_download': True,  # Evita descargar los videos
    'playlist_items': '1-5'
}

ydl_opts2 = {
    'quiet': False,
    'skip_download': True,
    'force_generic_extractor': True,
    'extract_flat': True,
    'format': 'best'
}

data1 = search(ydl_opts1, "https://www.youtube.com/watch?v=LfPGV8WtPJ4&list=RDLfPGV8WtPJ4&start_radio=1&rv=LfPGV8WtPJ4&t=0")
print()
print(data1[0][1])