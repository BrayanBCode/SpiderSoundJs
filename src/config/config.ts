import dotenv from 'dotenv';

// Cargar las variables de entorno
dotenv.config();

interface Config {
    dev: {
        username: string,
        id: string

    },
    bot: {
        token: string;
        clientID: string;
        user: string;
        devGuild: string;
        debugMode: boolean;
    };
    lavalink: {
        authorization: string;
        host: string;
        port: number;
        id: string;
    };
    handlersFolders: {

        discord: {
            commands: string,
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
        id: process.env.DEV_ID || '111111111111111111'
    },
    bot: {
        token: process.env.BOT_TOKEN || '',
        clientID: process.env.CLIENT_ID || '',
        user: process.env.USER_NAME || 'MusicBot', // Valor por defecto si no está definido en .env
        devGuild: process.env.DEV_GUILD || '',

        debugMode: process.env.DEBUG_MODE === 'true' // Convierte a booleano
    },
    lavalink: {
        authorization: process.env.LAVALINK_AUTHORIZATION || '', // Valor por defecto
        host: process.env.LAVALINK_HOST || 'lavalink', // Valor por defecto
        port: parseInt(process.env.LAVALINK_PORT || '2333', 10), // Convierte a número
        id: process.env.LAVALINK_ID || 'testnode', // Valor por defecto
    },
    handlersFolders: {
        discord: {
            commands: 'src/core/commands',
            events: 'src/core/events/discord'
        },
        lavalink: {
            manager: "src/core/events/lavalinkManager",
            node: "src/core/events/lavalinkNodeManager"
        }
    }
};
