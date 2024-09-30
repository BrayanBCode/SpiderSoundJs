import jsonschema
from jsonschema import validate

from base.db.models.EntrieModel import EntrieModel
from base.utils.Logging.LogMessages import LogDebug

schema = {
    "type": "object",
    "properties": {
        "_id": {"type": "integer"},
        "fav": {
            "type": "object",
            "properties": {
                "albums": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string"},
                                "songs": {
                                    "type": "object",
                                    "properties": {
                                        "title": {"type": "string"},
                                        "url": {"type": "string", "format": "uri"},
                                        "duration": {"type": "integer"},
                                        "uploader": {"type": "string"},
                                    },
                                    "required": [
                                        "title",
                                        "url",
                                        "duration",
                                        "uploader",
                                    ],
                                },
                            },
                            "required": ["songs", "name"],
                        },
                    },
                }
            },
            "required": ["albums"],
        },
    },
    "required": ["_id", "fav"],
}


class UserEntrie(EntrieModel):

    def __init__(self, mongoConnection, userData=None, collectionName="users"):
        super().__init__(mongoConnection, collectionName)
        self._id = None
        self.fav = {"fav": {"albums": {}}}
        self.schema = schema

        if userData:
            self.loadUserData(userData)

    def loadUserData(self, userData):
        """
        Carga y valida los datos del usuario desde un diccionario.

        :param userData: Diccionario que contiene los datos del usuario
        """
        self._id = userData.get("_id")
        self.fav = userData.get("fav", self.fav)

    def getAlbum(self, albumName):
        return self.fav.get("albums", {}).get(albumName, {})

    def getAlbums(self):
        return self.fav.get("albums", {})

    def createAlbum(self, albumName, albumData):
        self.fav["albums"][albumName] = albumData

    def addSongToAlbum(self, albumName, songData):
        if albumName in self.fav["albums"]:
            self.fav["albums"][albumName]["songs"].append(songData)

    def removeAlbum(self, albumName):
        if albumName in self.fav:
            del self.fav[albumName]

    def removeSong(self, albumName, songIndex):
        if albumName in self.fav["fav"]:
            if songIndex < len(self.fav["fav"][albumName]["songs"]):
                del self.fav["fav"][albumName]["songs"][songIndex]

    def toDict(self):

        return {"_id": self._id, "fav": {"albums": self.fav["albums"]}}

    def update(self, query=None, collectionName=None):
        """
        Actualiza los datos del usuario en la colección especificada o en la colección por defecto.

        :param query: Consulta para seleccionar el documento a actualizar (opcional, por defecto usa el _id del usuario)
        :param collectionName: Nombre de la colección donde se actualizará el documento (opcional)
        :return: Resultado de la operación de actualización
        """
        if query is None:
            query = {"_id": self._id}
        return super().update(query, self.toDict(), collectionName)
