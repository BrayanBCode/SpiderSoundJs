from colorama import Fore
import discord
from discord.ext import commands
import asyncio

from base.classes.Bot import CustomBot
from base.classes.SpiderPlayer.player import Player

class voiceDisconnect(commands.Cog):
	def __init__(self, bot: CustomBot):
		self.bot = bot
		self.inactivity_timer = None

	async def disconnect_for_inactivity(self, guild_id):
		await asyncio.sleep(120)  # Espera 2 minutos por inactividad
		guild = self.bot.get_guild(guild_id)
		player: Player = self.bot.players.get_player(guild_id)
		if guild.voice_client and not player.voiceChannel.is_playing():  # Verifica si el bot está conectado y no está reproduciendo música
			await guild.voice_client.disconnect()
			await player.playingMsg.edit(view=None)
			player.destroy()
			print(f"{Fore.BLUE}[Voice] Bot desconectado de '{guild.name}' por inactividad.")

	def reset_inactivity_timer(self, guild_id):
		if self.inactivity_timer:
			self.inactivity_timer.cancel()  # Cancela el temporizador anterior si existe
		self.inactivity_timer = asyncio.create_task(self.disconnect_for_inactivity(guild_id))

	@commands.Cog.listener()
	async def on_voice_state_update(self, member, before, after):
		if member.id != self.bot.user.id:
			return
        
		if not member.guild.voice_client:
			return

		player: Player = self.bot.players.get_player(member.guild.id)
		if player and hasattr(player.voiceChannel, 'is_playing') and not player.voiceChannel.is_playing():
			# Si el bot no está reproduciendo música, inicia o reinicia el temporizador de inactividad
			self.reset_inactivity_timer(member.guild.id)
			
async def setup(bot):
    await bot.add_cog(voiceDisconnect(bot))