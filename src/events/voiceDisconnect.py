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

	async def reconnect_voice(self, player: Player):
		if player.last_voice_channel and player.should_reconnect:  # Verifica should_reconnect antes de reconectar
			player.voiceChannel = await player.last_voice_channel.connect()
			print(f"{Fore.BLUE}[Voice] Reconectado al canal de voz '{player.last_voice_channel.name}' en '{self.bot.get_guild(player.guild).name}'.")


	@commands.Cog.listener()
	async def on_voice_state_update(self, member, before, after):
		if member.id != self.bot.user.id:
			return

		# Detecta si el bot se desconecta del canal de voz
		if before.channel is not None and after.channel is None:
			print(f"{Fore.BLUE}[Voice] Bot desconectado de '{before.channel.guild.name}'.")
	
			player: Player = self.bot.players.get_player(member.guild.id)
			await player.destroy()
			
			# Intenta reconectar si should_reconnect es True
			if player.last_voice_channel and player.should_reconnect:
				try:
					player.voiceChannel = await player.last_voice_channel.connect()
					print(f"{Fore.BLUE}[Voice] Reconectado al canal de voz '{player.last_voice_channel.name}' en '{self.bot.get_guild(player.guild).name}'.")
	
					# Reanuda la reproducción si es necesario
					if len(player.queue) > 0:
						player.play()
				except Exception as e:
					print(f"{Fore.RED}[Error] No se pudo reconectar al canal de voz: {e}")

		# Resto de tu lógica de manejo de estados de voz...
	
async def setup(bot):
	await bot.add_cog(voiceDisconnect(bot))