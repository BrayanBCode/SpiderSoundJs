from discord.commands.context import ApplicationContext
import discord
from discord import Embed
class MessageClass:
    def __init__(self) -> None:
        self.Msg: discord.Message = None
        self.Rol = None
        self.Emoji = None
        

    async def saveMsg(self, ctx: ApplicationContext, msgID: int):
        try:
            self.Msg: discord.Message = await ctx.fetch_message(msgID)
            await ctx.followup.send(embed=Embed(description="Mensaje guardado con exito"))
        except Exception:
            await ctx.followup.send(Embed(description="No se pudo guardar el mensaje"))
            

    async def setEmoj(self, ctx: ApplicationContext, emoji: str):
        self.Emoji = emoji
        await ctx.followup.send(embed=Embed(description=emoji), ephemeral=True, delete_after=5)
