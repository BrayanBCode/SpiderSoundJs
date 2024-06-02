import discord

from discord import option
from discord.ext import commands
from discord.commands.context import ApplicationContext
from src.utils.music_control.structure import CommandStructure
from src.utils.music_control.MusicPlayer import MusicPlayer


class MusicCommands(commands.Cog):
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
        CommandStructure(server=ctx.channel.guild.name, name="/play", parameters={'search': search})
        MediaPlayerInstance.setStoped(False)
        await MediaPlayerInstance.PlayInput(ctx, search)

    @discord.slash_command(name="stop", description="Detiene la reproduccion")
    async def stop(self, ctx: ApplicationContext):
        await ctx.defer()
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        CommandStructure(server=ctx.channel.guild.name, name="/stop", parameters={'None': None})
        MediaPlayerInstance.setStoped(True)
        await MediaPlayerInstance.Stop(ctx)

    @discord.slash_command(name="loop", description="Activa o desactiva el loop de la cola")
    async def loop(self, ctx: ApplicationContext):
        await ctx.defer()
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        CommandStructure(server=ctx.channel.guild.name, name="/loop", parameters={'None': None})
        await MediaPlayerInstance.loop(ctx)

    @discord.slash_command(name="leave", description="Desconecta el bot del canal de voz")
    async def leave(self, ctx: ApplicationContext):
        await ctx.defer()
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        CommandStructure(server=ctx.channel.guild.name, name="/leave", parameters={'None': None})
        await MediaPlayerInstance.leave(ctx)

    @discord.slash_command(name="skip", description="salta una o mas canciones")
    @option('posición', int, description="Posición en la que se encuentra en la cola")
    async def skip(self, ctx: ApplicationContext, posicion: int = None):
        await ctx.defer()
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        CommandStructure(server=ctx.channel.guild.name, name="/skip", parameters={'posicion': posicion})
        await MediaPlayerInstance.Skip(ctx, posicion)

    @discord.slash_command(name="queue", description="Muestra la cola de reproduccion")
    async def queue(self, ctx: ApplicationContext):
        await ctx.defer()
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        CommandStructure(server=ctx.channel.guild.name, name='/queue', parameters={'None': None})
        await MediaPlayerInstance.queue(ctx)

    @discord.slash_command(name="remove", description="Quita una cancion de la cola a eleccion, vea la posicion de la cancion con /queue")
    async def remove(self, ctx: ApplicationContext, posicion: int):
        await ctx.defer()
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        CommandStructure(server=ctx.channel.guild.name, name='/remove', parameters={'posicion': posicion})
        await MediaPlayerInstance.remove(ctx, posicion)

    @discord.slash_command(name="pause", description="Pausa la reproduccion")
    async def pause(self, ctx: ApplicationContext):
        await ctx.defer()
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        CommandStructure(server=ctx.channel.guild.name, name='/pause', parameters={'None': None})
        await MediaPlayerInstance.pause(ctx)

    @discord.slash_command(name="resume", description="reanuda la reproduccion")
    async def resume(self, ctx: ApplicationContext):
        await ctx.defer()
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        CommandStructure(server=ctx.channel.guild.name, name='/resume', parameters={'None': None})
        await MediaPlayerInstance.resume(ctx)

    @discord.slash_command(name="clear", description="Limpia la cola")
    async def clear(self, ctx: ApplicationContext):
        await ctx.defer()
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        CommandStructure(server=ctx.channel.guild.name, name='/clear', parameters={'None': None})
        await MediaPlayerInstance.clear(ctx)

    @discord.slash_command(name="join", description="Mueve o conecta el bot a tu canal de voz actual")
    async def join(self, ctx: ApplicationContext):
        await ctx.defer()
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        CommandStructure(server=ctx.channel.guild.name, name='/join', parameters={'None': None})
        await MediaPlayerInstance.JoinVoiceChannel(ctx)

    @discord.slash_command(name="forceplay", description="reproduce de manera inmediata la cancion o playlist agregada")
    @option('search', str, description="Nombre o url de la cancion")
    async def forceplay(self, ctx: ApplicationContext, search: str):
        await ctx.defer()
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        MediaPlayerInstance.setStoped(True)
        CommandStructure(server=ctx.channel.guild.name, name='/forceplay', parameters={'search': search})

        await MediaPlayerInstance.forceplay(ctx, search)
        
    @discord.slash_command(name="playnext", description="reproduce la cancion o playlist agregada despues de la actual")
    @option('search', str, description="Nombre o url de la cancion")
    async def playnext(self, ctx: ApplicationContext, search: str):
        await ctx.defer()
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        CommandStructure(server=ctx.channel.guild.name, name='/playnext', parameters={'search': search})

        await MediaPlayerInstance.playnext(ctx, search)

    @discord.slash_command(name="restart", description="En caso de falla este comando resetea por defecto los valores del Bot, no es una solución definitiva")
    async def restart(self, ctx):
        MediaPlayerInstance: MusicPlayer = self.getintance(ctx.guild.id)
        CommandStructure(server=ctx.channel.guild.name, name='/restart', parameters={'None': None})
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
        
        # if before.channel is None and after.channel:
        #     print(f"{member} se unio al canal de voz {after.channel} en {after.channel.guild.name}")
            
        # if before.channel and after.channel is None:
        #     print(f"{member} se desconecto del canal de voz {before.channel} en {before.channel.guild.name}")
            
        if before.channel and before.channel.members:
            if (len(before.channel.members) == 1 and self.bot.user in before.channel.members):
                MediaPlayerInstance: MusicPlayer = self.getintance(before.channel.guild.id)
                self.bot.loop.create_task(MediaPlayerInstance.disconnectProtocol(before.channel))

def setup(bot):
    bot.add_cog(MusicCommands(bot))
