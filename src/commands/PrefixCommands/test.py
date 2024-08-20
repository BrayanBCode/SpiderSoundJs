import discord
from discord.ext import commands

from buttons.AlbumMenu.AlbumMenuView import AlbumMenu


class Test(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def test(self, ctx: commands.Context):
        view = AlbumMenu(self.bot)
        await ctx.send(view=view)


async def setup(bot):
    await bot.add_cog(Test(bot))