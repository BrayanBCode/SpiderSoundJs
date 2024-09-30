import discord

from base.classes.music.Video import SingleVideo
from base.classes.SpiderPlayer.player import Player
from base.utils.colors import Colours
from base.utils.Logging.LogMessages import LogAviso, LogError, LogExitoso, LogInfo
from base.utils.simpleTools import simpleTools
from components import button_paginator as pg


class playerMenu(discord.ui.View):
    def __init__(
        self, interaction: discord.Interaction, player: Player, video: SingleVideo
    ):
        super().__init__(timeout=None)
        self.interaction = interaction
        self.player: Player = player
        self.video = video
        self.bot = player.bot
        self.msg: discord.Message = None
        self.cont = 0

    async def Send(self):
        if self.player.lastSong:
            self.children[1].disabled = False
        else:
            self.children[1].disabled = True

        if self.msg:
            await self.msg.edit(embed=self.EmbebededMsg(), view=self)
            return

        self.msg = await self.interaction.channel.send(
            embed=self.EmbebededMsg(),
            view=self,
            silent=True,
        )
        return self.msg

    @discord.ui.button(emoji="🔢", style=discord.ButtonStyle.gray, custom_id="queue")
    async def queue(self, interaction: discord.Interaction, button: discord.ui.Button):
        player: Player = self.bot.players.getPlayer(interaction.guild_id)

        if player:
            user_voice_state = interaction.user.voice
            bot_voice_channel = (
                interaction.guild.voice_client.channel
                if interaction.guild.voice_client
                else None
            )

            if not user_voice_state or user_voice_state.channel != bot_voice_channel:
                await LogError("Debes estar en el mismo canal de voz que el bot.").send(
                    interaction, ephemeral=True
                )
                return

            if len(player.queue) == 0:
                await LogAviso("No hay canciones en la cola.").send(interaction)
                return

            pages = []
            for i in range(0, len(player.queue), 7):
                embed = discord.Embed(
                    title="Lista de reproducción", color=Colours.default()
                )
                embed.set_footer(
                    text=f"Por {interaction.user.display_name}",
                    icon_url=interaction.user.avatar.url,
                )
                embed.timestamp = interaction.created_at

                for index, song in enumerate(player.queue[i : i + 7], start=i + 1):
                    hours, remainder = divmod(song.duration, 3600)
                    minutes, seconds = divmod(remainder, 60)

                    duration_str = (
                        f"{hours:02}:{minutes:02}:{seconds:02}"
                        if hours
                        else f"{minutes:02}:{seconds:02}"
                    )

                    embed.add_field(
                        name=f"{index}. {song.title}",
                        value=f"Duración: {duration_str}",
                        inline=False,
                    )
                pages.append(embed)

            pag = pg.Paginator(self.bot, pages, interaction)

            pag.add_button("first", emoji="⏮️", style=discord.ButtonStyle.blurple)
            pag.add_button("prev", emoji="⏪", style=discord.ButtonStyle.blurple)
            pag.add_button("goto")
            pag.add_button("next", emoji="⏩", style=discord.ButtonStyle.blurple)
            pag.add_button("last", emoji="⏭️", style=discord.ButtonStyle.blurple)
            pag.add_button("delete", emoji="🗑️", style=discord.ButtonStyle.red)
            await pag.start()
            return

        await LogAviso("No hay canciones en la cola.").send(interaction)
        return

    @discord.ui.button(emoji="⏪", style=discord.ButtonStyle.primary, custom_id="back")
    async def back(self, interaction: discord.Interaction, button: discord.ui.Button):
        user_voice_state = interaction.user.voice
        bot_voice_channel = (
            interaction.guild.voice_client.channel
            if interaction.guild.voice_client
            else None
        )

        await interaction.channel.send(self.player.lastSong.title)

        if not user_voice_state or user_voice_state.channel != bot_voice_channel:
            await LogError("Debes estar en el mismo canal de voz que el bot.").send(
                interaction, ephemeral=True
            )
            return

        if self.player.VoiceClient.is_playing():
            await self.player.back()
            await LogExitoso("Reproduciendo canción anterior.").send(interaction)
            return

        await LogAviso("No hay canciones en la cola.").send(interaction)
        return

    @discord.ui.button(emoji="⏹️", style=discord.ButtonStyle.red)
    async def stop(self, interaction: discord.Interaction, button: discord.ui.Button):
        user_voice_state = interaction.user.voice
        bot_voice_channel = (
            interaction.guild.voice_client.channel
            if interaction.guild.voice_client
            else None
        )

        if not user_voice_state or user_voice_state.channel != bot_voice_channel:
            await LogError("Debes estar en el mismo canal de voz que el bot.").send(
                interaction, ephemeral=True
            )
            return

        await self.player.stop()
        await LogExitoso("Se ha detenido la reproducción.").send(interaction)

    @discord.ui.button(emoji="⏯️", style=discord.ButtonStyle.primary)
    async def pause(self, interaction: discord.Interaction, button: discord.ui.Button):
        user_voice_state = interaction.user.voice
        bot_voice_channel = (
            interaction.guild.voice_client.channel
            if interaction.guild.voice_client
            else None
        )

        if not user_voice_state or user_voice_state.channel != bot_voice_channel:
            await LogError("Debes estar en el mismo canal de voz que el bot.").send(
                interaction
            )
            return

        if self.player.stoped:
            self.player.play()
            await LogExitoso("Se ha reanudado la reproducción.").send(
                interaction, delete_after=7
            )

        if self.player.VoiceClient.is_paused():
            await self.player.resume()
            await LogExitoso("Reanudado ▶️").send(interaction)
            return

        await self.player.pause()
        await LogExitoso("Pausado ⏸️").send(interaction)

    @discord.ui.button(emoji="⏩", style=discord.ButtonStyle.primary)
    async def skip(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.defer()

        user_voice_state = interaction.user.voice
        bot_voice_channel = (
            interaction.guild.voice_client.channel
            if interaction.guild.voice_client
            else None
        )

        if not user_voice_state or user_voice_state.channel != bot_voice_channel:
            await LogError("Debes estar en el mismo canal de voz que el bot.").send(
                interaction
            )
            return

        player: Player = self.bot.players.getPlayer(interaction.guild_id)

        if player:
            if len(player.queue) != 0:
                await player.stop()
                await player.play(interaction)
            else:
                await LogAviso("No hay canciones en la cola.").send(
                    interaction, ephemeral=True
                )
                return
        else:
            await LogError("No se ha podido saltar la canción.").send(
                interaction, ephemeral=True
            )
            return

        await self.msg.edit(view=None)
        await LogExitoso("Canción saltada.").send(interaction, ephemeral=True)

    @discord.ui.button(emoji="📥", style=discord.ButtonStyle.gray, custom_id="save")
    async def save(self, interaction: discord.Interaction, button: discord.ui.Button):
        await LogAviso("En implementación").send(interaction, ephemeral=True)

    @discord.ui.button(
        emoji="🔉", style=discord.ButtonStyle.gray, custom_id="volume_down"
    )
    async def volume_down(
        self, interaction: discord.Interaction, button: discord.ui.Button
    ):
        decreseVol = 10

        if self.player.volume - decreseVol < 0:
            await LogError("El volumen no puede ser menor a 0%.").send(
                interaction, ephemeral=True
            )
            return

        self.cont += 1
        self.player.volume -= decreseVol
        self.player.VoiceClient.source.volume = self.player.volume / 100

        if self.cont == 3:
            self.cont = 0
            self.player.guild.setMusicSetting("volume", self.player.volume)
            self.player.guild.update()

        await LogInfo(f"volumen: `{self.player.volume}` 🔉--").send(
            interaction, ephemeral=True, delete_after=7
        )

    @discord.ui.button(emoji="🔁", style=discord.ButtonStyle.gray, custom_id="loop")
    async def loop(self, interaction: discord.Interaction, button: discord.ui.Button):
        self.player.loop = not self.player.loop
        await LogExitoso(
            f"Loop {'activado' if self.player.loop else 'desactivado'}."
        ).send(interaction)

    @discord.ui.button(
        emoji="🔊", style=discord.ButtonStyle.gray, custom_id="volume_up"
    )
    async def volume_up(
        self, interaction: discord.Interaction, button: discord.ui.Button
    ):
        increaseVol = 10

        if self.player.volume + increaseVol > 100:
            await LogAviso(
                title="Volumen máximo", message="El volumen no puede ser mayor a 100%."
            ).send(interaction, ephemeral=True)
            return

        self.cont += 1
        self.player.volume += increaseVol
        self.player.VoiceClient.source.volume = self.player.volume / 100

        if self.cont == 3:
            self.cont = 0
            self.player.guild.setMusicSetting("volume", self.player.volume)
            self.player.guild.update()

        await LogExitoso(
            title="Volumen incrementado",
            message=f"🔉++ volumen: `{self.player.volume}`",
        ).send(interaction, ephemeral=True, delete_after=7)

    @discord.ui.button(
        emoji="📤", style=discord.ButtonStyle.gray, custom_id="load_album"
    )
    async def load_album(
        self, interaction: discord.Interaction, button: discord.ui.Button
    ):
        # Aquí puedes implementar la funcionalidad de carga de álbumes
        await LogInfo(
            title="Función en desarrollo",
            message="La funcionalidad de cargar álbumes está en implementación.",
        ).send(interaction, ephemeral=True, delete_after=7)

    def EmbebededMsg(self):
        return (
            discord.Embed(
                title="Escuchando 🎧",
                description=f"**[{self.video.title}]({self.video.url})**",
                color=Colours.default(),
            )
            .add_field(name="Artista", value=f"`{self.video.uploader}`", inline=True)
            .add_field(
                name="Duración",
                value=f"`{simpleTools.formatTime(self.video.duration)}`",
                inline=True,
            )
            .add_field(name="Volumen", value=f"`{self.player.volume}%`", inline=True)
            .add_field(
                name="Loop",
                value=f"`{'🔁' if self.player.loop else '❌'}`",
                inline=True,
            )
            .add_field(
                name="En cola",
                value=f"`{len(self.player.queue)} canciones`",
                inline=True,
            )
            .add_field(
                name="Duración total",
                value=f"`{simpleTools.formatTime(sum(vid.duration for vid in self.player.queue if vid.duration is not None) + (self.video.duration if self.video.duration is not None else 0))}`",
                inline=True,
            )
            .set_image(url=self.video.thumbnail)
            .set_footer(
                icon_url=self.interaction.user.avatar.url,
                text=f"Por {self.interaction.user.display_name}",
            )
        )
