import json
from colorama import Fore
import discord
from discord.ext import commands
from discord.ext.commands import command

from base.classes.SpiderPlayer.player import Player
from base.db.models.entries.User import User
from buttons.AlbumMenu.AlbumMenuView import AlbumMenu


class Test(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print(f"{Fore.YELLOW}[Prefix Command] TestCommands cargado.")

    @commands.command()
    async def test(self, ctx: commands.Context):
        view = AlbumMenu(self.bot)
        await ctx.send(view=view)
        # guild = GuildInstance(self.bot.DBConnect.db, {"_id": ctx.guild.id, "music-setting": {"sourcevolumen": 25, "volume": 100}})
        # guild.updateOne({"music-setting": {"sourcevolumen": 50, "volume": 50}})

        # entrie = guild.table.find_one({"_id": ctx.guild.id})
        # print(entrie)

    @command()
    async def settings(self, ctx: commands.Context):

        player: Player = self.bot.players.get_player(ctx.guild.id)

        await ctx.send(
            embed=discord.Embed(
                title=f"Configuracion de ``{ctx.guild.name}``", 
                description=f"{json.dumps(player.GuildTable.toDict(), indent=3)}", 
                color=discord.Color.green()
                )
            )

        user = User(self.bot.DBConnect, userData={
            "_id": ctx.author.id
        })
        user.load_by_id()

        await ctx.send(
            embed=discord.Embed(
                title=f"Configuracion de ``{ctx.author.nick}``", 
                description=f"{json.dumps(user.toDict(), indent=3)}", 
                color=discord.Color.green()
                )
            )

async def setup(bot):
    await bot.add_cog(Test(bot))