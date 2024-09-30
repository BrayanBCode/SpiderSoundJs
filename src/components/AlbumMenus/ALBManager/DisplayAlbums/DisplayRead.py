from base.utils.Logging.LogMessages import LogExitoso
from components.AlbumMenus.ALBManager.DisplayAlbums.DisplayMenus import DisplayMenus


class DisplayRead(DisplayMenus):
    def __init__(self, controler, interaction):
        super().__init__(controler, interaction, "leer")

    async def callback(self, interaction):
        if self.values[0] in ["back", "back_"]:
            await self.controler.ReturnToPreviousMenu(interaction)
            return
        
        await LogExitoso(
            title="ShowAlbumToRead",
            message=f"El usuario {interaction.user.display_name} eligio el album `{self.values[0]}`",

        ).send(interaction, ephemeral=True)
        
        # await self.controler.sendModal(
        #     albumReadModal(self.DBUser, self.values[0]), 
        #     interaction
        # )