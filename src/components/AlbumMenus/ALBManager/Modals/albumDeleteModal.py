from discord import Interaction
from discord.ui import Modal, TextInput

from base.db.models.entries.UserEntrie import UserEntrie
from base.utils.Logging.LogMessages import LogError, LogExitoso


class albumDeleteModal(Modal):
    def __init__(self, DBUser: UserEntrie, albumName: str) -> None:
        super().__init__(
            title="Confirma la eliminacion del album",
            timeout=30
        )

        self.DBUser = DBUser
        self.albumName = albumName

        self.confirm = TextInput(
            placeholder=f"Escribe '{self.albumName.upper()}' para confirmar",
            min_length=len(self.albumName),
            max_length=len(self.albumName),
            label="Confirmar",            
        )


    async def on_submit(self, interaction: Interaction) -> None:
        if self.confirm.value.upper() != self.albumName.upper():
            return await LogError(
                "El nombre no coincide, intenta de nuevo"
            ).send(ephemeral=True, delete_after=5)
        
        self.DBUser.removeAlbum(self.albumName)

        await LogExitoso(
            title="Album eliminado",
            message=f"El album '{self.albumName}' ha sido eliminado"
        ).send(ephemeral=True, delete_after=5)

