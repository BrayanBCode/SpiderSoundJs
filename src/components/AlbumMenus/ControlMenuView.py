from discord.interactions import Interaction
from discord.ui import Modal, Select, View


from base.classes.Bot import CustomBot
from base.utils.Logging.LogMessages import LogError
from components.AlbumMenus.MainMenu import MainMenu



class ControlMenu(View):
    PreviousMenu: list[Select]

    def __init__(self, bot: CustomBot):
        super().__init__()
        self.bot = bot
        self.mainMenu = MainMenu(self)
        self.PreviousMenu = []

        self.add_item(self.mainMenu)

    async def ChangeMenu(self, menu: Select, interaction: Interaction):
        """Cambia al menú proporcionado y guarda el menú actual en PreviousMenu."""
        try:
            if not menu:
                return await LogError("No se proporcionó un menú para cambiar.").send(
                    interaction, ephemeral=True, print_log=True
                )
            if self.children:
                self.PreviousMenu.append(self.children[0])
                self.remove_item(self.children[0])
            self.add_item(menu)
            await interaction.response.edit_message(view=self)
        except Exception as e:
            LogError(f"Error al cambiar el menú: {e}").log(e)
            await LogError("Ocurrió un error al cambiar el menú.").send(
                interaction, ephemeral=True
            )

    async def ReturnToPreviousMenu(self, interaction: Interaction):
        """Vuelve al menú anterior almacenado en PreviousMenu."""
        try:
            if self.PreviousMenu and self.children:
                self.remove_item(self.children[0])
                self.add_item(self.PreviousMenu.pop(-1))
                await interaction.response.edit_message(view=self)
            else:
                await interaction.response.send_message(
                    "No hay menús anteriores para volver.", ephemeral=True
                )
        except Exception as e:
            LogError(f"Error al volver al menú anterior: {e}").log(e)
            await LogError("Ocurrió un error al volver al menú anterior.").send(
                interaction, ephemeral=True
            )

    async def ReturnToMainMenu(self, interaction: Interaction):
        """Vuelve al menú principal."""
        try:
            self.PreviousMenu.clear()
            if self.children:
                self.remove_item(self.children[0])
            self.add_item(self.mainMenu)
            await interaction.response.edit_message(view=self)
        except Exception as e:
            LogError(f"Error al volver al menú principal: {e}").log(e)
            await LogError("Ocurrió un error al volver al menú principal.").send(
                interaction, ephemeral=True
            )

    async def Start(self, MainMenu: Select, interaction: Interaction):
        """Inicia el menú de control enviando un mensaje con la vista ControlMenu."""
        try:
            
            await interaction.response.send_message(
                view=self
            )
        except Exception as e:
            LogError(f"Error al iniciar el menú de control: {e}").log(e)
            await LogError("Ocurrió un error al iniciar el menú de control.").send(
                interaction, ephemeral=True
            )

    async def sendModal(self, modal: Modal, interaction: Interaction):
        """Envía un modal en respuesta a una interacción."""
        try:
            await interaction.response.send_modal(modal)
            await interaction.edit_original_response(view=self)
        except Exception as e:
            LogError(f"Error al enviar el modal: {e}").log(e)
            await LogError("Ocurrió un error al enviar el modal.").send(
                interaction, ephemeral=True
            )

    async def ChangeMenu(self, menu: Select, interaction: Interaction):
        """Cambia al menú proporcionado y guarda el menú actual en PreviousMenu."""
        try:
            if self.children:
                self.PreviousMenu.append(self.children[0])
                self.remove_item(self.children[0])
            self.add_item(menu)
            await interaction.response.edit_message(view=self)
        except Exception as e:
            LogError(f"Error al cambiar el menú: {e}").log(e)
            await LogError("Ocurrió un error al cambiar el menú.").send(
                interaction, ephemeral=True
            )

    # async def ReturnToPreviousMenu(self, interaction: Interaction):
    #     """Vuelve al menú anterior almacenado en PreviousMenu."""
    #     try:
    #         if self.PreviousMenu and self.children:
    #             self.remove_item(self.children[0])
    #             self.add_item(self.PreviousMenu.pop(-1))
    #             await interaction.response.edit_message(view=self)
    #         else:
    #             await interaction.response.send_message(
    #                 "No hay menús anteriores para volver.", ephemeral=True
    #             )
    #     except Exception as e:
    #         LogError(f"Error al volver al menú anterior: {e}").log(e)
    #         await LogError("Ocurrió un error al volver al menú anterior.").send(
    #             interaction, ephemeral=True
    #         )

    # async def ReturnToMainMenu(self, interaction: Interaction):
    #     """Vuelve al menú principal."""
    #     try:
    #         if self.children:
    #             self.remove_item(self.children[0])
    #         self.add_item(self.mainMenu)
    #         await interaction.response.edit_message(view=self)
    #     except Exception as e:
    #         LogError(f"Error al volver al menú principal: {e}").log(e)
    #         await LogError("Ocurrió un error al volver al menú principal.").send(
    #             interaction, ephemeral=True
    #         )
