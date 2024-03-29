import discord
from discord.ext import commands, tasks
from discord import option

from discord.commands.context import ApplicationContext
from utils.logic.MusicPlayer import MusicPlayer
from discord import FFmpegPCMAudio
from discord import Embed

class Music_SlashCommands(commands.Cog):
    def __init__(self, bot: discord.Bot) -> None:
        self.bot = bot
        self.MusicInstances = set()
        
    def getIntance(self, guildId: discord.Guild):
        for guild in self.MusicInstances:
            if guild.check(guildId):
                return guild
                
    @discord.slash_command(name = "play", description = "Agrega y reproduce musica desde YT")
    @option('search', str, description="Nombre o url de la cancion")
    async def PlayCommand(self, ctx: ApplicationContext, search: str = None):
        await ctx.defer()
        MediaPlayerIntance: MusicPlayer = self.getIntance(ctx.guild.id)
        MediaPlayerIntance.setStoped(False)
        await MediaPlayerIntance.PlaySong(ctx, search)
        
    @discord.slash_command(name = "stop", description = "Detiene la reproduccion")
    async def stop(self, ctx: ApplicationContext):
        await ctx.defer()
        MediaPlayerIntance: MusicPlayer = self.getIntance(ctx.guild.id)
        MediaPlayerIntance.setStoped(True)
        await MediaPlayerIntance.Stop(ctx)
        
    @discord.slash_command(name = "loop", description = "Activa o desactiva el loop de la cola")
    async def loop(self, ctx: ApplicationContext):
        await ctx.defer()
        MediaPlayerIntance: MusicPlayer = self.getIntance(ctx.guild.id)
        await MediaPlayerIntance.loop(ctx)
        
    @discord.slash_command(name = "leave", description = "Desconecta el bot del canal de voz")
    async def leave(self, ctx: ApplicationContext):   
        await ctx.defer()
        MediaPlayerIntance: MusicPlayer = self.getIntance(ctx.guild.id)
        await MediaPlayerIntance.leave(ctx)
        
    @discord.slash_command(name = "skip", description = "salta una o mas canciones")
    @option('posición', int, description="Posición en la que se encuentra en la cola")
    async def skip(self, ctx: ApplicationContext, posicion: int = None):
        await ctx.defer()
        MediaPlayerIntance: MusicPlayer = self.getIntance(ctx.guild.id)
        await MediaPlayerIntance.Skip(ctx, posicion)
        
    @discord.slash_command(name = "queue", description = "Muestra la cola de reproduccion")
    async def queue(self, ctx: ApplicationContext):
        await ctx.defer()
        MediaPlayerIntance: MusicPlayer = self.getIntance(ctx.guild.id)
        await MediaPlayerIntance.queue(ctx)
        
    @discord.slash_command(name = "remove", description = "Quita una cancion de la cola a eleccion, vea la posicion de la cancion con /queue")
    async def remove(self, ctx: ApplicationContext, posición: int):   
        await ctx.defer()
        MediaPlayerIntance: MusicPlayer = self.getIntance(ctx.guild.id)
        await MediaPlayerIntance.remove(ctx, posición)       
        
    @discord.slash_command(name = "pause", description = "Pausa la reproduccion")
    async def pause(self, ctx: ApplicationContext):
        await ctx.defer()
        MediaPlayerIntance: MusicPlayer = self.getIntance(ctx.guild.id)
        await MediaPlayerIntance.pause(ctx)
        
    @discord.slash_command(name = "resume", description = "reanuda la reproduccion")
    async def resume(self, ctx: ApplicationContext):
        await ctx.defer()
        MediaPlayerIntance: MusicPlayer = self.getIntance(ctx.guild.id)    
        await MediaPlayerIntance.resume(ctx)
        
    @discord.slash_command(name = "clear", description = "Limpia la cola")
    async def clear(self, ctx: ApplicationContext):
        await ctx.defer()
        MediaPlayerIntance: MusicPlayer = self.getIntance(ctx.guild.id)
        await MediaPlayerIntance.clear(ctx)    
        
    @discord.slash_command(name = "join", description = "Mueve o conecta el bot a tu canal de voz actual")
    async def clear(self, ctx: ApplicationContext):        
        await ctx.defer()
        MediaPlayerIntance: MusicPlayer = self.getIntance(ctx.guild.id)
        await MediaPlayerIntance.join(ctx)        
        
    @discord.slash_command(name = "forceplay", description = "salta una o mas canciones")
    async def forceplay(self, ctx: ApplicationContext, url: str):  
        await ctx.defer()
        MediaPlayerIntance: MusicPlayer = self.getIntance(ctx.guild.id)
        MediaPlayerIntance.setStoped(False)
        await MediaPlayerIntance.forceplay(ctx, url)
        
    @discord.Cog.listener()
    async def on_guild_join(self, guild):
        self.MusicInstances.add(MusicPlayer(self.bot, guild))
        
    @discord.Cog.listener()
    async def on_ready(self) -> None:
        guilds = self.bot.guilds
        for guild in guilds:
            self.MusicInstances.add(MusicPlayer(self.bot, guild))
            
    @discord.Cog.listener()
    async def on_voice_state_update(self, member, before, after):
        if member == self.bot.user:
            if after.channel is None:
                MediaPlayerIntance: MusicPlayer = self.getIntance(before.channel.guild.id)
                MediaPlayerIntance.setStoped(True)
                MediaPlayerIntance.voice_client = None
                MediaPlayerIntance.Queue = []
                
def setup(bot):
    bot.add_cog(Music_SlashCommands(bot))