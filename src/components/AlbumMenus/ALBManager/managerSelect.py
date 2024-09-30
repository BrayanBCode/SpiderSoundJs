from discord import SelectOption
from discord.ui import Select

from base.utils.Logging.LogMessages import *
from components.AlbumMenus.ALBManager.DisplayAlbums.DisplayDelete import DisplayDelete
from components.AlbumMenus.ALBManager.DisplayAlbums.DisplayEdit import DisplayEdit
from components.AlbumMenus.ALBManager.Modals.ModalGetAlbumName import ModalGetAlbumName


class managerSelect(Select):
    def __init__(self, controler) -> None:
        from components.AlbumMenus.ControlMenuView import ControlMenu

        self.controler: ControlMenu = controler

        super().__init__(
            placeholder="Elige una opcion 👷",
            options=[
                SelectOption(
                    label="Crear album",
                    value="create",
                    description="Crea un nuevo album 🎵",
                ),
                SelectOption(
                    label="Editar album",
                    value="edit",
                    description="Edita un album existente ✏️",
                ),
                SelectOption(
                    label="Eliminar album",
                    value="delete",
                    description="Elimina un album existente ❌",
                ),
                SelectOption(
                    label="Volver",
                    value="back",
                    description="Vuelve al menu anterior 🏃",
                ),
            ],
        )

    async def callback(self, interaction):
        match self.values[0]:
            case "create":
                await self.controler.sendModal(
                    ModalGetAlbumName(self.controler.bot, interaction), 
                    interaction
                )

            case "edit":
                await self.controler.ChangeMenu(
                    DisplayEdit(self.controler, interaction), 
                    interaction
                    )

            case "delete":
                await self.controler.ChangeMenu(
                    DisplayDelete(self.controler, interaction),
                    interaction
                )
                

            case "back":
                await self.controler.ReturnToPreviousMenu(interaction)

            case _:
                await interaction.response.send_message("Error desconocido")