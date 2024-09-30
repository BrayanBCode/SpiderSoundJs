import asyncio
from datetime import datetime, timedelta, timezone

import discord
from colorama import Fore
from discord import Member, VoiceState
from discord.ext import commands

from base.classes.Bot import CustomBot
from base.classes.SpiderPlayer.player import Player
from base.utils.Logging.LogMessages import LogAviso, LogDebug, LogError, LogExitoso


class voiceDisconnect(commands.Cog):
    def __init__(self, bot: CustomBot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        LogExitoso("[Event] voiceDisconnect cargado.").print()

    @commands.Cog.listener()
    async def on_voice_state_update(
        self, member: Member, before: VoiceState, after: VoiceState
    ):
        """
        Listener que se activa cuando un usuario se une o sale de un canal de voz.
        """

        player: Player | None = self.bot.players.getPlayer(member.guild.id)
        BotDisconnected = (
            before.channel is not None
            and after.channel is None
            and member.id == self.bot.user.id
        )

        if player and player.VoiceClient and player.VoiceClient.channel:
            if len(player.VoiceClient.channel.members) == 1:
                LogDebug(
                    f"El bot esta solo en el canal de voz '{player.VoiceClient.channel.name}' en '{member.guild.name}'."
                ).print()
                await player.RestartInactivityTimer()

        if self.usersActivity(member, before, after):
            return

        if BotDisconnected:

            LogDebug(
                f"El bot ha sido desconectado del canal de voz en '{member.guild.name}'."
            ).print()
            if player:
                player.last_voice_channel = before.channel

            LogDebug(
                f"El bot se reconectará al canal de voz en '{member.guild.name}'."
            ).print()

            if await self.ShouldReconnect(player):
                return

        if player:
            if await player.disconnectedByInactivity():
                await player.InactivityTimer()
                return

    def usersActivity(self, member, before, after):

        if member.id != self.bot.user.id and before.channel is None and after.channel:
            LogDebug(
                title=f"El usuario '{member.display_name}'",
                message=f"se ha unido al canal de voz '{after.channel.name}' en '{member.guild.name}'.",
            ).print()
            return True

        if member.id != self.bot.user.id and before.channel and after.channel is None:
            LogDebug(
                title=f"El usuario '{member.display_name}'",
                message=f"se ha desconectado del canal de voz '{before.channel.name}' en '{member.guild.name}'.",
            ).print()
            return True

        if member.id != self.bot.user.id and before.channel.id != after.channel.id:
            LogDebug(
                title=f"El usuario '{member.display_name}'",
                message=f"ha cambiado de canal de voz de '{before.channel.name}' a '{after.channel.name}' en '{member.guild.name}'.",
            ).print()
            return True

        return False

    # Deprecated
    async def ShouldReconnect(self, player: Player):
        pass

        # if player.shouldReconnect:

        # 	await player.joinVoiceChannel(player.last_voice_channel)

        # 	if player.queue:
        # 		LogAviso(f"Intentando reanudar reproducíon en '{self.bot.get_guild(player.guild._id).name}'.").print()
        # 		player.add_song_at(player.lastSong)
        # 		await player.play()

        # 	print(f"{Fore.BLUE}[Voice] Reconectado al canal de voz '{player.last_voice_channel.name}' en '{self.bot.get_guild(player.guild._id).name}'.")
        # 	return True

    # Deprecated
    # async def kickedByUser(self, member: Member, player: Player):
    # 	guild = member.guild

    # 	recentDisconnect = None
    # 	idx = 0
    # 	async for entrie in guild.audit_logs(limit=2, action=discord.AuditLogAction.member_disconnect):
    # 		idx += 1

    # 		if entrie.extra.count > 1:
    # 			player.lastForceDisconnect = entrie.created_at

    # 			time = (datetime.now(timezone.utc) - player.lastForceDisconnect).total_seconds()
    # 			print("time:", time)
    # 			return time <= 60

    # 		if idx == 1:
    # 			recentDisconnect = entrie.created_at
    # 			continue

    # 		player.lastForceDisconnect = entrie.created_at

    # 	if not player.lastForceDisconnect:
    # 		player.lastForceDisconnect = recentDisconnect
    # 		recentDisconnect = None

    # 		LogDebug(f"No se ha encontrado un registro de desconexión forzada en '{guild.name}'.", f"player.lastForceDisconnect: {player.lastForceDisconnect}").print()
    # 		return False

    # 	if not recentDisconnect:
    # 		LogDebug(f"No se ha encontrado un registro de desconexión reciente en '{guild.name}'.", f"recentDisconnect: {recentDisconnect}").print()
    # 		return False

    # 	if not player.lastForceDisconnect:
    # 		LogDebug(f"No se ha encontrado un registro de desconexión forzada en '{guild.name}'.", f"player.lastForceDisconnect: {player.lastForceDisconnect}").print()
    # 		return False

    # 	time = recentDisconnect and (recentDisconnect - player.lastForceDisconnect).total_seconds()
    # 	print("time:", time)

    # 	if time <= 60:
    # 		return True

    # 	return False

    # 	# print("patata:" ,(recentDisconnect - player.lastForceDisconnect).total_seconds())

    # 	# if (player.lastForceDisconnect - recentDisconnect).total_seconds() <= 3:
    # 	# 	LogAviso(f"El bot ha sido desconectado del canal de voz por {entrie.user}.").print()
    # 	# 	return True

    # 	# if (datetime.now() - self.LastMemberDisconnected) <= timedelta(seconds=3):
    # 	# 	LogAviso(f"El bot ha sido desconectado del canal de voz por {entrie.user}.").print()
    # 	# 	return True

    # 	return False

    async def on_error(event: str, *args, **kwargs):
        LogError(
            title=f"Ha ocurrido un error en el evento '{event}'.",
            message=f"args: {args} \nkwargs: {kwargs}",
        ).log()


async def setup(bot):
    await bot.add_cog(voiceDisconnect(bot))
