import discord

from base.classes.Bot import CustomBot


class ManageAlbums(discord.ui.Select):
    def __init__(self, bot, mainMenu):
        self.bot: CustomBot = bot
        self.mainMenu = mainMenu

        options = [
            discord.SelectOption(label="Crear album", value="create"),
            discord.SelectOption(label="Remover album", value="remove"),
            discord.SelectOption(label="editar album", value="edit"),
            discord.SelectOption(label="volver", value="back"),
        ]

        super().__init__(placeholder="Administrando albums..", options=options)

    async def callback(self, interaction: discord.Interaction):
        if self.values[0] == "create":
            self.view.remove_item(self)
            
            modal = testModal()

            await interaction.response.send_modal(modal)
            print(modal.album_name)
            print("Modal enviado")
            return

        if self.values[0] == "remove":
            self.view.remove_item(self)
            await interaction.response.edit_message(view=self.view)
            return

        if self.values[0] == "edit":
            self.view.remove_item(self)
            await interaction.response.edit_message(view=self.view)
            return

        if self.values[0] == "back":
            self.view.remove_item(self)
            self.view.add_item(self.mainMenu)
            await interaction.response.edit_message(view=self.view)
            return

        await interaction.response.send_message("Opcion no valida", ephemeral=True)

class testModal(discord.ui.Modal):
    def __init__(self):
        super().__init__(title="Crear album", timeout=60)

    album_name = discord.ui.TextInput(label="album", placeholder="Nombre del album", min_length=3, max_length=30, required=True)

    async def on_submit(self, interaction: discord.Interaction):
        await interaction.response.send_message(embed=discord.Embed(title="Album creado", description=f"Album ``{self.album_name.value}`` creado con exito", color=discord.Color.green()), ephemeral=True, delete_after=5)
        


