import pymongo
from pymongo.collection import Collection

from base.db.models.EntrieModel import EntrieModel
from base.utils.Logging.LogMessages import LogError, LogExitoso, LogInfo


class CollectionModel:
    mongoConnection: pymongo.MongoClient
    collectionName: str
    collection: Collection

    def __init__(self, mongoConnection, collectionName):
        self.mongoConnection = mongoConnection
        self.collectionName = collectionName
        self.collection = self.mongoConnection.getCollection(collectionName)

    def create(self):
        """Crea la colección si no existe."""
        try:
            if (
                self.collectionName
                not in self.mongoConnection.db.list_collection_names()
            ):
                self.collection.insert_one({})
                self.collection.delete_one({})
                LogExitoso(
                    "Colección Creada", f"Colección '{self.collectionName}' creada."
                ).print()
            else:
                LogInfo(
                    "Colección Ya Existe",
                    f"Colección '{self.collectionName}' ya existe.",
                ).print()
        except Exception as e:
            LogError(
                "Error al Crear Colección", f"No se pudo crear la colección: {e}"
            ).log(e)

    def drop(self):
        """Elimina la colección de la base de datos."""
        try:
            self.collection.drop()
            LogInfo(
                "Colección Eliminada", f"Colección '{self.collectionName}' eliminada."
            ).print()
        except Exception as e:
            LogError(
                "Error al Eliminar Colección", f"No se pudo eliminar la colección: {e}"
            ).log(e)

    def insert(self, Entrie: EntrieModel):
        """Inserta un documento en la colección."""
        try:
            result = self.collection.insert_one(Entrie.toDict())
            LogExitoso(
                "Documento Insertado",
                f"Documento insertado con ID: {result.inserted_id}",
            ).print()
            return result.inserted_id
        except Exception as e:
            LogError(
                "Error al Insertar Documento", f"No se pudo insertar el documento: {e}"
            ).log(e)
            raise e

    def delEntrie(self, query):
        """Elimina un documento en la colección que coincida con la consulta dada."""
        try:
            result = self.collection.delete_one(query)
            LogExitoso(
                "Documento Eliminado", f"Documentos eliminados: {result.deleted_count}"
            ).print()
            return result
        except Exception as e:
            LogError(
                "Error al Eliminar Documento", f"No se pudo eliminar el documento: {e}"
            ).log(e)
            raise e

    def findOne(self, query):
        """Encuentra un documento en la colección que coincida con la consulta dada."""
        try:
            return self.collection.find_one(query)
        except Exception as e:
            LogError(
                "Error al Buscar Documento", f"No se pudo buscar el documento: {e}"
            ).print()
            return None

    def findAll(self, query):
        """Encuentra todos los documentos en la colección que coincidan con la consulta dada."""
        try:
            return self.collection.find(query)
        except Exception as e:
            LogError(
                "Error al Buscar Documentos", f"No se pudo buscar los documentos: {e}"
            ).log(e)
            raise e

    # def update(self, query, updateValues, collectionName=None):
    #     """Actualiza un documento en la colección especificada o en la colección de la clase."""
    #     try:
    #         if collectionName:
    #             collection = self.mongoConnection.getCollection(collectionName)
    #         elif self.collection:
    #             collection = self.collection
    #         else:
    #             raise ValueError("Debe especificar una colección en el constructor o en la función update.")

    #         result = collection.update_one(query, {'$set': updateValues})
    #         LogInfo("Documento Actualizado", f"Documentos actualizados: {result.modified_count}").print()
    #         return result
    #     except Exception as e:
    #         LogError("Error al Actualizar Documento", f"No se pudo actualizar el documento: {e}").log(e)
    #         raise e
