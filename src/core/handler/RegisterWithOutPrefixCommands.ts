import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { config } from "@/config/config.js";
import { WithOutPrefix } from "@/structures/commands/WithOutPrefix.js";
import { stringPathToSegmentedString } from "@/utils/tools.js";
import { readdirSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";


export async function registerWithOutPrefixCommands(client: BotClient) {
    const stringPath = join(process.cwd(), ...stringPathToSegmentedString(config.handlersFolders.discord.withOutPrefixCommands))
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
            const fileURL = pathToFileURL(filePath).href;
            const withOutPrefix = await import(fileURL).then((mod) => mod.default) as WithOutPrefix;

            try {
                const jsonCmd = withOutPrefix.toJSON()

                client.withOutPrefixCommands.set(jsonCmd.name, withOutPrefix)

                logger.debug(`|| WithOutPrefix command ${jsonCmd.name} registrado. ||`);
            } catch (err) {
                logger.error(`[RegisterWithOutPrefixCommands] Error en el comando "${withOutPrefix.name}": ${err}`)
            }

        }
    }
    catch (error) {
        logger.error(`[RegisterPrefixCommands] Error al registrar los comandos: ${error}`);
    }


}
