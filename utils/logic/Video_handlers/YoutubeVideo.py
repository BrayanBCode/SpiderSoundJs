from utils.logic.Video_handlers.MediaHandler import MediaHandler
import re, yt_dlp 

   
class YoutubeVideo(MediaHandler):
    ydl_opts_Video = {
        'quiet': False,
        'skip_download': True,
        'force_generic_extractor': True,
        'extract_flat': True,
        'format': 'best'
    }
    
    def check(self, arg):
        # Patrón de expresión regular para encontrar identificadores de videos de YouTube
        patron_youtube = re.compile(r'(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})')

        # Buscar coincidencias en la cadena
        coincidencias = patron_youtube.findall(arg)

        # Devolver True si se encontró al menos una coincidencia, de lo contrario, False
        print('YoutubeVideo: ', bool(coincidencias))
        return bool(coincidencias) 
    
    def search(self, video_url, ctx):
        with yt_dlp.YoutubeDL(self.ydl_opts_Video) as ydl:
            try:
                result = ydl.extract_info(video_url, download=False)
                
                return [self.extract(result, ctx)]
            
            except yt_dlp.DownloadError as e:
                return []