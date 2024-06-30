import asyncio
import discord

from discord.ext import commands
from base.classes.SpiderPlayer.SpiderPlayer import SpiderPlayer
from base.handlers.Handler import Handler
from colorama import init

init(autoreset=True)

class CustomBot(commands.Bot):
    def __init__(self, command_prefix, intents, application_id):
        super().__init__(command_prefix=command_prefix, intents=intents, application_id=application_id)
        self.synced = False
        self.players = SpiderPlayer(self)
        

    async def load_handlers(self):
        """
        Carga los controladores de eventos y comandos en el bot.
        """
        handlers = Handler.getHandlers()  # Asegúrate de que Handler.getHandlers() esté definido correctamente
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
        
