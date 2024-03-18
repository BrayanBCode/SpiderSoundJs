import discord
from discord.ext import commands
from discord import option, Embed
from discord.commands.context import ApplicationContext

from utils.logic.MessageClass import MessageClass
class ReaccionRols_SlashCommands(commands.Cog):
    def __init__(self, bot) -> None:
        self.bot = bot
        
    @discord.slash_command(name = "message", description = "Guarda el ID del mensaje")
    @option("id", str, description="ID del mensaje")
    async def message(self, ctx: ApplicationContext, id):
        await ctx.defer()
        
    @discord.slash_command(name = "add", description = "test")
    @option("id", str, description="ID del mensaje")
    async def testEmoji(self, ctx: ApplicationContext, id):
        await ctx.defer()
        
    @discord.slash_command(name = "test", description = "test")
    @option("id", str, description="ID del mensaje")
    async def test(self, ctx: ApplicationContext, id):
        await ctx.defer()
        
def setup(bot):
    bot.add_cog(ReaccionRols_SlashCommands(bot))