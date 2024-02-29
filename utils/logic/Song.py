import yt_dlp as youtube_dl
       

class SongData():
    def __init__(self, video_url) -> None:
        ydl_opts = {
            'quiet': False,
            'format': 'bestaudio/best',  # Descargar el mejor formato de audio disponible
            'outtmpl': f'temp/%(id)s.%(ext)s',  # Nombre del archivo de salida
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',  # Especificar MP3 como el códec preferido
            }],
        }
        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            self.info = ydl.extract_info(video_url, download=False)
            
            self.title = self.info.get('title', 'Canción sin título')
            self.artist = self.info.get('channel', 'Artista desconocido')
            self.duration = self.info.get('duration', 'Duración desconocida')
            self.thumbnail = self.info.get('thumbnail', 'Sin foto de portada')
                

        
        