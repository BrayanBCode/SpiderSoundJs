import asyncio
import discord
import os

from discord.ext import commands
from base.classes.SpiderPlayer.SpiderPlayer import SpiderPlayer
from base.handlers.Handler import Handler
import colorama

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
            command_prefix=command_prefix, 
            intents=intents, 
            application_id=int(os.getenv("ClientID")) if debug else int(os.getenv("devClientID"))
            )
        self.debug = debug
        self.synced = False
        self.players = SpiderPlayer(self)

        self.init()

        self.run(os.getenv("devToken") if debug else os.getenv("token"))

    async def load_handlers(self):
        """
        Carga los controladores de eventos y comandos en el bot.
        """
        handlers = Handler.getHandlers()
        for event in handlers[0]:
            await self.load_extension(event)

        for command in handlers[1]:
            await self.load_extension(command)

    def init(self):
        """
        Configura los controladores de eventos y comandos y ejecuta el bot.
        """
        print("--- Inicializando bot ---")
        asyncio.run(self.load_handlers())
