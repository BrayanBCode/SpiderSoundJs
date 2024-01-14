import discord
from discord.ext import commands
from discord import Embed

SERVER_MESSAGE_ID = {}

class Gestion_ext(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="message", aliases=['msg'])
    async def messageID(ctx, args):
        MessageID = args