from discord import SelectOption
from discord.ui import Select

from base.utils.Logging.LogMessages import *


class albumEdit(Select):
    def __init__(self, controler, DBUSer, albumSelected):
        self.controler = controler
        self.DBUser = DBUSer
        self.albumSelected = albumSelected

        super().__init__(
            placeholder="Elige una opcion 👷",
            options=[
                SelectOption(
                    label="Editar nombre",
                    value="editName",
                    description="Edita el nombre del album",
                ),
                SelectOption(
                    label="Editar canciones",
                    value="editSongs",
                    description="Edita las canciones del album",
                ),
                SelectOption(
                    label="Eliminar album",
                    value="delete",
                    description="Elimina el album",
                ),
                SelectOption(
                    label="Volver",
                    value="back",
                    description="Vuelve al menu anterior 🏃",
                )
            ],
        )