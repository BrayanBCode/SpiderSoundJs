import { REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { stringPathToSegmentedString } from "../../../utils/tools.js";
import { BClient } from "../../client/BClient.js";
import { SlashCommand } from "../../classes/SlashCommand.js";
import logger from "../../client/logger.js";


export async function registerSlashCommands(client: BClient) {
    const stringPath = join(process.cwd(), ...stringPathToSegmentedString("dist/commands/slash"))
    const commandsFolders = readdirSync(stringPath, { withFileTypes: true }).filter((entry) => entry.isDirectory());

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

                // logger.debug(`[RegisterSlashCommands] || Comando ${SlashCmd.name} verificado. ||`);
            } catch (err) {
                logger.error(`[RegisterSlashCommands] Error en el comando ${SlashCmd.name}: ${err}`)
            }

        }
    }
    catch (error) {
        logger.error(`[RegisterSlashCommands] Error al registrar los comandos: ${error}`);
    }
    const rest = new REST().setToken(process.env.token as string);

    const commandsArray = Array.from(client.slashCommands.values()).map(cmd => {
        const command = cmd.toJSON()
        logger.info(`|| Slash command ${cmd.name} registrado con exito ||`)
        return command
    });

    await rest.put(
        Routes.applicationCommands(process.env.botClientID as string),
        { body: commandsArray }
    );

}