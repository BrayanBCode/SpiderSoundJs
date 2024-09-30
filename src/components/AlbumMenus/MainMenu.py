from discord import Interaction, SelectOption
from discord.ui import Select

from base.utils.Logging.LogMessages import *
from components.AlbumMenus.ALBManager.managerSelect import managerSelect



class MainMenu(Select):
    def __init__(self, controler) -> None:
        self.controler = controler

        super().__init__(
            placeholder="¿Que quieres hacer? 🤨",
            options=[
                SelectOption(
                    label="¿Como crear, usar, etc un album?",
                    value="help",
                    description="Muestra la ayuda para usar los albums",
                ),
                SelectOption(
                    label="🛠️ Administrar albums",
                    value="admin-album",
                    description="Crea, edita o elimina un album",
                ),
                SelectOption(
                    label="📥 Agregar al album",
                    value="add-to-album",
                    description="Añade la cancion actual a un album creado",
                ),
                SelectOption(
                    label="🗃️ Guardar playlist actual",
                    value="save-queue",
                    description="Guarda toda la cola de reproduccion en un album nuevo",
                ),
            ],
        )

    async def callback(self, interaction: Interaction):
        match self.values[0]:
            case "help":
                await LogInfo("Ayuda para usar los albums").send(interaction)

            case "admin-album":
                await self.controler.ChangeMenu(managerSelect(self.controler), interaction)

            case "add-to-album":
                await self.addToAlbum(interaction)

            case "save-queue":
                await self.saveQueue(interaction)

            case _:
                await interaction.response.send_message("Error desconocido")

    async def saveQueue(self, interaction: Interaction) -> None:
        await LogInfo("Guardando la cola de reproduccion").send(interaction)

    async def addToAlbum(self, interaction: Interaction) -> None:
        await LogInfo("Añadiendo la cancion actual al album").send(interaction)
