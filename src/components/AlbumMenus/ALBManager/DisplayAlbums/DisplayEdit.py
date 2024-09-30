from base.utils.Logging.LogMessages import LogExitoso
from components.AlbumMenus.ALBManager.DisplayAlbums.DisplayEditOptions.DisplayEditOptions import DisplayEditAlbumOptions
from components.AlbumMenus.ALBManager.DisplayAlbums.DisplayMenus import DisplayMenus


class DisplayEdit(DisplayMenus):
    def __init__(self, controler, interaction):
        super().__init__(controler, interaction, "editar")

    async def callback(self, interaction):
        if self.values[0] in ["back", "back_"]:
            await self.controler.ReturnToPreviousMenu(interaction)
            return
        
        selctedAlbum = self.DBUser.fav["albums"][self.values[0]]
        print(selctedAlbum["name"])

        await self.controler.ChangeMenu(
            DisplayEditAlbumOptions(
            self.controler,
            self.DBUser,
            selctedAlbum
        ), 
        interaction
        )

        

        # Llamar a el menu correspondiente 
