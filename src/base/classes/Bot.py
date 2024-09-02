import asyncio
import discord
import os

from discord.ext import commands
from base.classes.SpiderPlayer.SpiderPlayer import SpiderPlayer
from base.db.connect import MongoDBConnection
from base.handlers.Handler import Handler
import colorama

from base.utils.Logging.ErrorMessages import LogError, LogExitoso

colorama.init(autoreset=True)

intents = discord.Intents.default()
intents.message_content = True
intents.guild_messages = True
intents.voice_states = True
intents.messages = True
intents.guilds = True

class CustomBot(commands.Bot):
    def __init__(self, command_prefix, debug=False):
        super().__init__(
            command_prefix=command_prefix if not debug else "!=", 
            intents=intents, 
            application_id=int(os.getenv("devClientID") if debug else os.getenv("ClientID")),
            help_command=None,
            )
        
        self.players = SpiderPlayer(self)


        self.DBConnect = MongoDBConnection(os.getenv("MONGO_URI"), "SpiderBot-DB")
        self.DBConnect.connect()


        self.synced = False
        self.debug = debug
        self.init()

        self.run(os.getenv("devToken") if debug else os.getenv("token"))
    
    async def on_command_error(self, ctx, error):
        if isinstance(error, commands.CommandNotFound):
            embed = discord.Embed(title="Error", description="El comando no existe.", color=discord.Color.red())
        elif isinstance(error, commands.MissingRequiredArgument):
            embed = discord.Embed(title="Error", description="Faltan argumentos.", color=discord.Color.red())
        elif isinstance(error, commands.CommandOnCooldown):
            embed = discord.Embed(title="Error", description=f"El comando está en cooldown. {error.retry_after:.2f} segundos restantes.", color=discord.Color.red())
        else:
            embed = discord.Embed(title="Error", description=f"Ha ocurrido un error: {error}", color=discord.Color.red())
    
        await ctx.reply(embed=embed)

    async def load_handlers(self):
        """
        Carga los controladores de eventos y comandos en el bot.
        """
        handlers = Handler.getHandlers()
        for event in handlers[0]:
            await self.load_extension(event)

        for command in handlers[1]:
            await self.load_extension(command)

    def run(self, token):
        try:
            super().run(token)
        except Exception as e:
            print(f"An error occurred: {e}")

    def init(self):
        """
        Configura los controladores de eventos y comandos y ejecuta el bot.
        """
        print("--- Inicializando bot ---")
        asyncio.run(self.load_handlers())
