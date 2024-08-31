from faker import Faker


class GenData:
    
    def GenDefaultUser(self):
        user = {
            "_id": Faker.random_int(min=5, max=10),
            "fav": {
                "albums": {
                    
                }
            }
        }
        for i in range(5):
            user["fav"]["albums"][Faker.name()] = {
                "name": Faker.word(),
                "songs": [
                    {
                        "title": Faker.word(),
                        "url": Faker.url(),
                        "duration": Faker.random_int(min=100, max=500),
                        "uploader": Faker.name()
                    },
                    {
                        "title": Faker.word(),
                        "url": Faker.url(),
                        "duration": Faker.random_int(min=100, max=500),
                        "uploader": Faker.name()
                    }
                ]
            }
        return user

    def GenDefaultGuild(self):
        return {
            "_id": Faker.random_int(min=5, max=10),
            "music-setting": {
                "sourcevolumen": Faker.random_int(min=1, max=100),
                "volume": Faker.random_int(min=1, max=100),
            }
        }