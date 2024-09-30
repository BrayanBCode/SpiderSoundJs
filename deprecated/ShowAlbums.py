# import discord
from discord import Interaction, SelectOption
from discord.ui import Select

# from base.classes.Bot import CustomBot
# from base.db.models.entries.UserEntrie import UserEntrie
# from base.db.templates.DefaultDatas import DefaultData
from base.utils.Logging.LogMessages import *
from components.AlbumMenus.ALBManager.Modals.albumDeleteModal import albumDeleteModal


class ShowAlbumToEdit(Select):
    def __init__(self, controler, interaction: Interaction) -> None:
        self.controler = controler
        self.PrevieuosInteraction = interaction

        self.DBUser = controler.bot.UserTable.getUser(self.PrevieuosInteraction.user.id)

        super().__init__(
            placeholder="Elige un album 👷",
            options=self.createOptions(),
        )

    def createOptions(self):

        albums = self.DBUser.fav.get("albums", {})

        if isinstance(albums, dict) and albums:
            options = [
                SelectOption(
                    label=album["name"],
                    value=album["name"],
                    description=f"{len(album['songs'])} canciones 🎶",
                )
                for album in self.DBUser.fav["albums"].values()
                if album != {}
            ]


        else:
            options = [
                SelectOption(
                    label="No hay albums",
                    value="back_",
                    description="No hay albums para editar 🤷‍♂️",
                )
            ]

        options.append(
            SelectOption(
                label="Volver",
                value="back",
                description="Vuelve al menu anterior 🏃",
            )
        )

        return options

    async def callback(self, interaction):
        pass


class ShowAlbumToDelete(Select):
    def __init__(self, controler, interaction: Interaction) -> None:
        self.controler = controler
        self.PrevieuosInteraction = interaction

        self.DBUser = controler.bot.UserTable.getUser(self.PrevieuosInteraction.user.id)

        super().__init__(
            placeholder="Elige un album 👷",
            options=self.createOptions(),
        )

    def createOptions(self):
        albums = self.DBUser.fav.get("albums", {})

        if isinstance(albums, dict) and albums:
            options = [
                SelectOption(
                    label=album["name"],
                    value=album["name"],
                    description=f"{len(album['songs'])} canciones 🎶",
                )
                for album in self.DBUser.fav["albums"].values()
                if album != {}
            ]


        else:
            options = [
                SelectOption(
                    label="No hay albums",
                    value="back_",
                    description="No hay albums para eliminar 🤷‍♂️",
                )
            ]

        options.append(
            SelectOption(
                label="Volver",
                value="back",
                description="Vuelve al menu anterior 🏃",
            )
        )

        return options

    async def callback(self, interaction):
        pass