import dotenv from 'dotenv';

// Cargar las variables de entorno
dotenv.config();

interface Config {
    dev: {
        username: string,
        id: string,
        coDevs: string[] // Lista de IDs de co-desarrolladores

    },
    bot: {
        token: string;
        clientID: string;
        user: string;
        devGuild: string;
        debugMode: boolean;
        prefix: string;
    };
    lavalink: {
        authorization: string;
        host: string;
        port: number;
        id: string;
    };
    handlersFolders: {

        discord: {
            slashCommands: string,
            prefixCommands: string,
            withOutPrefixCommands: string,
            events: string
        },
        lavalink: {
            manager: string,
            node: string
        }

    };
}

// Crear una configuración con las variables de entorno
export const config: Config = {
    dev: {
        username: process.env.DEV_USERNAME || '',
        id: process.env.DEV_ID || '111111111111111111',
        coDevs: process.env.DEV_CO_DEVS_ID ? process.env.DEV_CO_DEVS_ID.split(',') : []
    },
    bot: {
        token: process.env.BOT_TOKEN || '',
        clientID: process.env.CLIENT_ID || '',
        user: process.env.USER_NAME || 'MusicBot',
        devGuild: process.env.DEV_GUILD || '',
        prefix: process.env.PREFIX || '!',

        debugMode: process.env.DEBUG_MODE === 'true' // Convierte a booleano
    },
    lavalink: {
        authorization: process.env.LAVALINK_AUTHORIZATION || '', // Valor por defecto
        host: process.env.LAVALINK_HOST || 'lavalink', // Valor por defecto
        port: parseInt(process.env.LAVALINK_PORT || '2333', 10), // Convierte a número
        id: process.env.CLIENT_ID || 'testnode', // Valor por defecto
    },
    handlersFolders: {
        discord: {
            slashCommands: 'src/core/commands/slash',
            prefixCommands: 'src/core/commands/prefix',
            withOutPrefixCommands: 'src/core/commands/withOutPrefix',
            events: 'src/core/events/discord'
        },
        lavalink: {
            manager: "src/core/events/lavalinkManager",
            node: "src/core/events/lavalinkNodeManager"
        }
    }
};
