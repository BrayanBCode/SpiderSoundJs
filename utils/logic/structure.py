from utils.interface.SendEmbed import EmbeddedMessages
import discord

class MediaPlayerStructure:
    def __init__(self, bot, guild) -> None:
        self.bot = bot
        self.guild: discord.guild = guild
        self.Messages = EmbeddedMessages()

    def GetGuild(self):
        return self.guild

    def GetBot(self):
        return self.bot

    def check(self, guild):
        return guild == self.guild.id

class HelpCommandMsg():
    def __init__(self, title, description) -> None:
        self.title = title
        self.description = description

    def save(self, embed):
        embed.add_field(name=self.title, value=self.description, inline=False)

class SpotifyInstance():
    def __init__(self, title, artist) -> None:
        self.title = title
        self.artist = artist

    def Get(self):
        return (self.title, self.artist)

class PlayingSong:
    def __init__(self, title: str, artist: str, duracion: int, thumbnail: str, url: str):
        self.title = title
        self.artist = artist
        self.duracion = duracion
        self.thumbnail = thumbnail
        self.url = url




