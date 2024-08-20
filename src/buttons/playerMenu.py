
import discord
from buttons import button_paginator as pg

from base.classes.SpiderPlayer.player import Player
from base.interfaces.ISong import ISong
from base.utils.colors import Colours


class playerMenu(discord.ui.View):
    def __init__(self, interaction: discord.Interaction, player: Player, video: ISong):
        super().__init__(timeout=None)
        self.interaction = interaction
        self.player: Player = player
        self.video = video
        self.bot = player.bot
        self.msg: discord.Message = None

    async def Send(self):

        if self.player.last_song:
            self.children[1].disabled = False
        else:
            self.children[1].disabled = True

        self.msg = await self.interaction.channel.send(embed=discord.Embed(
            title=f"Escuchando 🎧", 
            description=f"**[{self.video.title}]({self.video.url})**",
            color=Colours.default()
            )
            .add_field(name="Artista", value=f"`{self.video.uploader}`", inline=True)
            .add_field(name="Duración", value=f"`{self.player.setDuration(self.video.duration) if not isinstance(self.video.duration, str) else self.video.duration}`", inline=True)
            .add_field(name="Volumen", value=f"`{self.player.volume}%`", inline=True)
            .add_field(name="Loop", value=f"`{'🔁' if self.player.loop else '❌'}`", inline=True)
            .add_field(name="En cola", value=f"`{len(self.player.queue)} canciones`", inline=True)
            .add_field(name="Duracion estimada", value=f"`{self.player.setDuration(sum(vid.duration for vid in self.player.queue if vid.duration is not None))}`", inline=True)
            .set_image(url=self.video.thumbnail)
            .set_footer(icon_url=self.interaction.user.avatar, text=f"Por {self.interaction.user.display_name}")
            , view=self,
            silent=True
            )
        
        return self.msg

    @discord.ui.button(emoji="🔢", style=discord.ButtonStyle.gray, custom_id="queue")
    async def queue(self, interaction: discord.Interaction, button: discord.ui.Button):
        player: Player = self.bot.players.get_player(interaction.guild_id)

        if player:
            user_voice_state = interaction.user.voice
            bot_voice_channel = interaction.guild.voice_client.channel if interaction.guild.voice_client else None

            if not user_voice_state or user_voice_state.channel != bot_voice_channel:
                await interaction.response.send_message(embed=discord.Embed(title="Debes estar en el mismo canal de voz que el bot.", color=discord.Color.red()), ephemeral=True)
                return 

            if len(player.queue) == 0:
                await interaction.response.send_message(embed=discord.Embed(title="No hay canciones en la cola.", color=discord.Color.red()))
                return
    
            pages = []
            for i in range(0, len(player.queue), 7):
                embed = discord.Embed(title="Lista de reproducción", color=Colours.default())
                embed.set_footer(text=f"Por {interaction.user.display_name}", icon_url=interaction.user.avatar.url)
                embed.timestamp = interaction.created_at

                for index, song in enumerate(player.queue[i:i+7], start=i+1):
                    hours, remainder = divmod(song.duration, 3600)
                    minutes, seconds = divmod(remainder, 60)
                    
                    duration_str = f"{hours:02}:{minutes:02}:{seconds:02}" if hours else f"{minutes:02}:{seconds:02}"
    
                    embed.add_field(name=f"{index}. {song.title}", value=f"Duración: {duration_str}", inline=False)
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
    
        await interaction.response.send_message(embed=discord.Embed(title="No hay canciones en la cola.", color=discord.Color.red()))
        return
    
    @discord.ui.button(emoji="⏪", style=discord.ButtonStyle.primary, custom_id="back")
    async def back(self, interaction: discord.Interaction, button: discord.ui.Button):
        user_voice_state = interaction.user.voice
        bot_voice_channel = interaction.guild.voice_client.channel if interaction.guild.voice_client else None

        await interaction.channel.send(self.player.last_song.title)

        if not user_voice_state or user_voice_state.channel != bot_voice_channel:
            await interaction.response.send_message(embed=discord.Embed(title="Debes estar en el mismo canal de voz que el bot.", color=discord.Color.red()), ephemeral=True)
            return 

        if self.player.voiceChannel.is_playing():
            await self.player.back()
            await interaction.response.send_message(embed=discord.Embed(
                title="Reproduciendo canción anterior.", color=discord.Color.green()
                ).set_footer(text=f"Por {interaction.user.display_name}", icon_url=interaction.user.avatar.url))
            return

        await interaction.response.send_message(embed=discord.Embed(title="No hay canciones en la cola.", color=discord.Color.red()))
        return


    @discord.ui.button(emoji="⏹️", style=discord.ButtonStyle.red)
    async def stop(self, interaction: discord.Interaction, button: discord.ui.Button):
        user_voice_state = interaction.user.voice
        bot_voice_channel = interaction.guild.voice_client.channel if interaction.guild.voice_client else None

        if not user_voice_state or user_voice_state.channel != bot_voice_channel:
            await interaction.response.send_message(embed=discord.Embed(title="Debes estar en el mismo canal de voz que el bot.", color=discord.Color.red()), ephemeral=True)
            return 

        await self.player.stop()
        await interaction.response.send_message(embed=discord.Embed(title="Se ha detenido la reproducción.", color=discord.Color.green()
                                                                    ).set_footer(text=f"Por {interaction.user.display_name}", icon_url=interaction.user.avatar.url))
        return

    @discord.ui.button(emoji="⏯️", style=discord.ButtonStyle.primary)
    async def pause(self, interaction: discord.Interaction, button: discord.ui.Button):
        user_voice_state = interaction.user.voice
        bot_voice_channel = interaction.guild.voice_client.channel if interaction.guild.voice_client else None

        if not user_voice_state or user_voice_state.channel != bot_voice_channel:
            await interaction.response.send_message(embed=discord.Embed(title="Debes estar en el mismo canal de voz que el bot.", color=discord.Color.red()
                                                                        ).set_footer(text=f"Por {interaction.user.display_name}", icon_url=interaction.user.avatar.url))
            return 
        
        if self.player.voiceChannel.is_paused():
            await self.player.resume()
            await interaction.response.send_message(embeds=[discord.Embed(title="Reanudado ▶️", color=discord.Color.green())
            .set_footer(text=f"Por {interaction.user.display_name}", icon_url=interaction.user.avatar.url)])
        else:
            await self.player.pause()
            await interaction.response.send_message(embeds=[discord.Embed(title="Pausado ⏸️", color=discord.Color.green())
            .set_footer(text=f"{interaction.user.display_name}", icon_url=interaction.user.avatar.url)])

    @discord.ui.button(emoji="⏩", style=discord.ButtonStyle.primary)
    async def skip(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.defer()
        
        user_voice_state = interaction.user.voice
        bot_voice_channel = interaction.guild.voice_client.channel if interaction.guild.voice_client else None

        if not user_voice_state or user_voice_state.channel != bot_voice_channel:
            await interaction.followup.send(embed=discord.Embed(
                title="Debes estar en el mismo canal de voz que el bot.", color=discord.Color.red()
                ).set_footer(text=f"Por {interaction.user.display_name}", icon_url=interaction.user.avatar.url))
            return 
        
        player: Player = self.bot.players.get_player(interaction.guild_id)

        if player:
            if len(player.queue) != 0:
                await player.stop()
                await player.play(interaction)
            else:
                await interaction.followup.send(embed=discord.Embed(title="No hay canciones en la cola.", color=discord.Color.red()), ephemeral=True)
                return
        else:
            await interaction.followup.send(embed=discord.Embed(title="No se ha podido saltar la canción.", color=discord.Color.red()), ephemeral=True)
            return

        await self.msg.edit(view=None)
        await self.interaction.followup.send(embed=discord.Embed(title="Canción saltada.", color=discord.Color.green()), ephemeral=True)

    @discord.ui.button(emoji="📥", style=discord.ButtonStyle.gray, custom_id="save")
    async def save(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_message(embed=discord.Embed(title="En implementacion", color=discord.Color.red()), ephemeral=True, delete_after=7)
        pass

    @discord.ui.button(emoji="🔉", style=discord.ButtonStyle.gray, custom_id="volume_down")
    async def volume_down(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_message(embed=discord.Embed(title="En implementacion", color=discord.Color.red()), ephemeral=True, delete_after=7)
        pass

    @discord.ui.button(emoji="🔁", style=discord.ButtonStyle.gray, custom_id="loop")
    async def loop(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_message(embed=discord.Embed(title="En implementacion", color=discord.Color.red()), ephemeral=True, delete_after=7)
        pass

    @discord.ui.button(emoji="🔊", style=discord.ButtonStyle.gray, custom_id="volume_up")
    async def volume_up(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_message(embed=discord.Embed(title="En implementacion", color=discord.Color.red()), ephemeral=True, delete_after=7)
        pass

    @discord.ui.button(emoji="📤", style=discord.ButtonStyle.gray, custom_id="load_album")
    async def load_album(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_message(embed=discord.Embed(title="En implementacion", color=discord.Color.red()), ephemeral=True, delete_after=7)
        pass




