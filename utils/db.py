#* Seccion de la Base de Datos ------------------------------
import re, os, random
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData, Table, Column, Integer, String, update


current_dir = os.path.abspath(os.path.dirname('Main.py'))
data_folder = os.path.join(current_dir, 'Database')
# Si la carpeta "Data" no existe, créala
if not os.path.exists(data_folder):
    os.makedirs(data_folder)
db_path = os.path.join(data_folder, 'ServerPlaylist.db')

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
db = SQLAlchemy(app)

with app.app_context():
    db.create_all()

# Modelo de tablas
def dynamicModelTablePlaylist(table_name):

    metadata = MetaData()
    dynamicTable = Table(
        table_name, metadata,
        Column('id', Integer, primary_key=True, autoincrement=True),
        Column('url', String(100)),
    )
    return dynamicTable

def tableExists(table_name):
    inspector = db.inspect(db.engine)
    return str(table_name) in inspector.get_table_names()

def createTable(guild, dynamicTable):
    with app.app_context():
        if not tableExists(guild):
            dynamicTable.create(bind=db.engine, checkfirst=True)
            print(f"La tabla para el servidor {guild.name} - ID: {guild.id} fue creada")
        else:
            print("La tabla ya existe")

def getTable(table_name):
    return Table(table_name, MetaData(), autoload_with=db.engine)

# Create
def addItem(table_name, data):
    with app.app_context():
        if tableExists(table_name):
            # Obtener la instancia de la tabla dinámica existente
            table = getTable(table_name)

            for items in data:
                # Insertar los datos proporcionados en la tabla
                db.session.execute(table.insert().values(**items))

            db.session.commit()

            print(f"Datos ingresados a la tabla {table_name}")
        else:
            print(f"No se pudo ingresar el dato en la tabla: {table_name}")

def getItemById(table_name, item_id):
    with app.app_context():
        if tableExists(table_name):
            table = getTable(table_name)
            result = db.session.query(table).filter_by(id=item_id).first()
            return result
        else:
            return None

def updateItem(table_name, item_id, new_data):
    with app.app_context():
        if tableExists(table_name):
            table = getTable(table_name)
            entry = getItemById(table, item_id)
            
            if entry:
                # Actualizar los atributos del modelo con los nuevos datos
                for key, value in new_data.items():
                    setattr(entry, key, value)
                db.session.commit()
                print("Datos actualizados")
            else:
                print("El elemento a reorganizar no existe")

def removeItemById(table_name, item_id):
    with app.app_context():
        if tableExists(table_name):
            table = getTable(table_name)
            entry = getItemById(table, item_id)
            
            if entry:
                db.session.execute(table.delete().where(table.c.id == item_id))  # Elimina la fila con la condición
                db.session.commit()
                print("Elemento eliminado")
                reorganizeIdsAfterDelete(table_name)
            else:
                print("El elemento a eliminar no existe")
                print(f"El elemento a eliminar es: {item_id} - {entry} de la tabla {table_name}")

def getAllItems(table_name):
    with app.app_context():
        if tableExists(table_name):
            
            table = getTable(table_name)

            # Realizar una consulta para obtener todos los elementos de la tabla
            query = db.session.query(table).all()
            return query
        else:
            return None

def listado(table_name):
    with app.app_context():
        table_name = str(table_name)  # Nombre de la tabla basado en el ID del servidor

        if not tableExists(table_name):
            print(f"No existe la tabla para el servidor: {table_name}")
            return

        items = getAllItems(table_name)
        if items:
            print("Se han mostrado todos los elementos de la tabla")
            for item in items:
                # Imprime los elementos de la tabla en la consola del bot
                print(item)
        else:
            print(f"No se pudieron encontrar elementos en la tabla: {table_name}")

def removeAllItems(table_name):
    with app.app_context():
        if tableExists(table_name):
            table = getTable(table_name)
            db.session.execute(table.delete())
            db.session.commit()
            print(f"Se eliminaron las entradas de la tabla {table_name}")
        else:
            print(f"No se pudo eliminar las entradas, la tabla {table_name} no existe")

def reorganizeIdsAfterDelete(table_name):
    with app.app_context():
        if tableExists(table_name):
            table = getTable(table_name)

            # Obtener todos los registros de la tabla ordenados por ID
            items = db.session.query(table).order_by(table.c.id).all()

            # Actualizar las IDs de los registros en la tabla
            for index, item in enumerate(items, start=1):
                db.session.execute(
                    update(table)
                    .where(table.c.id == item.id)
                    .values(id=index)
                )

            db.session.commit()
            print("IDs reorganizadas después de la eliminación.")
        else:
            print(f"La tabla {table_name} no existe.")

def updatePlaylistInDb(guild_id, songs_to_keep):    
    # Eliminar todas las canciones actuales de la lista de reproducción para el servidor en la base de datos
    removeAllItems(guild_id)

    # Preparar los datos de las canciones a mantener en la lista de reproducción
    songs_data = []
    for song in songs_to_keep:
        songs_data.append([{'url': song}])

    # Agregar las canciones que se desean mantener en la lista de reproducción para el servidor en la base de datos
    addItem(guild_id, songs_data)

    print(f"Lista de reproducción actualizada en la base de datos para el servidor {guild_id}")

def deleteItemsUpToId(table_name, end_id):
    with app.app_context():
        if tableExists(table_name):
            table = getTable(table_name)

            # Ejecutar la sentencia DELETE directamente en la base de datos
            db.session.execute(table.delete().where(table.c.id <= end_id))
            db.session.commit()

            # Reorganizar las IDs después de la eliminación
            reorganizeIdsAfterDelete(table_name)

            print(f"Elementos eliminados hasta la ID {end_id}")
        else:
            print(f"No existe la tabla: {table_name}")

def loopedPlaylist(guild_actual, command):
        with app.app_context():
            if tableExists(guild_actual):
                table = getTable(guild_actual)
                data_list = []

                skiped_songs = db.session.query(table).filter(table.c.id <= command).all()
                deleteItemsUpToId(guild_actual, command)
        

                for song in skiped_songs:
                    data_list.append({'url': str(song[1])})

                addItem(guild_actual, data_list)
                print("Playlist con loop activa, re acomodando canciones al final de la playlist")
            else:
                print(f"No existe la tabla: {guild_actual}")

def deleteEntriesFromAllTables():
    with app.app_context():
        inspector = db.inspect(db.engine)
        tablas = inspector.get_table_names()

        for tabla in tablas:
            removeAllItems(str(tabla))
            
        print(f"Todas las entradas de la tablas han sido eliminadas.")
   
def shuffleEntries(table_name):
    with app.app_context():
        if tableExists(table_name):
            # Obtener la instancia de la tabla dinámica existente
            table = getTable(table_name)

            # Obtener todas las entradas de la tabla
            entradas = db.session.query(table).all()

            # Mezclar aleatoriamente las entradas
            random.shuffle(entradas)

            # Eliminar todas las entradas existentes en la tabla
            removeAllItems(table_name)

            # Reorganizar las IDs después de la eliminación
            reorganizeIdsAfterDelete(table_name)

            # Agregar las entradas mezcladas de nuevo a la tabla
            for index, entrada in enumerate(entradas, start=1):
                db.session.execute(table.insert().values(id=index, url=entrada.url))

            db.session.commit()
            print(f"Entradas mezcladas aleatoriamente en la tabla {table_name}")
        else:
            print(f"No se pudo mezclar la tabla: {table_name}, ya que no existe")



#* Seccion de la Base de Datos ------------------------------