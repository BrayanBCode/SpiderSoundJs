import asyncio
import traceback
from pathlib import Path

import discord


class logger:
    """
    Clase base para los mensajes de log.
    """

    def __init__(self, title: str, message: str, ForeColor: str, color: discord.Color):
        self.title = title
        self.message = message
        self.color = color
        self.ForeColor = ForeColor

    async def send(self, interaction: discord.Interaction, ephemeral: bool = False, delete_after: int = None, print_log: bool = False):
        try:
            if print_log:
                self.print()

            embed = discord.Embed(
                title=self.title,
                description=self.message,
                color=self.color,
            )

            if interaction.response.is_done():
                msg = await interaction.followup.send(
                    embed=embed,
                    ephemeral=ephemeral,
                )

                if delete_after is not None:
                    await msg.delete(delay=delete_after)

                return msg

            return await interaction.response.send_message(
                embed=embed,
                ephemeral=ephemeral,
                delete_after=delete_after,
            )

        except Exception as e:
            self.log(e)

    def print(self):
        try:
            print(
                f"{self.ForeColor}[{self.__class__.__name__[3:]}] {self.title}",
                f"{self.ForeColor} \n {self.message}" if self.message != "" else "",
            )
        except Exception as e:
            self.log(e)

    def log(self, err: Exception):
        print(
            f"[{self.__class__.__name__[3:]}] {err}: \n{traceback.format_exc()}\n ------------------ \n"
        )
        self.create_directory_if_not_exists("logs")
        with open("logs/log.txt", "a") as log_file:
            log_file.write(
                f"[{self.__class__.__name__[3:]}] {err}: \n{traceback.format_exc()}\n ------------------ \n"
            )

    @staticmethod
    def create_directory_if_not_exists(directory):
        Path(directory).mkdir(parents=True, exist_ok=True)
