import { readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "url";
import { ICommand } from "../../types/Client.js";
import { config } from "../../config/config.js";
import { BotClient } from "../../class/BotClient.js";
import { bold, REST, Routes, SlashCommandBuilder } from "discord.js";
import logger from "../../class/logger.js";

export async function getCommands(client: BotClient, subCarpet: string = "") {
    const path = join(process.cwd(), "dist", "commands", (subCarpet ? subCarpet : ""));
    const files = readdirSync(path).filter(file => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of files) {
        const filePath = join(path, file);

        // Convertimos la ruta a un esquema file:// compatible con ESM
        const fileUrl = pathToFileURL(filePath).href;

        try {
            const cmd = await import(fileUrl).then(v => v.default) as ICommand;

            if ("data" in cmd && "execute" in cmd) {
                logger.info(`|| Se obtuvo ${cmd.data.command.name} ||`);
                client.commands.set(cmd.data.command.name, cmd);
                // logger.log("getCommands: " + [...client.commands.values()].map(cmd => cmd.data.name).join(", "));
            } else {
                logger.warn(`The Command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        } catch (err) {
            if (err instanceof Error) {
                logger.error(`Failed to load command at ${filePath}:`, err);
                logger.error(`Stack Trace: ${err.stack}`);
            } else {
                logger.error('Ocurrió un error desconocido al registrar los comandos');
            }
        }
    }
}

export async function getAllCommands(client: BotClient) {
    for (const folName of config.commandFolders) {
        await getCommands(client, folName);
    }
}

export async function deployAllCommands(client: BotClient) {
    try {
        await getAllCommands(client);
        const rest = new REST().setToken(config.bot.token);
        const commandData: SlashCommandBuilder[] = [];

        // logger.log("deployAllCommands: " + [...client.commands.values()].map(cmd => cmd.data.name).join(", "));

        client.commands.forEach((cmd) => {
            commandData.push(cmd.data.command as SlashCommandBuilder);
        });

        await rest.put(
            client.debugMode
                ? Routes.applicationGuildCommands(config.bot.clientID, config.bot.devGuild)
                : Routes.applicationCommands(config.bot.clientID),
            { body: commandData }
        );

        logger.info('Successfully registered application commands.');
    } catch (err) {
        if (err instanceof Error) {
            logger.error('Error registering application commands:', err);
            logger.error(`Stack Trace: ${err.stack}`);
        } else {
            logger.error('Ocurrió un error desconocido al registrar los comandos');
        }
    }
}
