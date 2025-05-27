import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { config } from "@/config/config.js";
import { SlashCommand } from "@/structures/commands/SlashCommand.js";
import { stringPathToSegmentedString } from "@/utils/tools.js";
import { REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";


export async function registerCommands(client: BotClient) {
    const stringPath = join(process.cwd(), ...stringPathToSegmentedString(config.handlersFolders.discord.commands))
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

                client.commands.set(SlashCmd.name, SlashCmd)

                logger.debug(`[RegisterCommands] || Comando ${SlashCmd.name} verificado. ||`);
            } catch (err) {
                logger.error(`[RegisterCommands] Error en el comando ${SlashCmd.name}: ${err}`)
            }

        }
    }
    catch (error) {
        logger.error(`[RegisterCommands] Error al registrar los comandos: ${error}`);
    }
    const rest = new REST().setToken(config.bot.token);

    const commandsArray = Array.from(client.commands.values()).map(cmd => {
        const command = cmd.toJSON()
        logger.info(`|| Comando ${cmd.name} registrado con exito ||`)
        return command
    });

    await rest.put(
        client.debugMode
            ? Routes.applicationGuildCommands(config.bot.clientID, config.bot.devGuild)
            : Routes.applicationCommands(config.bot.clientID),
        { body: commandsArray }
    );

}
