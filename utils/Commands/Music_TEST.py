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
        MediaPlayerIntance: MusicPlayer = self.getIntance(ctx.guild.id)
        MediaPlayerIntance.setStoped(False)
        await MediaPlayerIntance.PlaySong(ctx, search)
        
    @discord.slash_command(name = "stop", description = "Detiene la reproduccion")
    async def stop(self, ctx: ApplicationContext):
        MediaPlayerIntance: MusicPlayer = self.getIntance(ctx.guild.id)
        MediaPlayerIntance.setStoped(True)

    @discord.slash_command(name = "loop", description = "Activa o desactiva el loop de la cola")
    async def loop(self, ctx: ApplicationContext):
        MediaPlayerIntance: MusicPlayer = self.getIntance(ctx.guild.id)
        MediaPlayerIntance.loop(ctx)
        
    @discord.slash_command(name = "leave", description = "Desconecta el bot del canal de voz")
    async def leave(self, ctx: ApplicationContext):   
        MediaPlayerIntance: MusicPlayer = self.getIntance(ctx.guild.id)
        MediaPlayerIntance.leave(ctx)


    @discord.Cog.listener()
    async def on_ready(self) -> None:
        guilds = self.bot.guilds
        for guild in guilds:
            self.MusicInstances.add(MusicPlayer(self.bot, guild))
            
        
    






def setup(bot):
    bot.add_cog(Music_SlashCommands(bot))