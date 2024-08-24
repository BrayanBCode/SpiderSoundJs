from pymongo.database import Database
from base.db.DBManager import DBManager

from base.db.interfaces.guildConfig.music_setting import IMusicSetting

class GuildInstance:
    def __init__(self, conn: Database, data: dict) -> None:
        """
        Crea una instancia la cual refleja una entrada de Guild en la base de datos.
        """
        if any(key not in self.defaultGuildData().keys() for key in data.keys()):
            raise ValueError("Invalid data keys.")

        # Datos de la base de datos
        self._id = data["_id"]
        self.music_setting = IMusicSetting(data["music-setting"]["sourcevolumen"], data["music-setting"]["volume"])

        
        self.conn = conn # Conexión a la base de datos
        self.table = self.conn.get_collection("guilds") # Colección a la cual pertenese la instancia


    def updateOne(self, query: dict) -> None:
        self.table.update_one({"_id": self._id}, {"$set": query})

    def drop(self) -> None:
        self.table.delete_one({"_id": self._id})

    def refresh(self) -> None:
        data = self.table.find_one({"_id": self._id})
        self.music_setting = IMusicSetting(data["music-setting"]["sourcevolumen"], data["music-setting"]["volume"])

    @staticmethod
    def defaultGuildData():
        return {
            "_id": 1111,
            "music-setting": {
                "sourcevolumen": 100,
                "volume": 25,
            }
        }