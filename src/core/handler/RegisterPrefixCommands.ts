import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { config } from "@/config/config.js";
import { PrefixCommand } from "@/structures/commands/PrefixCommand.js";
import { stringPathToSegmentedString } from "@/utils/tools.js";
import { readdirSync } from "fs";
import { join } from "path";


export async function registerPrefixCommands(client: BotClient) {
    const stringPath = join(process.cwd(), ...stringPathToSegmentedString(config.handlersFolders.discord.prefixCommands))
    const commandsFolders = readdirSync(stringPath, { withFileTypes: true })
        .filter((entry) => entry.isDirectory());

    const commandsStringPath = commandsFolders.map((folder) => {
        const files = readdirSync(join(stringPath, folder.name)).filter(file => file.endsWith(".ts") || file.endsWith(".js"))

        return files.map((file) => {
            return join(stringPath, folder.name, file)
        })

    }).flat()

    logger.debug(commandsStringPath)

    try {
        for (const filePath of commandsStringPath) {
            const PrefixCmd = await import(filePath).then((mod) => mod.default) as PrefixCommand;

            try {
                const jsonCmd = PrefixCmd.toJSON()

                client.prefixCommands.set(jsonCmd.name, PrefixCmd)

                logger.debug(`|| Prefix command ${jsonCmd.name} registrado. ||`);
            } catch (err) {
                logger.error(`[RegisterPrefixCommands] Error en el comando "${PrefixCmd.name}": ${err}`)
            }

        }
    }
    catch (error) {
        logger.error(`[RegisterPrefixCommands] Error al registrar los comandos: ${error}`);
    }


}
