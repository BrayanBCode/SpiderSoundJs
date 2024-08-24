from colorama import Fore
from base.db.connect import DBConnection
from base.utils.Logging.ErrorMessages import LogDebug

# from connect import DBConnection
# from controller import SpiderDBController


class DBManager(DBConnection):
    def __init__(self, Mongo_URI, dbName):
        DBConnection.__init__(self, Mongo_URI, dbName)
        print(f"{Fore.BLUE}DBManager iniciado.")
        self.createConnection()

    def defaultGuildData(self, guildID):
        return {
            "_id": guildID,
            "music-setting": {
                "sourcevolumen": 100,
                "volume": 25,
            }
        }

    def defaultUserData(self, userID):
        return {
            "_id": userID,
            "fav": {
                "albums": {
                    "example": {
                        "name": "Adele mix",
                        "songs": [
                            {
                                "title": "Adele - Skyfall (Official Lyric Video)",
                                "url": "https://www.youtube.com/watch?v=DeumyOzKqgI",
                                "duration": 290,
                                "uploader": "Adele"
                            }
                        ]
                    }
                }
            }
        }

    def dropAllCollections(self):
        for collection in self.db.list_collection_names():
            self.db.drop_collection(collection)
            
        LogDebug(
            title="Colecciones eliminadas.",
            message="Todas las colecciones han sido eliminadas."
        ).print()
        






    def entryExists(self, collection, query) -> dict | None:
        """Devuelve la entrada si existe, de lo contrario, None."""
        return [entry for entry in collection.find(query) if entry["_id"] == query["_id"]][0]

    def __del__(self):
        try:
            self.closeConnection()
            print("DBManager cerrado.")
        except:
            pass

# DBM = DBManager(os.getenv("MONGO_URI"))
# DBM.createConnection()

# if DBM.db.list_collection_names() == []:
#     DBM.createCollection("guilds")
#     DBM.createCollection("users")

# col_guild = DBM.getCollection("guilds")
# col_user = DBM.getCollection("users")

# # DBM.insertOne(col_guild, DBM.defaultGuildData(12234))
# # DBM.insertOne(col_user, DBM.defaultUserData(44212))

# print(DBM.findOne(col_guild, {"_id": 12234}))
# print(DBM.findOne(col_user, {"_id": 44212}))

# DBM.closeConnection()