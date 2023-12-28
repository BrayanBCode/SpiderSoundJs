#* Seccion de la Base de Datos ------------------------------

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData, Table, Column, Integer, String, update

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ServerPlaylist.db'  # Cambia la URL por tu base de datos
db = SQLAlchemy(app)

with app.app_context():
    db.create_all()

# Modelo de tablas
def dynamic_Model_table(table_name):
    metadata = MetaData()
    dynamic_table = Table(
        table_name, metadata,
        Column('id', Integer, primary_key=True, autoincrement=True),
        Column('url', String(100)),
    )
    return dynamic_table

def tabla_existe(table_name):
    table_name = str(table_name)
    inspector = db.inspect(db.engine)
    return table_name in inspector.get_table_names()

def Crear_Tabla(Guild, dynamic_table):
    with app.app_context():
        if not tabla_existe(Guild):
            dynamic_table.create(bind=db.engine, checkfirst=True)
            
            print(f"La tabla para el servidor {Guild.name} - ID: {Guild.id} fue creada")
        else:
            print("La tabla ya existe")
            
def get_table(table_name):
    return Table(str(table_name), MetaData(), autoload_with=db.engine)

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

            print("Datos ingresados")
        else:
            print(f"No se pudo ingresar el dato en la tabla: {table_name}")

# Read
def get_item_by_id(table_name, item_id):
    with app.app_context():
        if tabla_existe(table_name):
            table = get_table(table_name)

            result = db.session.query(table).filter_by(id=item_id).first()
            return result
        else:
            return None

# Update
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
                print("El elemento no existe")

# Delete
def remove_item_by_id(table_name, item_id):
    with app.app_context():
        if tabla_existe(table_name):
            print(tabla_existe(table_name))
            table = get_table(table_name)
            entry = get_item_by_id(table, item_id)

            if entry:
                db.session.execute(table.delete().where(table.c.id == item_id))  # Elimina la fila con la condición
                db.session.commit()  # Confirma la eliminación
                print("Elemento eliminado")
                remove_item_by_id(table_name, item_id)


            else:
                print("El elemento no existe")

def get_all_items(table_name):
    with app.app_context():
        if tabla_existe(table_name):
            # Obtener la instancia de la tabla dinámica existente
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
            print(f"Se eliminaron todas las entradas de la tabla: {table_name}")
        else:
            print(f"No se pudo eliminar las entradas, la tabla {table_name} no existe")

def add_multiple_items(table_name, data_list):
    with app.app_context():
        if tabla_existe(table_name):
            table = get_table(table_name)

            # Crear una lista de instancias de la tabla con los datos proporcionados
            entries = [table(**data) for data in data_list]

            # Agregar las instancias a la sesión de la base de datos y realizar un commit
            db.session.add_all(entries)
            db.session.commit()
            print("Datos ingresados")
        else:
            print(f"No se pudo ingresar los datos en la tabla: {table_name}")

def reorganize_ids_after_delete(table_name, deleted_id):
    with app.app_context():
        if tabla_existe(table_name):
            table = get_table(table_name)

            # Obtener los registros con ID mayor que el ID eliminado
            items_to_update = db.session.query(table).filter(table.c.id > deleted_id).all()

            # Actualizar las IDs restantes en la tabla
            for item in items_to_update:
                db.session.execute(
                    update(table)
                    .where(table.c.id == item.id)
                    .values(id=item.id - 1)
                )

            db.session.commit()
            print("IDs reorganizadas después de la eliminación.")
        else:
            print(f"La tabla {table_name} no existe.")

#* Seccion de la Base de Datos ------------------------------