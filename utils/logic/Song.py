import yt_dlp
       

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
        
        
