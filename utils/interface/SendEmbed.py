import discord
from discord import Embed
from utils.logic import structure
from discord.commands.context import ApplicationContext
from utils.interface.QueuePagination import PaginationView as QueueView
from utils.logic.Song import SongInfo

HelpList = [
    ('/play',
     'Reporducir musica, escribe el nombre de la canción, el artista o la URL de la canción que desees escuchar, se admiten playlist y mix de YT.'),
    ('/forceplay', 'Lo mismo que play pero reproduce de manera inmediata la cancion o playlist agragada'),
    ('/pause', 'Pausa la reproduccion de la musica'),
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


class EmbeddedMessages:
    def __init__(self) -> None:
        Help = [structure.HelpCommandMsg(title=data[0], description=data[1]) for data in HelpList]
        embed = discord.Embed(title="Guia de comandos", description="Guia de comandos.", color=0x120062)
        for field in Help:
            field.save(embed)

        self.HelpEmbed = embed

    # async def PlayMessage(self, ctx: ApplicationContext, video: SongInfo, Queue: list):
    #     embed = Embed(title="Reproduciendo🎧", color=0x120062)
    #     embed.add_field(name=f"**{video.title}**", value=f"**{video.artist}**", inline=True)
    #     embed.add_field(name="|", value="", inline=True)
    #     embed.add_field(name=f'Duracion: {DurationFormat(seconds=video.duration)}',
    #                     value=f'[Ver en Youtube]({video.url})')
    #     embed.set_image(url=video.thumbnail)
    #     embed.set_author(name=video.author, icon_url=video.avatar)
    #     embed.set_footer(text=f"Pedido por {video.author}", icon_url=video.avatar)
    #
    #     return await self.SendFollowUp(ctx, embed)

    async def PlayMessage(self, ctx: ApplicationContext, video: SongInfo, Queue: list):

        embed = Embed(title="Sonando 🎧", color=0x120062)
        embed.add_field(name="", value=f"**[{video.title}]({video.url})**", inline=False)
        embed.add_field(name="**Artista**", value=f"`{video.artist}`".upper(), inline=True)
        embed.add_field(name=f"**Duracion**", value=f"`{DurationFormat(seconds=video.duration)}`", inline=True)
        embed.add_field(name="**En cola**", value=f"`{len(Queue)}`", inline=True)
        embed.set_footer(text=f"Pedido por {video.author}", icon_url=video.avatar)
        embed.set_image(url=video.thumbnail)

        return await self.SendFollowUp(ctx, embed)

    async def PauseMessage(self, ctx: ApplicationContext):
        await self.SendFollowUp(ctx, Embed(description="Cancion pausada.", color=0x120062))

    async def ResumeMessage(self, ctx: ApplicationContext):
        await self.SendFollowUp(ctx, Embed(description="Cancion reanudada.", color=0x120062))

    async def StopMessage(self, ctx: ApplicationContext):
        await self.SendFollowUp(ctx, Embed(description="Reproduccion detenida.", color=0x120062))

    async def StopErrorMessage(self, ctx: ApplicationContext):
        await self.SendFollowUp(ctx, Embed(description="No hay nada que detener"))

    async def SkipSimpleMessage(self, ctx: ApplicationContext):
        await self.SendFollowUp(ctx, Embed(description="Cancion saltada.", color=0x120062))

    async def SkipMessage(self, ctx: ApplicationContext, SkipedSongs: list):
        embed = Embed(title="Canciones saltadas.")
        for data in SkipedSongs:
            if isinstance(data, SongInfo) and len(embed.fields) < 2:
                data: SongInfo = data
                embed.add_field(name=f"``{data.title}`` de ``{data.artist}``",
                                value=f"Duracion: {DurationFormat(data.duration)} - [Ver en Youtube]({data.url})")
        embed.set_footer(text=f"Se saltaron {len(SkipedSongs[:-2])} mas.")
        await self.SendFollowUp(ctx, embed)

    async def RemoveMessage(self, ctx: ApplicationContext, RemovedSong: SongInfo):
        embed = Embed(title="Cancion removida.", color=0x120062)
        embed.add_field(name=f"{RemovedSong.title}", value=f"{RemovedSong.artist}", inline=True)
        embed.add_field(name=f"Duracion: {DurationFormat(RemovedSong.duration)}",
                        value=f"[Ver en Youtube]({RemovedSong.url})")
        embed.set_footer(icon_url=RemovedSong.avatar)
        embed.set_thumbnail(url=RemovedSong.thumbnail)

        await self.SendFollowUp(ctx, embed)

    async def RemoveErrorEmptyQueueMessage(self, ctx: ApplicationContext):
        embed = Embed(description="❌ No hay canciones para remover.", color=0x180081)

        await self.SendFollowUp(ctx, embed)

    async def RemoveErrorPositionMessage(self, ctx: ApplicationContext):
        embed = Embed(description="❌ La posicion es menor o mayor que el largo de la cola.", color=0x180081)

        await self.SendFollowUp(ctx, embed)

    async def ClearMessage(self, ctx: ApplicationContext):
        await self.SendFollowUp(ctx, Embed(description="Cola vaciada.", color=0x120062))

    async def LoopMessage(self, ctx: ApplicationContext, is_loop):
        Status = 'Activado 🔁' if is_loop else 'Desactivado ⛔'
        await self.SendFollowUp(ctx, Embed(description=f"Loop: {Status}.", color=0x120062))

    async def LeaveMessage(self, ctx: ApplicationContext):
        await self.SendFollowUp(ctx, Embed(description="Me desconecte.", color=0x120062))

    async def JoinMessage(self, ctx: ApplicationContext):
        await self.SendFollowUp(ctx, Embed(description=f'Me conecte al canal de voz: {ctx.author.voice.channel}',
                                           color=0x120062))

    async def SkipErrorMessage(self, ctx: ApplicationContext):
        await self.SendFollowUp(ctx, Embed(description="❌ Debe agregar musica para poder saltarla.", color=0x180081))

    async def SkipWarning(self, ctx: ApplicationContext):
        await self.SendFollowUp(ctx, Embed(description="⚠️ Esta es la ultima cancion de la cola, saltando cancion.",
                                           color=0x180081))

    async def QueueEmptyMessage(self, ctx: ApplicationContext):
        embed = Embed(title="Araña Sound - Cola de reproduccion", color=0x180081)
        embed.add_field(name="La cola esta vacia", value="")
        await self.SendFollowUp(ctx, embed)

    async def InactiveMessage(self, ctx: ApplicationContext):
        await self.SendFollowUp(ctx, Embed(description="Desconexion por inactividad"))

    async def AddSongsWaiting(self, ctx: ApplicationContext):
        embed = Embed(description="⌛ Agregando canciones...", color=0x120062)
        return await self.SendFollowUp(ctx, embed, True)

    async def AddedSongsMessage(self, ctx: ApplicationContext, Songs: list):
        embed = Embed(title="🎵🗃️ Canciones agregadas a la cola", color=0x180081)
        for data in Songs:
            if isinstance(data, SongInfo) and len(embed.fields) < 2:
                data: SongInfo = data
                embed.add_field(name=f"``{data.title}`` de ``{data.artist}``",
                                value=f"Duracion: {DurationFormat(data.duration)} - [Ver en Youtube]({data.url})")
        print(len(Songs[:-2]))
        embed.set_footer(text=f"Y se agregaron {len(Songs[:-2])} mas.")
        
        await ctx.send(embed=embed)
        
    async def AddSongsDelete(self, msg: discord.Message):
        await msg.delete()
        
        
    async def AddedSongsErrorMessage(self, ctx: ApplicationContext, Errors: list):
        embed = Embed(title=f"🎵⛔ No se agregaron {len(Errors)} canciones", color=0xff0000)
        embed.add_field(name="¿Por que?", value="Las canciones o videos que se encontraron estan sujetos a derechos de autor o estan restringidos.")
        await ctx.send(embed=embed)
        

    async def AddSongsError(self, ctx: ApplicationContext):
        await self.SendFollowUp(ctx, Embed(description="Error de busqueda contacte con el soporte"))

    async def QueueList(self, ctx: ApplicationContext, queue: list):
        pagination_view = QueueView(timeout=None)
        pagination_view.data = queue
        await pagination_view.send(ctx)

    async def JoinErrorMessage(self, ctx: ApplicationContext, e):
        await self.SendFollowUp(ctx, Embed(description=f"¡Ocurrió un error al unirse al canal de voz: {str(e)}"))

    async def JoinMissingChannelError(self, ctx: ApplicationContext):
        await self.SendFollowUp(ctx, Embed(description="¡Debes estar en un canal de voz para que el pueda unirme!"))

    async def NoSongInQueueMessage(self, ctx: ApplicationContext):
        await self.SendFollowUp(ctx, Embed(description="No hay mas canciones en la cola"))

    async def RemoveLenghtError(self, ctx: ApplicationContext):
        await self.SendFollowUp(ctx, Embed(description="No hay canciones en esa posición"))

    async def SendFollowUp(self, ctx: ApplicationContext, embed: discord.Embed, ephemeral: bool = False) -> discord.Message:
        try:
            # , ephemeral=ephemeral, delete_after=15
            return await ctx.followup.send(embed=embed)
        except Exception as e:
            return await ctx.send(embed=embed)


def DurationFormat(seconds):
    seconds = int(seconds)
    mins, secs = divmod(seconds, 60)
    hours, mins = divmod(mins, 60)
    duration_formatted = '{:02d}:{:02d}:{:02d}'.format(hours, mins, secs)
    return duration_formatted


"""
    await ctx.send(f'Conectado al canal de voz: {channel.name}')

    await ctx.send(f"¡Ocurrió un error al unirse al canal de voz: {e}")

    wait ctx.send("¡Debes estar en un canal de voz para que el bot se una!")
"""
