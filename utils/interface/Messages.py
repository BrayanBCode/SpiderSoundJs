import discord
from discord import Embed
from utils.logic import structure
from discord.commands.context import ApplicationContext

HelpList = [
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

class MensajesEmbebidos():
    def __init__(self) -> None:
        Help = [structure.HelpCommandMsg(title=data[0], description=data[1]) for data in HelpList]
        embed = discord.Embed(title="Guia de comandos", description="Guia de comandos.", color=0x120062)
        for field in Help:
            field.save(embed)
            
        self.HelpEmbed = embed

    async def PlayMessage(self, ctx: ApplicationContext,song_title, song_artist, song_duration, video_url, song_thumbnail):
        embed = Embed(title="Reproduciendo", color=0x120062)
        embed.add_field(name=song_title, value=song_artist, inline=True)
        embed.add_field(name=f'Duracion: {DurationFormat(seconds=song_duration)}', value=f'[Ver en Youtube]({video_url})')
        embed.set_image(url=song_thumbnail)
        
        await self.Send(ctx, embed)
        
    async def PauseMessage(self, ctx:ApplicationContext):
        await self.Send(ctx, Embed(description="Cancion pausada"))
    
    async def ResumeMessage(self, ctx:ApplicationContext):
        await self.Send(ctx, Embed(description="Cancion reanudada"))
        
    async def StopMessage(self, ctx: ApplicationContext):
        await self.Send(ctx, Embed(description="Reproduccion detenida"))
        
    async def SkipMessage(self, ctx:ApplicationContext):
        await self.Send(ctx, Embed(description="Cancion saltada"))
                
    async def QueueMessage(self, ctx:ApplicationContext):
        await self.Send(ctx, Embed(description="Playlist"))
        
    async def RemoveMessage(self, ctx:ApplicationContext):
        await self.Send(ctx, Embed(description="Cancion removida"))
        
    async def ClearMessage(self, ctx:ApplicationContext):
        await self.Send(ctx, Embed(description="Cola vaciada"))
        
    async def LoopMessage(self, ctx:ApplicationContext, is_loop):
        Status = 'Activado 🔁' if is_loop else 'Desactivado ⛔'
        await self.Send(ctx, Embed(description=f"Loop: {Status}"))

    async def LeaveMessage(self, ctx:ApplicationContext):
        await self.Send(ctx, Embed(description="Me desconecte"))

    async def JoinMessage(self, ctx:ApplicationContext):
        await self.Send(ctx, Embed(description="Me uni"))

    
    async def Send(self, ctx: ApplicationContext, embed):
        try:
            await ctx.followup.send(embed=embed)
        except Exception as e:
            await ctx.send(embed=embed)
            
    
            
def DurationFormat(seconds: int):
    mins, secs = divmod(seconds, 60)
    hours, mins = divmod(mins, 60)
    duration_formatted = '{:02d}:{:02d}:{:02d}'.format(hours, mins, secs)
    return duration_formatted



