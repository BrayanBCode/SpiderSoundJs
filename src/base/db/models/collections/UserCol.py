import jsonschema
from jsonschema import validate

from base.db.models.CollectionModel import CollectionModel
from base.db.models.entries.UserEntrie import UserEntrie


class UserCol(CollectionModel):
    def __init__(self, mongoConnection, collectionName="users"):
        super().__init__(mongoConnection, collectionName)

    def createGuild(self, Entrie: UserEntrie):
        """
        Crea una nueva entrada de guild en la base de datos.

        :param guildData: Datos de la guild en formato de diccionario
        :raises ValueError: Si los datos de la guild no cumplen con el esquema
        """
        self.validateUserData(Entrie)
        self.insert(Entrie)

    def getUser(self, userId):
        """
        Obtiene los datos de una guild específica de la base de datos.

        :param guildId: ID de la guild que se va a obtener
        :return: Datos de la guild en formato de diccionario
        """
        return UserEntrie(self.mongoConnection, self.findOne({"_id": userId}))

    def validateUserData(self, Entrie: UserEntrie):
        """
        Valida que los datos de la guild cumplan con el esquema definido.

        :param data: Datos de la guild en formato de diccionario
        :raises jsonschema.exceptions.ValidationError: Si los datos no cumplen con el esquema
        """
        try:
            validate(Entrie.toDict, Entrie.schema)
        except jsonschema.exceptions.ValidationError as err:
            raise ValueError(f"Invalid guild data: {err.message}")

    def delEntrie(self, Entrie: UserEntrie):
        return super().delEntrie({"_id": Entrie._id})
