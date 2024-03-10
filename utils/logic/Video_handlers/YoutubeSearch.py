from utils.logic.Video_handlers.MediaHandler import MediaHandler
import yt_dlp



class YoutubeSearch(MediaHandler):
    ydl_opts_Search = {
        'quiet': True,  # Evita la salida de log
        'format': 'best',  # Elige el mejor formato disponible
        'extract_flat': True,  # Extrae solo la información básica
    }      
    
    def search(self, query, ctx, num_videos=1):
        with yt_dlp.YoutubeDL(self.ydl_opts_Search) as ydl:
            try:
                result = ydl.extract_info(f"ytsearch{num_videos}:{query}", download=False)
                songs = result['entries']
                
                return [self.extract(song, ctx) for song in songs]
 
            except yt_dlp.DownloadError as e:
                return []
 