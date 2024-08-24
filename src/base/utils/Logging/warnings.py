from enum import Enum
import discord


class warnings(Enum):
    Error = discord.Color.red()
    Aviso = discord.Color.yellow()
    Exitoso = discord.Color.green()
    Info = discord.Color.blue()
    Debug = discord.Color.blurple()

