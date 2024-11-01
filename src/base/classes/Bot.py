import asyncio
import os

import colorama
import discord
from discord.ext import commands

from base.classes.SpiderPlayer.SpiderPlayer import SpiderPlayer
from base.classes.SpiderPlayer.player import Player
from base.db.connect import MongoDBConnection
from base.db.models.collections.GuildCol import GuildCol
from base.db.models.collections.UserCol import UserCol
from base.handlers.Handler import Handler

colorama.init(autoreset=True)

intents = discord.Intents.default()
intents.message_content = True
intents.guild_messages = True
intents.voice_states = True
intents.messages = True
intents.guilds = True


class CustomBot(commands.Bot):
    """
    CustomBot es una clase que extiende de commands.Bot y proporciona funcionalidades adicionales para un bot de Discord.

    Atributos:
        - GuildTable (GuildCol): Tabla de guilds en la base de datos.
        - players (SpiderPlayer): Instancia de SpiderPlayer asociada al bot.
        - DBConnect (MongoDBConnection): Conexión a la base de datos MongoDB.
        - synced (bool): Indica si el bot está sincronizado.
        - debug (bool): Indica si el bot está en modo debug.

    Métodos:
        - __init__(command_prefix, debug=False):
            Inicializa una instancia de CustomBot.
        - on_command_error(ctx, error):
            Maneja los errores de comandos y envía un mensaje de error al usuario.
        - load_handlers():
            Carga los controladores de eventos y comandos en el bot.
        - run(token):
            Ejecuta el bot con el token proporcionado.
        - init():
            Configura los controladores de eventos y comandos y ejecuta el bot.
    """

    GuildTable: GuildCol
    UserTable: UserCol

    def __init__(self, command_prefix, debug=False):
        super().__init__(
            command_prefix=command_prefix if not debug else "!=",
            intents=intents,
            application_id=os.getenv("devClientID") if debug else os.getenv("ClientID"),
            help_command=None,
        )

        self.players = SpiderPlayer(self)

        self.DBConnect = MongoDBConnection(os.getenv("MONGO_URI"), "SpiderBot-DB")
        self.DBConnect.connect()
        self.GuildTable = GuildCol(self.DBConnect)
        self.UserTable = UserCol(self.DBConnect)

        self.synced = False
        self.debug = debug
        self.init()

        self.run(os.getenv("devToken") if debug else os.getenv("token"))

    # async def on_command_error(self, ctx, error):
    #     if isinstance(error, commands.CommandNotFound):
    #         embed = discord.Embed(
    #             title="Error",
    #             description="El comando no existe.",
    #             color=discord.Color.red(),
    #         )
    #         return

    #     if isinstance(error, commands.MissingRequiredArgument):
    #         embed = discord.Embed(
    #             title="Error",
    #             description="Faltan argumentos.",
    #             color=discord.Color.red(),
    #         )
    #         return

    #     if isinstance(error, commands.CommandOnCooldown):
    #         embed = discord.Embed(
    #             title="Error",
    #             description=f"El comando está en cooldown. {error.retry_after:.2f} segundos restantes.",
    #             color=discord.Color.red(),
    #         )
    #         return

    #     embed = discord.Embed(
    #         title="Error",
    #         description=f"Ha ocurrido un error: {error}",
    #         color=discord.Color.red(),
    #     )

    #     await ctx.reply(embed=embed)

    async def on_disconnect(self):
        print("Bot se ha desconectado de Discord.")
        
        # Obtener los servidores que están en el sistema de reproducción
        guilds = self.players.getGuilds().values()

        for player in guilds:
            player: Player

            # Si no debe reconectarse, saltar a la siguiente iteración
            if not player.shouldReconnect:
                print(f"No se reconectará al servidor {self.get_guild(player.guild._id).name} - shouldReconnect es False.")
                continue

            try:
                # Intentar desconectar al bot del canal de voz
                status = await player.leaveVoiceChannel()
                print(f"Estado de salida del canal de voz en el servidor {self.get_guild(player.guild._id).name}: {status}")

                # Continuar solo si estaba conectado
                if status == "connected":
                    continue

                # Intentar la reconexión del reproductor tras el error
                await player.rePlayAfterError()
                print(f"Intentando reanudar la reproducción en el servidor {self.get_guild(player.guild._id).name}.")

            except Exception as e:
                print(f"Error al gestionar la reconexión en el servidor {self.get_guild(player.guild._id).name}: {e}")


    async def LoadHandler(self):
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
        asyncio.run(self.LoadHandler())
