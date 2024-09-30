from base.utils.Logging.LogMessages import LogError, LogInfo


class EntrieModel:
    def __init__(self, mongoConnection, collectionName=None):
        self.mongoConnection = mongoConnection
        self.collectionName = collectionName
        self.collection = (
            self.mongoConnection.getCollection(collectionName)
            if collectionName
            else None
        )

        self._id = None

    def update(self, query, updateValues, collectionName=None):
        """Actualiza un documento en la colección especificada o en la colección de la clase."""
        try:
            if collectionName:
                collection = self.mongoConnection.getCollection(collectionName)
            elif self.collection is not None:
                collection = self.collection
            else:
                raise ValueError(
                    "Debe especificar una colección en el constructor o en la función update."
                )

            result = collection.update_one(query, {"$set": updateValues})
            LogInfo(
                "Documento Actualizado",
                f"Documentos actualizados: {result.modified_count}",
            ).print()
            return result
        except Exception as e:
            LogError(
                "Error al Actualizar Documento",
                f"No se pudo actualizar el documento: {e}",
            ).log(e)
            raise e

    def toDict() -> dict:
        pass
