import discord
from discord import Interaction

from base.db.models.entries.UserEntrie import UserEntrie
from base.db.templates.DefaultDatas import DefaultData
from base.utils.Logging.LogMessages import *


class ModalGetAlbumName(discord.ui.Modal, title="Crear album"):
    def __init__(self, bot, interaction: Interaction):
        super().__init__()

        self.user = interaction.user
        self.bot = bot

        self.name = discord.ui.TextInput(
            label="Nombre del album",
            placeholder="Escribe el nombre del album",
            min_length=3,
            max_length=30,
        )

        self.add_item(self.name)

    async def on_submit(self, interaction: discord.Interaction) -> None:
        await interaction.response.defer(ephemeral=True)
        try:

            if self.name.value == "back":
                return await LogAviso(
                    title="Error al crear album",
                    message="No se puede crear un album con el nombre `back`",
                )

            DBUser = self.bot.UserTable.getUser(self.user.id)

            if DBUser._id is None:
                DBUser = UserEntrie(
                    self.bot.DBConnect,
                    DefaultData.DefaultUser(self.user.id),
                )

                self.bot.UserTable.insert(DBUser)

            LogDebug(DBUser.fav).print()
            if self.name.value in DBUser.fav["albums"]:
                return await LogError(
                    title=f"{self.name.value} ya existe",
                    message="Este album ya existe, prueba con otro nombre",
                ).send(interaction=interaction, ephemeral=True, delete_after=5)

            DBUser.createAlbum(
                self.name.value,
                {
                    "name": self.name.value,
                    "songs": [
                        {
                            "title": "Adele - Skyfall (Official Lyric Video)",
                            "url": "https://www.youtube.com/watch?v=DeumyOzKqgI",
                            "duration": 260,
                            "uploader": "Adele",
                        }
                    ],
                },
            )

            LogDebug(DBUser.toDict()).print()
            DBUser.update()

            await LogExitoso(
                title=f"album `{self.name.value}` creado",
                message="Se ha creado el album correctamente",
            ).send(interaction, ephemeral=True, delete_after=5)

        except Exception as e:
            await LogError(
                title="Error al crear album",
                message=f"Ha ocurrido un error al crear el album: {e}",
            ).send(interaction)

            LogError(
                title="Error al crear album",
                message=f"Ha ocurrido un error al crear el album: {e}",
            ).log(e)