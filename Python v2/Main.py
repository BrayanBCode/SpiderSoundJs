import discord, os, asyncio
from discord.ext import commands
from dotenv import load_dotenv

from Musica import Music_Ext

load_dotenv()

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="=", intents=intents, help_command=None)

async def main():
    async with bot:
        await bot.add_cog(Music_Ext(bot))
        await bot.start(os.environ.get('TOKEN'))

asyncio.run(main())