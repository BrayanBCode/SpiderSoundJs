from utils.logic.Song import SongBasic

class ExtractData:
    def extract(song, ctx):
        return [            
            SongBasic(                            
                title=song.get('title', 'Canción sin título'),
                artist=song.get('uploader', 'Artista desconocido'),
                duration=song.get('duration', 'Duración desconocida'),
                thumbnail=song.get('thumbnail', 'Sin foto de portada'),
                avatar=ctx.author.avatar,
                author=ctx.author.nick if ctx.author.nick else ctx.author.name,
                id=song.get('id')
            )            
        ]