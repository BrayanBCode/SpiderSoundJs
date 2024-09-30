from discord.ui import Select
from discord import Interaction, SelectOption


class DisplayAlbumSongs(Select):
    def __init__(self, controler, DBUser, SelectedAlbum: dict) -> None:

        self.controler = controler
        self.DBUser = DBUser
        self.SelectedAlbum = SelectedAlbum


        options = [
            SelectOption(
                label=album["name"],
                value=album["name"],
                description=f"De {album['uploader']}",
            ) for album in self.SelectedAlbum["songs"]
        ] + [
            SelectOption(
                label="Volver",
                value="back",
                description="Vuelve al menu anterior 🏃"
            )
        ]

        super().__init__(
            placeholder=f'Editando canciones de "{SelectedAlbum["name"]}" 👷',
            options=options,
        )


    async def callback(self, interaction: Interaction):
        if self.values[0] == "back":
            await self.controler.ReturnToPreviousMenu(interaction)
            return
        
        await self.controler.ChangeMenu(
            
        )
