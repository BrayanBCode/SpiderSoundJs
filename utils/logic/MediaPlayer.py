import discord
from discord.ext import commands

class MediaPlayer():
    def __init__(self, ctx: discord.commands.context.ApplicationContext) -> None:
        self.voice_client = ctx.guild.voice_client
        
    def status(self):
        print(f"""
              Conectado a un canal de voz: {self.voice_client.is_connected()}
              Esta pausado: {self.voice_client.is_paused()}
              Esta reproducion: {self.voice_client.is_playing()}
              Se esta reproduciendo: {self.voice_client.source}
              """)
    
    def play(self, source: str):
        self.voice_client.play(source, wait_finish=True)
    
    def pause(self):
        self.voice_client.pause()