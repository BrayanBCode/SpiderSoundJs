import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { config } from "@/config/config.js";
import { SlashCommand } from "@/structures/commands/SlashCommand.js";
import { stringPathToSegmentedString } from "@/utils/tools.js";
import { REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";


export async function registerCommands(client: BotClient) {
    const stringPath = join(process.cwd(), ...stringPathToSegmentedString(config.handlersFolders.discord.slashCommands))
    const commandsFolders = readdirSync(stringPath, { withFileTypes: true })
        .filter((entry) => entry.isDirectory());

    const commandsStringPath = commandsFolders.map((folder) => {
        const files = readdirSync(join(stringPath, folder.name)).filter(file => file.endsWith(".ts") || file.endsWith(".js"))

        return files.map((file) => {
            return join(stringPath, folder.name, file)
        })

    }).flat()

    try {
        for (const filePath of commandsStringPath) {
            const SlashCmd = await import(filePath).then((mod) => mod.default) as SlashCommand;

            try {
                SlashCmd.toJSON()

                client.slashCommands.set(SlashCmd.name, SlashCmd)

                logger.debug(`[RegisterSlashCommands] || Comando ${SlashCmd.name} verificado. ||`);
            } catch (err) {
                logger.error(`[RegisterSlashCommands] Error en el comando ${SlashCmd.name}: ${err}`)
            }

        }
    }
    catch (error) {
        logger.error(`[RegisterSlashCommands] Error al registrar los comandos: ${error}`);
    }
    const rest = new REST().setToken(config.bot.token);

    const commandsArray = Array.from(client.slashCommands.values()).map(cmd => {
        const command = cmd.toJSON()
        logger.info(`|| Slash command ${cmd.name} registrado con exito ||`)
        return command
    });

    await rest.put(
        config.bot.debugMode
            ? Routes.applicationGuildCommands(config.bot.clientID, config.bot.devGuild)
            : Routes.applicationCommands(config.bot.clientID),
        { body: commandsArray }
    );

}
