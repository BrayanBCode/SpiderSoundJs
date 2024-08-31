from base.db.models.CollectionModel import CollectionModel
import jsonschema
from jsonschema import validate

class Guild(CollectionModel):
    schema = {
        "type": "object",
        "properties": {
            "_id": {"type": "integer"},
            "music-setting": {
                "type": "object",
                "properties": {
                    "sourcevolumen": {"type": "integer"},
                    "volume": {"type": "integer"}
                },
                "required": ["sourcevolumen", "volume"]
            }
        },
        "required": ["_id", "music-setting"]
    }

    def __init__(self, mongoConnection, collectionName="guilds", guildData=None):
        super().__init__(mongoConnection, collectionName)
        self._id = None
        self.musicSetting = {"sourcevolumen": 100, "volume": 50}
        if guildData:
            self.load_guild_data(guildData)

    def load_guild_data(self, guildData):
        """
        Carga y valida los datos de la guild desde un diccionario.
        
        :param guildData: Diccionario que contiene los datos de la guild
        """
        self.validate_guild_data(guildData)
        self._id = guildData.get("_id")
        self.musicSetting = guildData.get("music-setting", self.musicSetting)

    def validate_guild_data(self, data):
        """
        Valida que los datos de la guild cumplan con el esquema definido.
        
        :param data: Datos de la guild en formato de diccionario
        :raises jsonschema.exceptions.ValidationError: Si los datos no cumplen con el esquema
        """
        try:
            validate(instance=data, schema=self.schema)
        except jsonschema.exceptions.ValidationError as err:
            raise ValueError(f"Invalid guild data: {err.message}")

    def setMusicSetting(self, setting, value):
        """
        Establece un valor específico en la configuración de música.
        
        :param setting: Clave de la configuración (e.g., "volume")
        :param value: Valor que se va a establecer
        """
        if setting in self.musicSetting:
            self.musicSetting[setting] = value

    def toDict(self):
        """
        Convierte los datos de la guild a un diccionario para su almacenamiento en la base de datos.
        
        :return: Diccionario con los datos de la guild
        """
        return {
            "_id": self._id,
            "music-setting": self.musicSetting
        }

    def create(self, collectionName=None):
        """
        Crea un nuevo documento en la colección especificada o en la colección por defecto.
        
        :param collectionName: Nombre de la colección donde se creará el documento (opcional)
        :return: ID del documento creado
        """
        return super().create(self.toDict(), collectionName)

    def drop(self, collectionName=None):
        """
        Elimina la colección de la base de datos.
        
        :param collectionName: Nombre de la colección a eliminar (opcional)
        """
        return super().drop(collectionName)

    def insert(self, collectionName=None):
        """
        Inserta los datos de la guild en la colección especificada o en la colección por defecto.
        
        :param collectionName: Nombre de la colección donde se insertará el documento (opcional)
        :return: ID del documento insertado
        """
        return super().insert(self.toDict(), collectionName)

    def findOne(self, query=None, collectionName=None):
        """
        Encuentra un documento en la colección especificada o en la colección por defecto.
        
        :param query: Consulta para encontrar el documento (opcional)
        :param collectionName: Nombre de la colección donde se buscará el documento (opcional)
        :return: Documento encontrado o None si no se encuentra
        """
        return super().findOne(query, collectionName)

    def findAll(self, query=None, collectionName=None):
        """
        Encuentra todos los documentos que coinciden con la consulta en la colección especificada o en la colección por defecto.
        
        :param query: Consulta para encontrar los documentos (opcional)
        :param collectionName: Nombre de la colección donde se buscarán los documentos (opcional)
        :return: Lista de documentos encontrados
        """
        return super().findAll(query, collectionName)
