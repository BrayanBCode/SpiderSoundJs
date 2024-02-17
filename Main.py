import os
import sys
import discord

from discord.ext import commands
from dotenv import load_dotenv
from discord import Activity, ActivityType

load_dotenv()

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="+", intents=intents)

bot.remove_command('help')



bot.run(os.environ.get("TEST"))
