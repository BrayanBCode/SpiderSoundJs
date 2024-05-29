import discord
from discord import option
from discord.commands.context import ApplicationContext
from discord.ext import commands

from utils.logic.MusicPlayer import MusicPlayer


# from testosterona.PlayTest import Test
#

class MusicSlashCommands(commands.Cog):
    def __init__(self, bot: discord.Bot) -> None:
        self.bot = bot
        self.MusicInstances = set()

    def getintance(self, guildid: discord.Guild):
        for guild in self.MusicInstances:
            if guild.check(guildid):
                return guild

    @discord.slash_command(name="play", description="Agrega y reproduce musica desde YT")
    @option('search', str, description="Nombre o url de la cancion")
    async def play(self, ctx: ApplicationContext, search: str = None):
        await ctx.defer()
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        MediaPlayerInstance.setStoped(False)
        await MediaPlayerInstance.PlayInput(ctx, search)

    @discord.slash_command(name="stop", description="Detiene la reproduccion")
    async def stop(self, ctx: ApplicationContext):
        await ctx.defer()
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        MediaPlayerInstance.setStoped(True)
        await MediaPlayerInstance.Stop(ctx)

    @discord.slash_command(name="loop", description="Activa o desactiva el loop de la cola")
    async def loop(self, ctx: ApplicationContext):
        await ctx.defer()
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        await MediaPlayerInstance.loop(ctx)

    @discord.slash_command(name="leave", description="Desconecta el bot del canal de voz")
    async def leave(self, ctx: ApplicationContext):
        await ctx.defer()
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        await MediaPlayerInstance.leave(ctx)

    @discord.slash_command(name="skip", description="salta una o mas canciones")
    @option('posición', int, description="Posición en la que se encuentra en la cola")
    async def skip(self, ctx: ApplicationContext, posicion: int = None):
        await ctx.defer()
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        await MediaPlayerInstance.Skip(ctx, posicion)

    @discord.slash_command(name="queue", description="Muestra la cola de reproduccion")
    async def queue(self, ctx: ApplicationContext):
        await ctx.defer()
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        await MediaPlayerInstance.queue(ctx)

    @discord.slash_command(name="remove",
                           description="Quita una cancion de la cola a eleccion, "
                                       "vea la posicion de la cancion con /queue")
    async def remove(self, ctx: ApplicationContext, posicion: int):
        await ctx.defer()
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        await MediaPlayerInstance.remove(ctx, posicion)

    @discord.slash_command(name="pause", description="Pausa la reproduccion")
    async def pause(self, ctx: ApplicationContext):
        await ctx.defer()
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        await MediaPlayerInstance.pause(ctx)

    @discord.slash_command(name="resume", description="reanuda la reproduccion")
    async def resume(self, ctx: ApplicationContext):
        await ctx.defer()
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        await MediaPlayerInstance.resume(ctx)

    @discord.slash_command(name="clear", description="Limpia la cola")
    async def clear(self, ctx: ApplicationContext):
        await ctx.defer()
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        await MediaPlayerInstance.clear(ctx)

    @discord.slash_command(name="join", description="Mueve o conecta el bot a tu canal de voz actual")
    async def join(self, ctx: ApplicationContext):
        await ctx.defer()
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        await MediaPlayerInstance.JoinVoiceChannel(ctx)

    @discord.slash_command(name="forceplay", description="salta una o mas canciones")
    async def forceplay(self, ctx: ApplicationContext, url: str):
        await ctx.defer()
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        MediaPlayerInstance.setStoped(True)
        await MediaPlayerInstance.forceplay(ctx, url)

    @discord.slash_command(name="restart", description="En caso de falla este comando resetea por defecto los valores "
                                                       "del Bot, no es una solución definitiva")
    async def restart(self, ctx):
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        MediaPlayerInstance.restart()

    @discord.Cog.listener()
    async def on_guild_join(self, guild):
        self.MusicInstances.add(MusicPlayer(self.bot, guild))

    @discord.Cog.listener()
    async def on_ready(self) -> None:
        guilds = self.bot.guilds
        for guild in guilds:
            self.MusicInstances.add(MusicPlayer(self.bot, guild))

    @discord.Cog.listener()
    async def on_voice_state_update(self, member, before: discord.VoiceState, after: discord.VoiceState):
        
        if before.channel is None and after.channel:
            print(f"{member} se unio al canal de voz {after.channel} en {after.channel.guild.name}")
            
        if before.channel and after.channel is None:
            print(f"{member} se desconecto del canal de voz {before.channel} en {before.channel.guild.name}")
            
        # (member == self.bot.user and after.channel is None) or 
        if before.channel and before.channel.members:
            if (len(before.channel.members) == 1 and self.bot.user in before.channel.members):
                MediaPlayerInstance: MusicPlayer = self.getintance(before.channel.guild.id)
                self.bot.loop.create_task(MediaPlayerInstance.disconnectProtocol(before.channel))

def setup(bot):
    bot.add_cog(MusicSlashCommands(bot))
