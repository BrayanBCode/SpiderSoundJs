
import type MusicClient from "@/client/MusicClient";
import { PermissionsBitField, REST, Routes } from "discord.js";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { SlashCommand } from "../Base/discord/SlashCommand";
import logger from "@/utils/logger";


export async function commandHandler(client: MusicClient, subDirPath?: string) {
    const commandsPath = subDirPath ? join(__dirname, "../../commands", subDirPath) : join(__dirname, "../../commands");

    const files = readdirSync(commandsPath, { withFileTypes: true });

    logger.info(`🔄 Cargando comandos desde: ${commandsPath}`);
    logger.info(`📂 Encontrados ${files.length} archivos de comandos.`);

    for (const file of files) {


        if (file.isDirectory()) {
            commandHandler(client, file.name);
        }

        if (!file.name.endsWith(".ts") && !file.name.endsWith(".js")) continue;

        const imported = require(join(commandsPath, file.name));

        const cmd: SlashCommand = imported.default;

        if (!cmd) continue;

        if (cmd.getCategory === "Moderación" || cmd.getCategory === "Administrador") {
            cmd.setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers);
        }

        client.commandCol.set(cmd.name, cmd);

        logger.info(`Comando cargado: ${cmd.name}`);

    }
}


export async function registerCommands(client: MusicClient) {
    try {
        if (client.commandCol.size === 0) {
            logger.info("No hay comandos para registrar.");
            return;
        }

        const commandsJson = client.commandCol.map(cmd => cmd.toJSON());

        const rest = new REST({ version: "10" }).setToken(process.env.TOKEN!);

        logger.info(`🔁 Registrando ${commandsJson.length} comandos (globales)...`);

        await rest.put(
            Routes.applicationCommands(process.env.BOT_ID!),
            { body: commandsJson }
        );

        logger.info("✅ Comandos registrados globalmente.");
    } catch (error) {
        console.error("❌ Error registrando comandos:", error);
    }
}