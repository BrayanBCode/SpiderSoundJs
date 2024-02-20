import discord
from discord import Embed

class HelpCommandMsg():
    def __init__(self, title, description) -> None:
        self.title = title
        self.description = description
        
    def save(self, embed):
        embed.add_field(name=self.title, value=self.description, inline=False)

class YoutubeInstance():
    def __init__(self, title, artist, duracion, miniatura) -> None:
        self.title = title
        self.artist = artist
        self.duracion = duracion
        self.miniatura = miniatura
        
    def DuracionFromat(self):
        duration = self.duracion
        mins, secs = divmod(duration, 60)
        hours, mins = divmod(mins, 60)
        duration_formatted = '{:02d}:{:02d}:{:02d}'.format(hours, mins, secs)
        
        return duration_formatted
    
class SpotifyInstance():
    def __init__(self, title, artist) -> None:
        self.title = title
        self.artist = artist
        
    def Get(self):
        return (self.title, self.artist)