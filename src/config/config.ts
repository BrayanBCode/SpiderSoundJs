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
    };
    lavalink: {
        authorization: string;
        host: string;
        port: number;
        id: string;
    };
    commandFolders: string[];
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
        user: process.env.USER_NAME || 'Araña Sound', // Valor por defecto si no está definido en .env
        devGuild: process.env.DEV_GUILD || '',
    },
    lavalink: {
        authorization: process.env.LAVALINK_AUTHORIZATION || 'password', // Valor por defecto
        host: process.env.LAVALINK_HOST || 'lavalink', // Valor por defecto
        port: parseInt(process.env.LAVALINK_PORT || '2333', 10), // Convierte a número
        id: process.env.LAVALINK_ID || 'testnode', // Valor por defecto
    },
    commandFolders: process.env.COMMAND_FOLDERS ? process.env.COMMAND_FOLDERS.split(',') : ['misc', 'music'],
};
