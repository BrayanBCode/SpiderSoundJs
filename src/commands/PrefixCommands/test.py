from colorama import Fore
from discord.ext import commands

from base.classes.Bot import CustomBot
from buttons.playerMenu import playerMenu


class test(commands.Cog):
    def __init__(self, bot):
        self.bot: CustomBot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print(f"{Fore.GREEN}[Prefix Command] test cargado.")

    @commands.command(name='test', description='Test command')
    async def test(self, ctx):
        await ctx.reply(view=playerMenu())

async def setup(bot):
    await bot.add_cog(test(bot))