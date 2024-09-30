from discord.ui import Select
from discord import Interaction, SelectOption

from base.utils.Logging.LogMessages import LogError
from components.AlbumMenus.ALBManager.DisplayAlbums.DisplayEditOptions.DisplayAlbumSongs import DisplayAlbumSongs
from components.AlbumMenus.ALBManager.Modals.ModalChangeAlbumName import ModalChangeAlbumName


class DisplayEditAlbumOptions(Select):
    def __init__(self, controler, DBUser, SelectedAlbum: dict) -> None:

        self.controler = controler
        self.DBUser = DBUser
        self.SelectedAlbum = SelectedAlbum


        super().__init__(
            placeholder=f'Editando "{SelectedAlbum["name"]}" 👷',
            options=[
                SelectOption(
                    label="Cambiar nombre",
                    value="change_name",
                    description="Cambia el nombre del album"
                ),
                SelectOption(
                    label="Editar canciones",
                    value="edit_songs",
                    description="elimina o añade canciones al album"
                ),
                SelectOption(
                    label="Volver",
                    value="back",
                    description="Vuelve al menu anterior 🏃"
                )                   
            ],
        )

    async def callback(self, interaction: Interaction):
        match self.values[0]:
            case "change_name":
                await self.controler.sendModal(
                    ModalChangeAlbumName(self.DBUser, self.SelectedAlbum),
                    interaction
                )

            case "edit_songs":
                await self.controler.ChangeMenu(
                    DisplayAlbumSongs(
                        self.controler,
                        self.DBUser,
                        self.SelectedAlbum
                    ),
                    interaction
                )

            case "back":
                await self.controler.ReturnToPreviousMenu(interaction)

            case _:
                await LogError("Option not found", f"Option {self.values[0]} not found in DisplayEditAlbumOptions")