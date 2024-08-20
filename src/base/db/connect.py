from colorama import Fore
import pymongo

class DBConnection:
    def __init__(self, Mongo_URI, dbName):
        self.Mongo_URI = Mongo_URI
        self.dbName = dbName
        self.client = None
        self.db = None
        
    def createConnection(self):
        try:
            if self.client:
                print(f"{Fore.YELLOW}[Aviso] Ya existe una conexión a la base de datos.")
                return
            
            self.client = pymongo.MongoClient(self.Mongo_URI, serverSelectionTimeoutMS=1000)
            self.db = self.client.get_database(self.dbName)
            print(f"{Fore.BLUE}[info] Conexión a la base de datos '{self.dbName}' establecida.")

        except Exception as e:
            print(f"{Fore.RED}[Error] Error al conectar a la base de datos: {e}")
            raise
    
    def closeConnection(self):
        if not self.client:
            print(f"{Fore.RED}[Error] No hay ninguna conexión a la base de datos.")
            return
        self.client.close()
        self.client = None
        print(f"{Fore.BLUE}[info] Se ha cerrado la conexión a la base de datos.")

    def __del__(self):
        self.closeConnection()






















    #     self.Mongo_URI = Mongo_URI
    #     self.last_activity_time = time.time()

    #     # try:
    #     #     self.client = pymongo.MongoClient(Mongo_URI, serverSelectionTimeoutMS=1000)
    #     #     self.client.server_info()
    #     #     self.db = self.client.get_database('SpiderBot-DB')
    #     #     print("Conexión a la base de datos establecida.")
    #     #     self.start_inactivity_monitor()
    #     # except Exception as e:
    #     #     print(f"Error al conectar a la base de datos: {e}")
    #     #     raise

    # def start_inactivity_monitor(self):
    #     self.inactivity_thread = threading.Thread(target=self.monitor_inactivity)
    #     self.inactivity_thread.daemon = True
    #     self.inactivity_thread.start()

    # def monitor_inactivity(self):
    #     while True:
    #         time.sleep(60)  # Check every 60 seconds
    #         if time.time() - self.last_activity_time > 300:  # 5 minutes of inactivity
    #             self.close()
    #             print("Se ha cerrado la conexión por inactividad.")
    #             break

    # def update_activity(self):
    #     self.last_activity_time = time.time()

    # def connect(self):
    #     self.update_activity()
    #     return pymongo.MongoClient(self.Mongo_URI, serverSelectionTimeoutMS=1000)

    # def close(self):
    #     self.client.close()

    # def getDB(self):
    #     self.update_activity()
    #     return self.db

    # def getClient(self):
    #     self.update_activity()
    #     return self.client

    # def DesconnectByTimeout(self):
    #     self.close()
    #     return "Se ha cerrado la conexión por exceso de tiempo abierta."