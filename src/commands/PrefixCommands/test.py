import json

import discord
from discord.ext import commands
from discord.ext.commands import command

from base.classes.SpiderPlayer.player import Player
from base.utils.Logging.LogMessages import LogAviso
from components.AlbumMenus.ControlMenuView import ControlMenu


class Test(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        LogAviso("[Prefix Command] TestCommands cargado.").print()

    @discord.app_commands.command(name="testcog", description="Comando de prueba")
    async def testcog(self, interaction: discord.Interaction):
        view = ControlMenu(self.bot)
        await interaction.response.send_message(
            "Menu de albums",
            view=view,
            ephemeral=True,
        )

    @command()
    async def settings(self, ctx: commands.Context):

        player: Player = self.bot.players.getPlayer(ctx.guild.id)

        await ctx.send(
            embed=discord.Embed(
                title=f"Configuracion de ``{ctx.guild.name}``",
                description=f"{json.dumps(player.guild.toDict(), indent=3)}",
                color=discord.Color.green(),
            ),
            delete_after=10,
        )

        # user = User(self.bot.DBConnect, userData={
        #     "_id": ctx.author.id
        # })
        # user.load_by_id()

        # await ctx.send(
        #     embed=discord.Embed(
        #         title=f"Configuracion de ``{ctx.author.nick}``",
        #         description=f"{json.dumps(user.toDict(), indent=3)}",
        #         color=discord.Color.green()
        #         )
        #     )


async def setup(bot):
    await bot.add_cog(Test(bot))
