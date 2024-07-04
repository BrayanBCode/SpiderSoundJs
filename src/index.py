
import asyncio
import os

import discord
from base.classes.Bot import CustomBot
import dotenv
dotenv.load_dotenv()

if __name__ == "__main__":
    intents = discord.Intents.default()
    intents.message_content = True
    intents.guild_messages = True
    intents.voice_states = True
    intents.messages = True
    intents.guilds = True

    bot = CustomBot(command_prefix="=", intents=intents, application_id='1256395249417457775')
    bot.init()
    
    bot.run(os.getenv("token"))