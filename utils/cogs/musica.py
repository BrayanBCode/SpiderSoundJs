import discord
from discord.ext import commands
from discord import option
from discord import Embed

serverQueue = {}

class musica(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        
    @discord.slash_command(name = "play", description = "Agrega y reproduce musica desde YT, puede utilizar una url, nombre de la cancion y url de Spotify")
    async def play(self, ctx, url: str):
        channel = ctx.author.voice.channel
        voice_client =  ctx.guild.voice_client
        Guild = ctx.guild
        
        if not voice_client:
            if channel:
                await channel.connect()
            else:
                ctx.send(embed=Embed(description='❌ Debe estar conectado a un canal de voz'))
                return
            
        await ctx.respond("Sin implementar")

    @discord.slash_command(name = "forceplay", description = "salta una o mas canciones")
    async def forceplay(self, ctx, posición: int):
        await ctx.respond("Sin implementar")

    @discord.slash_command(name = "skip", description = "salta una o mas canciones")
    @option('posición', int, description="Posición en la que se encuentra en la cola")
    async def skip(self, ctx, posición: int = None):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "remove", description = "Quita una cancion de la cola a eleccion, vea la posicion de la cancion con /queue")
    async def remove(self, ctx, posición: int):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "pause", description = "Pausa la reproduccion")
    async def pause(self, ctx,):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "resume", description = "reanuda la reproduccion")
    async def resume(self, ctx,):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "stop", description = "Detiene la reproduccion")
    async def stop(self, ctx,):
        await ctx.respond("Sin implementar")     
        
    @discord.slash_command(name = "queue", description = "Muestra la cola de reproduccion")
    async def queue(self, ctx,):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "clear", description = "Limpia la cola")
    async def clear(self, ctx,):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "loop", description = "Activa o desactiva el loop de la cola")
    async def loop(self, ctx,):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "leave", description = "Desconecta el bot del canal de voz")
    async def leave(self, ctx,):
        await ctx.respond("Sin implementar")
        
def setup(bot):
    bot.add_cog(musica(bot))