import discord
from discord import Embed
from utils.logic import structure
from discord.commands.context import ApplicationContext
import yt_dlp as youtube_dl
from utils.interface.QueuePagination import PaginationView as QueueView
from utils.logic.Song import SongBasic

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

class EmbeddedMessages():
    def __init__(self) -> None:
        Help = [ structure.HelpCommandMsg(title=data[0], description=data[1]) for data in HelpList ]
        embed = discord.Embed(title="Guia de comandos", description="Guia de comandos.", color=0x120062)
        for field in Help:
            field.save(embed)
            
        self.HelpEmbed = embed

    async def PlayMessage(self, ctx: ApplicationContext, video: SongBasic):
        print(video)
        embed = Embed(title="Reproduciendo 🎧", color=0x120062)
        embed.add_field(name=f"**{video.title}**", value=f"**{video.artist}**", inline=True)
        embed.add_field(name="|", value="", inline=True)
        embed.add_field(name=f'Duracion: {DurationFormat(seconds=video.duration)}', value=f'[Ver en Youtube]({video.url})')
        embed.set_image(url=video.thumbnail)
        embed.set_footer(text=f"Pedido por {video.author}", icon_url=video.avatar)
        
        await self.Send(ctx, embed)
        
    async def PauseMessage(self, ctx: ApplicationContext):
        await self.Send(ctx, Embed(description="Cancion pausada.", color=0x120062))
    
    async def ResumeMessage(self, ctx: ApplicationContext):
        await self.Send(ctx, Embed(description="Cancion reanudada.", color=0x120062))
        
    async def StopMessage(self, ctx: ApplicationContext):
        await self.Send(ctx, Embed(description="Reproduccion detenida.", color=0x120062))
        
    async def SkipMessage(self, ctx: ApplicationContext):
        await self.Send(ctx, Embed(description="Cancion saltada.", color=0x120062))
        
    async def RemoveMessage(self, ctx: ApplicationContext):
        await self.Send(ctx, Embed(description="Cancion removida.", color=0x120062))
        
    async def ClearMessage(self, ctx: ApplicationContext):
        await self.Send(ctx, Embed(description="Cola vaciada.", color=0x120062))
        
    async def LoopMessage(self, ctx: ApplicationContext, is_loop):
        Status = 'Activado 🔁' if is_loop else 'Desactivado ⛔'
        await self.Send(ctx, Embed(description=f"Loop: {Status}.", color=0x120062))

    async def LeaveMessage(self, ctx: ApplicationContext):
        await self.Send(ctx, Embed(description="Me desconecte.", color=0x120062))

    async def JoinMessage(self, ctx: ApplicationContext):
        await self.Send(ctx, Embed(description="Me uni.", color=0x120062))

    async def SkipErrorMessage(self, ctx: ApplicationContext):
        await self.Send(ctx, Embed(description="❌ Debe agregar musica para poder saltarla.", color=0x180081))

    async def SkipWarning(self, ctx: ApplicationContext):
        await self.Send(ctx, Embed(description="⚠️ Esta es la ultima cancion de la cola, saltando cancion.", color=0x180081))
    
    async def QueueEmptyMessage(self, ctx: ApplicationContext):
        embed = Embed(title="Araña Sound - Cola de reproduccion", color=0x180081)
        embed.add_field(name="La cola esta vacia")
        await self.Send(ctx, embed)
        
    async def AddSongsWaiting(self, ctx: ApplicationContext):
        embed = Embed(description="⌛ Agregando canciones...", color=0x120062)
        return await self.Send(ctx, embed)
    
    async def AddedSongsMessage(self, ctx: ApplicationContext, Songs: list):
        embed = Embed(title="🎵🗃️ Canciones agregadas a la cola", color=0x180081)
        for data in Songs:
            if data[0] and len(embed.fields) < 2: 
                data: SongBasic = data[1]
                embed.add_field(name=f"``{data.title}`` de ``{data.artist}``", value=f"Duracion: {DurationFormat(data.duration)} - [Ver en Youtube]({data.url})")
        embed.set_footer(text=f"Se agregaron {len(Songs[:-2])} mas.")
        await ctx.edit(embed=embed)
        
    async def QueueList(self, ctx: ApplicationContext, queue: list):            
        pagination_view = QueueView(timeout=None)
        pagination_view.data = queue
        await pagination_view.send(ctx)

    async def Send(self, ctx: ApplicationContext, embed):
        try:
            return await ctx.followup.send(embed=embed)
        except Exception as e:
            return await ctx.send(embed=embed)
            
def DurationFormat(seconds):
    seconds = int(seconds)
    mins, secs = divmod(seconds, 60)
    hours, mins = divmod(mins, 60)
    duration_formatted = '{:02d}:{:02d}:{:02d}'.format(hours, mins, secs)
    return duration_formatted