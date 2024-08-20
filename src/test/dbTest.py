import json
import colorama
import pymongo
import pymongo
from pymongo.collection import Collection
from base.db.DBManager import DBManager

import dotenv
import os


dotenv.load_dotenv()

colorama.init(autoreset=True)


DBManager = DBManager(Mongo_URI=os.getenv("MONGO_URI"), dbName="SpiderBot-DB")

def test():
    print("Testing DBManager...")
    
    print("Testing defaultGuildData...")
    default_guild_data = DBManager.defaultGuildData(1111.1)

    print("Testing defaultUserData...")
    default_user_data = DBManager.defaultUserData(2222.2)

    # printDict(default_guild_data)
    # printDict(default_user_data)
    
    user_collection = DBManager.getCollection("users")
    guild_collection = DBManager.getCollection("guilds")

    for user in user_collection.find():
        printDict(user)

    for guild in guild_collection.find():
        printDict(guild)

    user_collection

    print("Testing entryExists...")
    print(entryExists(user_collection, {"_id": 2222.2}))

def entryExists(collection: Collection, query) -> dict | None:
    """Devuelve la entrada si existe, de lo contrario, None."""
    return collection.count_documents(query, limit=1) != 0











def printDict(dictionary):
    print(json.dumps(dictionary, indent=3))

if __name__ == "__main__":
    test()
    print("Test ended.")