import discord
import os # default module
from dotenv import load_dotenv

load_dotenv() # load all the variables from the env file
bot = discord.Bot()
bot.load_extension('utils.cogs.musica')


@bot.event
async def on_ready():
    print(f"{bot.user} esta en linea!")

@bot.slash_command(name = "help", description = "Despliega el menu de ayuda")
async def help(ctx):
    await ctx.respond("Sin implementar")




bot.run(os.getenv('TEST')) # run the bot with the token