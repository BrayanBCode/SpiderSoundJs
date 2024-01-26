#* Seccion de la Base de Datos ------------------------------
import re, os
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
def dynamic_Model_table_Playlist(table_name):

    metadata = MetaData()
    dynamic_table = Table(
        table_name, metadata,
        Column('id', Integer, primary_key=True, autoincrement=True),
        Column('url', String(100)),
    )
    return dynamic_table

def tabla_existe(table_name):
    inspector = db.inspect(db.engine)
    return str(table_name) in inspector.get_table_names()

def Crear_Tabla(Guild, dynamic_table):
    with app.app_context():
        if not tabla_existe(Guild):
            dynamic_table.create(bind=db.engine, checkfirst=True)
            print(f"La tabla para el servidor {Guild.name} - ID: {Guild.id} fue creada")
        else:
            print("La tabla ya existe")

def get_table(table_name):
    return Table(table_name, MetaData(), autoload_with=db.engine)

# Create
def add_item(table_name, data):
    with app.app_context():
        if tabla_existe(table_name):
            # Obtener la instancia de la tabla dinámica existente
            tabla = get_table(table_name)

            for items in data:
            # Insertar los datos proporcionados en la tabla
                db.session.execute(tabla.insert().values(**items))

            db.session.commit()

            print(f"Datos ingresados a la tabla {table_name}")
        else:
            print(f"No se pudo ingresar el dato en la tabla: {table_name}")

def get_item_by_id(table_name, item_id):
    with app.app_context():
        if tabla_existe(table_name):
            table = get_table(table_name)
            result = db.session.query(table).filter_by(id=item_id).first()
            print(f"get_item_by_id: {result}")
            return result
        else:
            print(f"get_item_by_id: {tabla_existe(table_name)}")
            return None

def update_item(table_name, item_id, new_data):
    with app.app_context():
        if tabla_existe(table_name):
            table = get_table(table_name)
            entry = get_item_by_id(table, item_id)
            
            if entry:
                # Actualizar los atributos del modelo con los nuevos datos
                for key, value in new_data.items():
                    setattr(entry, key, value)
                db.session.commit()
                print("Datos actualizados")
            else:
                print("El elemento a reorganizar no existe")

def remove_item_by_id(table_name, item_id):
    with app.app_context():
        if tabla_existe(table_name):
            table = get_table(table_name)
            entry = get_item_by_id(table, item_id)
            
            if entry:
                db.session.execute(table.delete().where(table.c.id == item_id))  # Elimina la fila con la condición
                db.session.commit()
                print("Elemento eliminado")
                reorganize_ids_after_delete(table_name)
            else:
                print("El elemento a eliminar no existe")
                print(f"El elemento a eliminar es: {item_id} - {entry} de la tabla {table_name}")

def get_all_items(table_name):
    with app.app_context():
        if tabla_existe(table_name):
            
            tabla = get_table(table_name)

            # Realizar una consulta para obtener todos los elementos de la tabla
            query = db.session.query(tabla).all()
            return query
        else:
            return None

def listado(table_name):
    with app.app_context():
        table_name = str(table_name)  # Nombre de la tabla basado en el ID del servidor

        if not tabla_existe(table_name):
            print(f"No existe la tabla para el servidor: {table_name}")
            return

        items = get_all_items(table_name)
        if items:
            print("Se han mostrado todos los elementos de la tabla")
            for item in items:
                # Imprime los elementos de la tabla en la consola del bot
                print(item)
        else:
            print(f"No se pudieron encontrar elementos en la tabla: {table_name}")

def remove_all_items(table_name):
    with app.app_context():
        if tabla_existe(table_name):
            table = get_table(table_name)
            db.session.execute(table.delete())
            db.session.commit()
        else:
            print(f"No se pudo eliminar las entradas, la tabla {table_name} no existe")

def reorganize_ids_after_delete(table_name):
    with app.app_context():
        if tabla_existe(table_name):
            table = get_table(table_name)

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

def update_playlist_in_db(guild_id, songs_to_keep):    
    # Eliminar todas las canciones actuales de la lista de reproducción para el servidor en la base de datos
    remove_all_items(guild_id)

    # Preparar los datos de las canciones a mantener en la lista de reproducción
    songs_data = []
    for song in songs_to_keep:
        songs_data.append([{'url': song}])

    # Agregar las canciones que se desean mantener en la lista de reproducción para el servidor en la base de datos
    add_item(guild_id, songs_data)

    print(f"Lista de reproducción actualizada en la base de datos para el servidor {guild_id}")

def delete_items_up_to_id(table_name, end_id):
    with app.app_context():
        if tabla_existe(table_name):
            table = get_table(table_name)

            # Ejecutar la sentencia DELETE directamente en la base de datos
            db.session.execute(table.delete().where(table.c.id <= end_id))
            db.session.commit()

            # Reorganizar las IDs después de la eliminación
            reorganize_ids_after_delete(table_name)

            print(f"Elementos eliminados hasta la ID {end_id}")
        else:
            print(f"No existe la tabla: {table_name}")

def loopedPlaylist(GuildActual, command):
        with app.app_context():
            if tabla_existe(GuildActual):
                table = get_table(GuildActual)
                data_list = []

                Skiped_songs = db.session.query(table).filter(table.c.id <= command).all()
                delete_items_up_to_id(GuildActual, command)
        

                for song in Skiped_songs:
                    data_list.append({'url': str(song[1])})

                add_item(GuildActual, data_list)
                print("Playlist con loop activa, re acomodando canciones al final de la playlist")
            else:
                print(f"No existe la tabla: {GuildActual}")

def eliminar_entradas_de_todas_las_tablas():
    with app.app_context():
        inspector = db.inspect(db.engine)
        tablas = inspector.get_table_names()

        for tabla in tablas:
            remove_all_items(str(tabla))
            
        print(f"Todas las entradas de la tablas han sido eliminadas.")



#* Seccion de la Base de Datos ------------------------------