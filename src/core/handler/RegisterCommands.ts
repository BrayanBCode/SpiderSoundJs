import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { config } from "@/config/config.js";
import { ICommand } from "@/types/types/Client.js";
import { stringPathToSegmentedString } from "@/utils/tools.js";
import { SlashCommandBuilder, REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";


/**
 * Carga y valida un comando desde un archivo.
 * @param client - Cliente del bot.
 * @param filePath - Ruta al archivo del comando.
 */
async function loadCommand(client: BotClient, filePath: string) {
    const fileUrl = pathToFileURL(filePath).href;

    try {
        const command = await import(fileUrl).then((mod) => mod.default) as ICommand;

        if (!command || !command.data || !command.execute) {
            logger.warn(`El archivo ${filePath} no contiene propiedades "data" o "execute".`);
            return;
        }

        // Registra el comando en el cliente
        client.commands.set(command.data.command.name, command);
    } catch (err) {
        logger.error(`Error al cargar el comando en ${fileUrl}: ${err}`);
    }
}

/**
 * Carga todos los comandos desde una carpeta.
 * @param client - Cliente del bot.
 * @param commandsDir - Directorio donde están los archivos de comandos.
 */
async function loadCommandsFromDir(client: BotClient, commandsDir: string) {
    const files = readdirSync(commandsDir).filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of files) {
        const filePath = join(commandsDir, file);
        await loadCommand(client, filePath);
    }
}

/**
 * Carga comandos de subcarpetas y carpetas principales.
 * @param client - Cliente del bot.
 * @param baseDir - Carpeta base de comandos.
 */
async function loadAllCommands(client: BotClient, baseDir: string) {
    const folders = readdirSync(baseDir, { withFileTypes: true }).filter((entry) => entry.isDirectory());

    for (const folder of folders) {
        const folderPath = join(baseDir, folder.name);
        await loadCommandsFromDir(client, folderPath);
    }

    // Finalmente, carga los comandos directamente en la carpeta base
    await loadCommandsFromDir(client, baseDir);
}

/**
 * Registra todos los comandos en Discord.
 * @param client - Cliente del bot.
 */
export async function registerAllCommands(client: BotClient) {
    try {
        const commandsPath = join(process.cwd(), ...stringPathToSegmentedString(config.handlersFolders.discord.commands));

        // Cargar todos los comandos en client.commands
        await loadAllCommands(client, commandsPath);

        const commandData: SlashCommandBuilder[] = [];

        for (const cmd of client.commands.values()) {
            try {
                const json = (cmd.data.command as SlashCommandBuilder).toJSON();
                logger.info(`|| Comando **${json.name}** registrado. ||`);

                commandData.push(cmd.data.command as SlashCommandBuilder);
            } catch (err) {
                logger.error(`Error en el comando "${cmd.data.command?.name}": ${err}`);
            }
        }

        const rest = new REST().setToken(config.bot.token);

        await rest.put(
            client.debugMode
                ? Routes.applicationGuildCommands(config.bot.clientID, config.bot.devGuild)
                : Routes.applicationCommands(config.bot.clientID),
            { body: commandData }
        );

        logger.info("|| Todos los comandos fueron registrados con éxito ||");
    } catch (err) {
        if (err instanceof Error) {
            logger.error(`Falló el registro de los comandos: ${err.message}`);
            logger.error(`Stack Trace: ${err.stack}`);
        } else {
            logger.error('Ocurrió un error desconocido al registrar los comandos');
        }
    }
}

