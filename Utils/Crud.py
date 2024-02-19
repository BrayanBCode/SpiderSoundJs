# main.py

from db_connector import connect_to_database

def main():
    connection = connect_to_database()
    if connection:
        try:
            cursor = connection.cursor()
            query = "SELECT * FROM tu_tabla"
            cursor.execute(query)
            results = cursor.fetchall()
            for row in results:
                print(row)
        except mysql.connector.Error as err:
            print(f"Error en la consulta: {err}")
        finally:
            connection.close()

if __name__ == "__main__":
    main()
