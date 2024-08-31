from base.utils.Logging.logger import LogError, LogExitoso, LogInfo

class EntrieModel:
    def __init__(self, mongoConnection, collectionName=None):
        self.mongoConnection = mongoConnection
        self.collectionName = collectionName
        self.collection = self.mongoConnection.getCollection(collectionName) if collectionName else None

    def insert(self, document, collectionName=None):
        """Inserta un documento en la colección especificada o en la colección de la clase."""
        try:
            if collectionName:
                collection = self.mongoConnection.getCollection(collectionName)
            elif self.collection:
                collection = self.collection
            else:
                raise ValueError("Debe especificar una colección en el constructor o en la función insert.")
            
            result = collection.insert_one(document)
            LogExitoso("Documento Insertado", f"Documento insertado en la colección '{collection.name}' con ID: {result.inserted_id}").print()
            return result.inserted_id
        except Exception as e:
            LogError("Error al Insertar Documento", f"No se pudo insertar el documento: {e}").log(e)
            raise e

    def update(self, query, updateValues, collectionName=None):
        """Actualiza un documento en la colección especificada o en la colección de la clase."""
        try:
            if collectionName:
                collection = self.mongoConnection.getCollection(collectionName)
            elif self.collection:
                collection = self.collection
            else:
                raise ValueError("Debe especificar una colección en el constructor o en la función update.")
            
            result = collection.update_one(query, {'$set': updateValues})
            LogInfo("Documento Actualizado", f"Documentos actualizados: {result.modified_count}").print()
            return result
        except Exception as e:
            LogError("Error al Actualizar Documento", f"No se pudo actualizar el documento: {e}").log(e)
            raise e

    def delete(self, query, collectionName=None):
        """Elimina un documento de la colección especificada o de la colección de la clase."""
        try:
            if collectionName:
                collection = self.mongoConnection.getCollection(collectionName)
            elif self.collection:
                collection = self.collection
            else:
                raise ValueError("Debe especificar una colección en el constructor o en la función delete.")
            
            result = collection.delete_one(query)
            LogInfo("Documento Eliminado", f"Documentos eliminados: {result.deleted_count}").print()
            return result
        except Exception as e:
            LogError("Error al Eliminar Documento", f"No se pudo eliminar el documento: {e}").log(e)
            raise e
