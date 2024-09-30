class DefaultData:

    @staticmethod
    def DefaultUser(ID: int):
        return {
            "_id": ID,
            "fav": {
                "albums": {
                    # "Adele Mix": [
                    #     {
                    #         "name": "Adele Mix",
                    #         "songs": {
                    #             "title": "Adele - Skyfall (Official Lyric Video)",
                    #             "url": "https://www.youtube.com/watch?v=DeumyOzKqgI",
                    #             "duration": 290,
                    #             "uploader": "Adele",
                    #         }
                    #     }
                    # ]
                }
            },
        }

    @staticmethod
    def DefaultGuild(ID: int):
        return {
            "_id": ID,
            "music-setting": {
                "sourcevolumen": 100,
                "volume": 50,
            },
        }
