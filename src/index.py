
import asyncio
import sys, os

import discord
from base.classes.Bot import CustomBot
import dotenv
dotenv.load_dotenv()

sys.path.append("..")

if __name__ == "__main__":
    intents = discord.Intents.default()
    intents.message_content = True
    intents.guild_messages = True
    intents.voice_states = True
    intents.messages = True
    intents.guilds = True

    debug = False

    if debug == True:
        bot = CustomBot(command_prefix="==", intents=intents, application_id=int(os.getenv("devClientID")))

        bot.init()
        
        bot.run(os.getenv("devToken"))

    else:
        bot = CustomBot(command_prefix="=", intents=intents, application_id=os.getenv("ClientID"))

        bot.init()
        
        bot.run(os.getenv("token"))
