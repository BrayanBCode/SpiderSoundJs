import discord
from discord.ext import commands
import os

from base.handlers.Handler import Handler
from base.interfaces.IConfig import IConfig

class CustomBot():
    def __init__(self):
        self.bot = commands.Bot(command_prefix="=", intents=discord.Intents.all())
        self.tree = self.bot.tree
        self.synced = False

        self.config = IConfig(
            token=os.getenv("token"),
            clientID=os.getenv("clientID"),
            devGuildID=os.getenv("devGuildID")
        )

    async def loadhandlers(self):
        events, commands = Handler.loadHandlers()  # Asumiendo que esta función es sincrónica
        extensions = events + commands

        for extension in extensions:
            print(f"--- Cargando extensión {extension}")
            try:
                await self.bot.load_extension(extension)
                print(f"Extensión {extension} cargada correctamente")
            except Exception as e:
                print(f"Error al cargar la extensión {extension}: {e}")

    def run(self):
        @self.bot.event
        async def on_ready():
            guild = discord.Object(id="1149753197573968024")  # Reemplaza ID_DEL_SERVIDOR con el ID de tu servidor
            await self.bot.tree.sync(guild=guild)
            print(f"{self.bot.user} ha iniciado sesión.")
            await self.loadhandlers()

        self.bot.run(self.config.token)

