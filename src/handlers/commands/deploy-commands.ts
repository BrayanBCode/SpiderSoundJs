import { readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "url";
import { Command } from "../../types/Client.js";
import { config } from "../../config/config.js";
import { BotClient } from "../../class/BotClient.js";
import { bold, REST, Routes, SlashCommandBuilder } from "discord.js";

export async function getCommands(client: BotClient, subCarpet: string = "") {
    const path = join(process.cwd(), "dist", "commands", (subCarpet ? subCarpet : ""));
    const files = readdirSync(path).filter(file => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of files) {
        const filePath = join(path, file);

        // Convertimos la ruta a un esquema file:// compatible con ESM
        const fileUrl = pathToFileURL(filePath).href;

        try {
            const cmd = await import(fileUrl).then(v => v.default) as Command;

            if ("data" in cmd && "execute" in cmd) {
                console.log(`|| Se obtuvo ${cmd.data.name} ||`);
                client.commands.set(cmd.data.name, cmd);
                // console.log("getCommands: " + [...client.commands.values()].map(cmd => cmd.data.name).join(", "));
            } else {
                console.warn(`[WARNING] The Command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        } catch (err) {
            console.error(`[ERROR] Failed to load command at ${filePath}:`, err);
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

        // console.log("deployAllCommands: " + [...client.commands.values()].map(cmd => cmd.data.name).join(", "));

        client.commands.forEach((cmd) => {
            commandData.push(cmd.data as SlashCommandBuilder);
        });

        await rest.put(
            client.debugMode
                ? Routes.applicationGuildCommands(config.bot.clientID, config.bot.devGuild)
                : Routes.applicationCommands(config.bot.clientID),
            { body: commandData }
        );

        console.log('Successfully registered application commands.');
    } catch (err) {
        console.error('Error registering application commands:', err);
    }
}
