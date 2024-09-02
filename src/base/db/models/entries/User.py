from base.db.models.EntrieModel import EntrieModel
import jsonschema
from jsonschema import validate

class User(EntrieModel):
    schema = {
        "type": "object",
        "properties": {
            "_id": {"type": "integer"},
            "fav": {
                "type": "object",
                "properties": {
                    "albums": {
                        "type": "object",
                        "properties": {
                            "example": {
                                "type": "object",
                                "properties": {
                                    "name": {"type": "string"},
                                    "songs": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "title": {"type": "string"},
                                                "url": {"type": "string", "format": "uri"},
                                                "duration": {"type": "integer"},
                                                "uploader": {"type": "string"}
                                            },
                                            "required": ["title", "url", "duration", "uploader"]
                                        }
                                    }
                                },
                                "required": ["name", "songs"]
                            }
                        },
                        "required": ["example"]
                    }
                },
                "required": ["albums"]
            }
        },
        "required": ["_id", "fav"]
    }

    def __init__(self, mongoConnection, collectionName="users", userData=None):
        super().__init__(mongoConnection, collectionName)
        self._id = None
        self.fav = {"albums": {}}
        if userData:
            self.load_user_data(userData)
    def load_by_id(self):
        """
        Carga los datos del usuario desde la base de datos utilizando la ID del usuario.
        
        :raises ValueError: Si no se encuentra ningún usuario con la ID proporcionada
        """
        user_data = self.findOne({"_id": self._id})
        if user_data is None:
            raise ValueError(f"No se encontró ningún usuario con la ID: {self._id}")
        self.load_user_data(user_data)
        
    def load_user_data(self, userData):
        """
        Carga y valida los datos del usuario desde un diccionario.
        
        :param userData: Diccionario que contiene los datos del usuario
        """
        self.validate_user_data(userData)
        self._id = userData.get("_id")
        self.fav = userData.get("fav", self.fav)

    def validate_user_data(self, data):
        """
        Valida que los datos del usuario cumplan con el esquema definido.
        
        :param data: Datos del usuario en formato de diccionario
        :raises jsonschema.exceptions.ValidationError: Si los datos no cumplen con el esquema
        """
        try:
            validate(instance=data, schema=self.schema)
        except jsonschema.exceptions.ValidationError as err:
            raise ValueError(f"Invalid user data: {err.message}")

    def loadUserData(self, userData):
        self._id = userData.get("_id")
        self.favAlbums = userData.get("fav", {}).get("albums", {})
    
    def getAlbum(self, albumName):
        return self.favAlbums.get(albumName)

    def addAlbum(self, albumName, albumData):
        self.favAlbums[albumName] = albumData

    def removeAlbum(self, albumName):
        if albumName in self.favAlbums:
            del self.favAlbums[albumName]

    def toDict(self):
        return {
            "_id": self._id,
            "fav": {
                "albums": self.favAlbums
            }
        }

    def insert(self, collectionName=None):
        """
        Inserta los datos del usuario en la colección especificada o en la colección por defecto.
        
        :param collectionName: Nombre de la colección donde se insertará el documento (opcional)
        :return: ID del documento insertado
        """
        return super().insert(self.toDict(), collectionName)

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

    def delete(self, query=None, collectionName=None):
        """
        Elimina el documento del usuario en la colección especificada o en la colección por defecto.
        
        :param query: Consulta para seleccionar el documento a eliminar (opcional, por defecto usa el _id del usuario)
        :param collectionName: Nombre de la colección donde se eliminará el documento (opcional)
        :return: Resultado de la operación de eliminación
        """
        if query is None:
            query = {"_id": self._id}
        return super().delete(query, collectionName)
