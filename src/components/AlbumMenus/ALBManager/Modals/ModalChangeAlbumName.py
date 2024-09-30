import discord
from discord.ui import Modal, TextInput

from base.db.models.entries.UserEntrie import UserEntrie


class ModalChangeAlbumName(Modal, title="Cambiar nombre del album"):
    def __init__(self, DBUser: UserEntrie, SelectedAlbum: dict):
        super().__init__()

        self.DBUser = DBUser
        self.SelectedAlbum = SelectedAlbum

        self.getName = TextInput(
            label="Nuevo nombre",
            placeholder="Escribe el nuevo nombre del album",
            min_length=3,
            max_length=30
        )

        self.add_item(self.getName)

    def on_submit(self, interaction: discord.Interaction):
        self.DBUser.fav["albums"][self.SelectedAlbum["name"]] = self.getName.value