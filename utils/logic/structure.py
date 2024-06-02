from utils.interface.SendEmbed import EmbeddedMessages
from discord.ext import bridge
import discord
import datetime
import json

class PlayerStructure:
    def __init__(self, bot, guild) -> None:
        self.bot: bridge.bot = bot
        self.guild: discord.guild = guild
        self.Messages = EmbeddedMessages()

    def GetGuild(self):
        return self.guild

    def GetBot(self):
        return self.bot

    def check(self, guild):
        return guild == self.guild.id

class HelpCommandMsg:
    def __init__(self, title, description) -> None:
        self.title = title
        self.description = description

    def save(self, embed):
        embed.add_field(name=self.title, value=self.description, inline=False)

class PlayingSong:
    def __init__(self, title: str, artist: str, duracion: int, thumbnail: str, url: str):
        self.title = title
        self.artist = artist
        self.duracion = duracion
        self.thumbnail = thumbnail
        self.url = url

class CommandStructure:
    def __init__(self, server: str, name: str, parameters: dict) -> None:
        self.server = server
        self.name = name
        self.parameters = parameters
        
        print(f"{self.actualDate()} Comando '{self.name}' ejecutado en '{self.server}' \n Command parameters = {(json.dumps(self.parameters, indent=4))}")
        
    @staticmethod
    def actualDate():
        current_datetime = datetime.datetime.now()
        formatted_datetime = current_datetime.strftime("%H:%M - %d/%m/%Y")
        return formatted_datetime