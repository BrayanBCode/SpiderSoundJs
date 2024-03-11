import discord
import os # default module
from dotenv import load_dotenv

load_dotenv() # load all the variables from the env file
bot = discord.Bot()

cogs_list = [ # listado de cogs
    'Music',
    'Help'
]

for cog in cogs_list:
    bot.load_extension(f'utils.Commands.{cog}')
    
@bot.event
async def on_ready():
    print(f"{bot.user} esta en linea!")

bot.run(os.getenv('TOKEN')) # run the bot with the token*