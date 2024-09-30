from base.db.models.EntrieModel import EntrieModel

schema = {
    "type": "object",
    "properties": {
        "_id": {"type": "integer"},
        "music-setting": {
            "type": "object",
            "properties": {
                "sourcevolumen": {"type": "integer"},
                "volume": {"type": "integer"},
            },
            "required": ["sourcevolumen", "volume"],
        },
    },
    "required": ["_id", "music-setting"],
}


class GuildEntrie(EntrieModel):

    def __init__(self, mongoConnection, guildData=None, collectionName="guilds"):
        super().__init__(mongoConnection, collectionName)

        self.musicSetting = {"sourcevolumen": 100, "volume": 50}
        self.schema = schema
        if guildData:
            self.loadGuildData(guildData)

    def loadGuildData(self, guildData: dict):
        """
        Carga y valida los datos de la guild desde un diccionario.

        :param guildData: Diccionario que contiene los datos de la guild
        """
        self._id = guildData.get("_id", None)
        self.musicSetting = guildData.get("music-setting", None)

    def setMusicSetting(self, setting, value):
        """
        Establece un valor específico en la configuración de música.

        :param setting: Clave de la configuración (e.g., "volume")
        :param value: Valor que se va a establecer
        """
        if setting in self.musicSetting:
            self.musicSetting[setting] = value

    def update(self, query=None, collectionName=None):

        if query is None:
            query = {"_id": self._id}
        return super().update(query, self.toDict(), self.collectionName)

    def toDict(self):
        """
        Convierte los datos de user a un diccionario para su almacenamiento en la base de datos.

        :return: Diccionario con los datos de la guild
        """
        return {"_id": self._id, "music-setting": self.musicSetting}

    def __str__(self) -> str:
        return f"Guild(_id={self._id}, musicSetting={self.musicSetting})"
