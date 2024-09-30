from pymongo import MongoClient

from base.utils.Logging.LogMessages import LogError, LogExitoso, LogInfo


class MongoDBConnection:
    def __init__(self, uri, databaseName):
        self.uri = uri
        self.databaseName = databaseName
        self.client = None
        self.db = None

    def connect(self):
        """Establece la conexión a la base de datos."""
        try:
            if self.client is None:
                self.client = MongoClient(self.uri)
                self.db = self.client[self.databaseName]
                LogExitoso(
                    "Conexión Exitosa",
                    f"Conectado a la base de datos: {self.databaseName}",
                ).print()
        except Exception as e:
            LogError(
                "Error de Conexión", f"No se pudo conectar a la base de datos: {e}"
            ).log(e)

    def disconnect(self):
        """Cierra la conexión a la base de datos."""
        try:
            if self.client is not None:
                self.client.close()
                self.client = None
                self.db = None
                LogInfo(
                    "Desconexión Exitosa",
                    f"Desconectado de la base de datos: {self.databaseName}",
                ).print()
        except Exception as e:
            LogError(
                "Error de Desconexión",
                f"No se pudo desconectar de la base de datos: {e}",
            ).log(e)

    def getCollection(self, collectionName):
        """Devuelve una colección de la base de datos."""
        try:
            if self.db is None:
                raise Exception("No estás conectado a la base de datos.")
            return self.db[collectionName]
        except Exception as e:
            LogError(
                "Error al Obtener Colección", f"No se pudo obtener la colección: {e}"
            ).log(e)
            return None
