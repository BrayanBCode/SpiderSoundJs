import discord
from discord import Embed
from utils.logic import structure

class MensajesEmbebidos():
    def __init__(self) -> None:
        HelpDic = [
            ('/play', 'Reporducir musica, escribe el nombre de la canción, el artista o la URL de la canción que desees escuchar, se admiten playlist de Spotify.'),
            ('/pause','Pausa la reproduccion de la musica'),
            ('/resume', 'Reanuda la reproduccion de la musica'),
            ('/stop', 'Detiene la reproduccion de la musica'),
            ('/skip', 'Salta una o varias canciones'),
            ('/queue', 'Muestra la cola de reproduccion'),
            ('/remove', 'Quita una cancion de la cola de reproduccion'),
            ('/clear', 'Limpia la cola de reproduccion'),
            ('/loop', 'Activa o desactiva el loop en al cola de reproduccion'),
            ('/leave', 'Desconecta el bot del canal'),
            ('/join', 'Mueve o conecta el bot a tu canal de voz actual')
        ]
        Help = [structure.HelpCommandMsg(title=data[0], description=data[1]) for data in HelpDic]
        embed = discord.Embed(title="Guia de comandos", description="Guia de comandos.", color=0x120062)
        for field in Help:
            field.save(embed)
            
        self.HelpEmbed = embed

    def PlayingMessage(self, song_title, song_artist, song_duration, video_url, song_thumbnail):
        embed = Embed(title="Reproduciendo", color=0x120062)
        embed.add_field(name=song_title, value=song_artist, inline=True)
        embed.add_field(name=f'Duracion: {self.DurationFormat(seconds=song_duration)}', value=f'[Ver en Youtube]({video_url})')
        embed.set_image(url=song_thumbnail)
        return embed


    def DurationFormat(self, seconds: int):
        mins, secs = divmod(seconds, 60)
        hours, mins = divmod(mins, 60)
        duration_formatted = '{:02d}:{:02d}:{:02d}'.format(hours, mins, secs)
        return duration_formatted



