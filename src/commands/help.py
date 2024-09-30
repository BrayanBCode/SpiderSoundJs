import discord
from discord.ext import commands

from base.classes.Bot import CustomBot
from base.interfaces.IHelpCommand import IHelpCommand
from base.utils.colors import Colours
from base.utils.Logging.LogMessages import LogExitoso
from components import button_paginator as pg


class help(commands.Cog):
    def __init__(self, bot):
        self.bot: CustomBot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        LogExitoso("[Hybrid Command] help cargado.").print()

    def add_command(self, command_dict, name, description, slash_command=False, prefix_command=False):
        if name not in command_dict.keys():
            command_dict[name] = IHelpCommand(name, description, slash_command, prefix_command)
        else:
            if slash_command:
                command_dict[name].slash_command = True
            if prefix_command:
                command_dict[name].prefix_command = True

    @commands.hybrid_command(name="help", with_app_command=True, description="Muestra la lista de commandos del bot.")
    async def help(self, ctx: commands.Context):
            
        command_dict = {}
        for cog in self.bot.cogs.values():
            for command in cog.__cog_app_commands__:
                self.add_command(command_dict, command.name, command.description, slash_command=True)

            for command in cog.__cog_commands__:
                self.add_command(command_dict, command.name, command.description, prefix_command=True)

        commandList: list[IHelpCommand] = list(command_dict.values())

        pages = []
        for i in range(0, len(commandList), 6):
            embed = discord.Embed(title="Lista de comandos", color=Colours.default())
            embed.set_footer(text=f"Por {ctx.author.display_name}", icon_url=ctx.author.avatar.url)
            embed.timestamp = ctx.message.created_at

            for command in commandList[i:i+6]:
                embed.add_field(
                    name=f"**{"/" if command.slash_command else self.bot.command_prefix}{command.name}**", 
                    value=f"> {command.description if command.description != "" else "Sin descripción"}", inline=True)
                
            pages.append(embed)

        pag = pg.Paginator(self.bot, pages, ctx)
        
        pag.add_button("first", emoji="⏪", style=discord.ButtonStyle.blurple)
        pag.add_button("prev", emoji="◀️", style=discord.ButtonStyle.blurple)
        pag.add_button("goto")
        pag.add_button("next", emoji="▶️", style=discord.ButtonStyle.blurple)
        pag.add_button("last", emoji="⏩", style=discord.ButtonStyle.blurple)
        pag.add_button("delete", emoji="🗑️", style=discord.ButtonStyle.red)
        await pag.start()

async def setup(bot):
    await bot.add_cog(help(bot))