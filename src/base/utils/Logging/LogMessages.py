import discord
from colorama import Fore

from base.utils.Logging.logger import logger
from base.utils.Logging.warnings import warnings


class LogError(logger):
    def __init__(self, title: str, message: str = ""):
        super().__init__(title, message, Fore.RED, warnings.Error.value)


class LogAviso(logger):
    def __init__(self, title: str, message: str = ""):
        super().__init__(title, message, Fore.YELLOW, warnings.Aviso.value)


class LogExitoso(logger):
    def __init__(self, title: str, message: str = ""):
        super().__init__(title, message, Fore.GREEN, warnings.Exitoso.value)


class LogInfo(logger):
    def __init__(self, title: str, message: str = ""):
        super().__init__(title, message, Fore.CYAN, warnings.Info.value)


class LogDebug(logger):
    def __init__(self, title: str, message: str = ""):
        super().__init__(title, message, Fore.MAGENTA, warnings.Debug.value)


class LogSistem(logger):
    def __init__(self, title: str, message: str = ""):
        super().__init__(title, message, Fore.CYAN, warnings.Sistem.value)


class LogCogLoaded(logger):
    def __init__(self, title: str, message: str = ""):
        super().__init__(title, message, Fore.BLUE, warnings.CogLoaded.value)


class LogEventLoaded(logger):
    def __init__(self, title: str, message: str = ""):
        super().__init__(title, message, Fore.BLUE, warnings.CogLoaded.value)


# Por implementar
# class LogCustom:


#     async def send(
#         self,
#         interaction: discord.Interaction,
#         ephemeral: bool = False,
#         delete_after: int = None,
#     ):
#         try:
#             embed = discord.Embed(
#                 title=self.title,
#                 description=self.message,
#                 color=self.color,
#             )

#             if interaction.response.is_done():
#                 msg = await interaction.followup.send(
#                     embed=embed,
#                     ephemeral=ephemeral,
#                 )

#                 if delete_after is not None:
#                     await msg.delete(delay=delete_after)

#                 return msg

#             await interaction.response.send_message(
#                 embed=embed,
#                 ephemeral=ephemeral,
#                 delete_after=delete_after,
#             )

#         except Exception as e:
#             self.log(e)
