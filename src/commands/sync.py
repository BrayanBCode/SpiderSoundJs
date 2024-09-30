import discord
from colorama import Fore
from discord import app_commands
from discord.ext import commands

from base.classes.Bot import CustomBot
from base.utils.Logging.LogMessages import LogExitoso

OWNER_USERID = 391780901140561922


class sync(commands.Cog):
    def __init__(self, bot: CustomBot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        LogExitoso("[Prefix Command] sync cargado.").print()

    @commands.command(name="sync", description="Sincroniza el árbol de comandos.")
    async def sync(self, ctx: commands.Context):
        embed = discord.Embed(
            title="Sincronizando comandos ⏳", color=discord.Color.blue()
        )
        msg = await ctx.send(embed=embed)

        if ctx.author.id != OWNER_USERID:
            embed = discord.Embed(
                title="Error",
                description="Tienes que ser el dueño del bot para usar este comando.",
                color=discord.Color.red(),
            )
            return await msg.edit(embed=embed)

        if self.bot.synced == False:
            try:
                self.bot.synced = True
                fmt = await ctx.bot.tree.sync()
                embed = discord.Embed(
                    title="Sincronización Completa",
                    description=f"Se sincronizaron {len(fmt)} items.",
                    color=discord.Color.green(),
                )
                await msg.edit(embed=embed)
            except Exception as e:
                embed = discord.Embed(
                    title="Error",
                    description=f"Ocurrió un error al sincronizar los comandos: {e}",
                    color=discord.Color.red(),
                )
                await msg.edit(embed=embed)

        else:
            embed = discord.Embed(
                title="Sincronización",
                description="El árbol de comandos ya está sincronizado.",
                color=discord.Color.orange(),
            )
            await msg.edit(embed=embed)


async def setup(bot):
    await bot.add_cog(sync(bot))
