
import asyncio

import discord
from base.classes.Bot import CustomBot


if __name__ == "__main__":
    intents = discord.Intents.default()
    intents.message_content = True
    intents.guild_messages = True
    intents.voice_states = True
    intents.messages = True
    intents.guilds = True

    bot = CustomBot(command_prefix="=", intents=intents, application_id='1256395249417457775')
    bot.init()
    
    bot.run('MTI1NjM5NTI0OTQxNzQ1Nzc3NQ.Gnpnmc.ZV6d3VA3gjtvP9GNji2V3fTcOllKmDDc2GsKAU')