import { readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "url";
import { bold, REST, Routes, SlashCommandBuilder } from "discord.js";
import { BotClient } from "../class/BotClient.js";
import { Command } from "../types/Client.js";
import { config } from "../config/config.js";

/**
 * Carga y valida un comando desde un archivo.
 * @param client - Cliente del bot.
 * @param filePath - Ruta al archivo del comando.
 */
async function loadCommand(client: BotClient, filePath: string) {
    const fileUrl = pathToFileURL(filePath).href;

    try {
        const command = await import(fileUrl).then((mod) => mod.default) as Command;

        if (!command || !command.data || !command.execute) {
            console.warn(`[WARNING] El archivo ${filePath} no contiene propiedades "data" o "execute".`);
            return;
        }

        // Registra el comando en el cliente
        client.commands.set(command.data.name, command);
        console.log(`|| Comando registrado: ${bold(command.data.name)} ||`);
    } catch (err) {
        console.error(`[ERROR] Error al cargar el comando en ${filePath}:`, err);
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
export async function deployAllCommands(client: BotClient) {
    try {
        const commandsPath = join(process.cwd(), "dist", "commands");
        await loadAllCommands(client, commandsPath);

        const rest = new REST().setToken(config.bot.token);
        const commandData: SlashCommandBuilder[] = [];

        client.commands.forEach((cmd) => {
            commandData.push(cmd.data as SlashCommandBuilder);
        });

        await rest.put(
            client.debugMode
                ? Routes.applicationGuildCommands(config.bot.clientID, config.bot.devGuild)
                : Routes.applicationCommands(config.bot.clientID),
            { body: commandData }
        );

        console.log("|| Todos los comandos fueron registrados con éxito ||");
    } catch (err) {
        console.error("[ERROR] Falló el registro de los comandos:", err);
    }
}
