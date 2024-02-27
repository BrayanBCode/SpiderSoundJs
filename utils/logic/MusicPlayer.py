import discord
from discord.ext import commands, tasks
from discord import option
from TESTCOG.logic.structure import MediaPlayerStructure
from discord.commands.context import ApplicationContext
from TESTCOG.logic import MusicPlayer
from discord import FFmpegPCMAudio
from discord import Embed

class MusicPlayer(MediaPlayerStructure):
    def __init__(self, bot, guild) -> None:        
        super().__init__(bot=bot, guild=guild)
        self.Queue = []
        self.is_loop = False
        self.PlayingSong = {}
        self.disconnect_task = None
        self.AfterPlayingTask = None
        self.LastCtx = None
        print(f"Intancia de MusicPlayer creada para {self.guild.id}")
        
    def check(self, guild):
        if guild == self.guild.id:
            return True
        else:
            return False
        
    async def PlaySong(self, ctx: ApplicationContext, search: str):        
        # Verificar si el autor del comando está en un canal de voz
        if ctx.author.voice:
            try:
                # Unirse al canal de voz del autor
                channel = ctx.author.voice.channel
                voice_channel = await channel.connect()
                await ctx.send(f'Conectado al canal de voz: {channel.name}')
                return
            except discord.ClientException:
                await ctx.send("¡Ya estoy en un canal de voz!")
                return
            except Exception as e:
                await ctx.send(f"¡Ocurrió un error al unirse al canal de voz: {e}")
                return
        else:
            await ctx.send("¡Debes estar en un canal de voz para que el bot se una!")
            return
        
        

