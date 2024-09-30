from discord import Interaction, SelectOption
from discord.ui import Select


class DisplayMenus(Select):
    def __init__(self, controler, interaction: Interaction, TypeName: str) -> None:
        self.controler = controler
        self.PrevieuosInteraction = interaction

        self.DBUser = controler.bot.UserTable.getUser(self.PrevieuosInteraction.user.id)


        albums = self.DBUser.fav.get("albums", {})

        if albums:
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
                    description=f"No hay albums para {TypeName} 🤷‍♂️",
                )
            ]

        options.append(
            SelectOption(
                label="Volver",
                value="back",
                description="Vuelve al menu anterior 🏃",
            )
        )

        super().__init__(
            placeholder="Elige un album 👷",
            options=options,
        )

    async def callback(self, interaction):
        pass
