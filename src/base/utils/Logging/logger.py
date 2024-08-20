from pathlib import Path
import traceback
import discord

class logger:
    """
    Clase base para los mensajes de log.
    """
    def __init__(
            self, title: str, 
            message: str, 
            ForeColor: str, 
            color: discord.Color
            ):
        self.title = title
        self.message = message
        self.color = color
        self.ForeColor = ForeColor

    async def send(self, interaction: discord.Interaction):
        try:
            await interaction.channel.send(embed=discord.Embed(
                title=self.title,
                description=self.message,
                color=self.color
            ))
        except Exception as e:
            self.log(e, traceback)

    def send(self):
        try:
            print(f"{self.ForeColor}[{self.__class__.__name__[3:]}] {self.title} - {self.message}")
        except Exception as e:
            self.log(e, traceback)

    def log(self, err: Exception, tb: traceback):
        self.create_directory_if_not_exists("logs")
        with open("logs/log.txt", "a") as log_file:
            log_file.write(f"[{self.__class__.__name__[3:]}] {err}: \n{tb.format_exc()}\n")

    @staticmethod
    def create_directory_if_not_exists(directory):
        Path(directory).mkdir(parents=True, exist_ok=True)