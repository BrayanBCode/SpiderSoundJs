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
        # guild = GuildInstance(self.bot.DBConnect.db, {"_id": ctx.guild.id, "music-setting": {"sourcevolumen": 25, "volume": 100}})
        # guild.updateOne({"music-setting": {"sourcevolumen": 50, "volume": 50}})

        # entrie = guild.table.find_one({"_id": ctx.guild.id})
        # print(entrie)

async def setup(bot):
    await bot.add_cog(Test(bot))