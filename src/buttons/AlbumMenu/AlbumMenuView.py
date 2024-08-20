import discord

from buttons.AlbumMenu.ManageAlbums import ManageAlbums


class AlbumMenu(discord.ui.View):
    def __init__(self, bot):
        super().__init__()
        self.bot = bot
        
    @discord.ui.select(placeholder="¿Que quieres hacer? 🤨", options=[
        discord.SelectOption(label="¿Como crear, usar, etc un album?", value="help", description="Muestra la ayuda para usar los albums"),
        discord.SelectOption(label="🛠️ Administrar albums", value="admin-album", description="Crea, edita o elimina un album"),
        discord.SelectOption(label="📥 Agregar al album", value="add-to-album", description="Añade la cancion actual a un album creado"),
        discord.SelectOption(label="🗃️ Guardar playlist actual", value="save-queue", description="Guarda toda la cola de reproduccion en un album nuevo"),
        ]
    )
    async def Menu(self, interaction: discord.Interaction, select: discord.ui.Select):        
        if select.values[0] == "help":
            mainMenu = self.children[0]

            self.remove_item(self.children[0])
            await interaction.response.edit_message(view=self)

            return

        if select.values[0] == "admin-album":
            mainMenu = self.children[0]
            self.add_item(ManageAlbums(bot=self.bot, mainMenu=mainMenu))
            self.remove_item(self.children[0])
            await interaction.response.edit_message(view=self)

            return

        if select.values[0] == "add-to-album":
            mainMenu = self.children[0]

            self.remove_item(self.children[0])
            await interaction.response.edit_message(view=self)

            return

        if select.values[0] == "save-queue":
            mainMenu = self.children[0]

            self.remove_item(self.children[0])
            await interaction.response.edit_message(view=self)

            return
        
        await interaction.response.send_message("Opcion no valida", ephemeral=True)

