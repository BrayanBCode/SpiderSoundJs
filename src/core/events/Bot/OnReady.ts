import { Client, EmbedBuilder } from "discord.js";
import { initDevNotifier, notifyDev } from "../../client/devNotifier.js";
import { DEvent } from "../../classes/events/DEvent.js"
import logger from "../../client/logger.js";
import { BClient } from "../../client/BClient.js";
import { registerSlashCommands } from "../../handler/command/slashCommandHandler.js";

export default class Ready extends DEvent<'clientReady'> {
    constructor() {
        super('clientReady', { once: true });
    }

    execute(BClient: BClient, client: Client<true>): Promise<void> | void {
        logger.info(`Bot ${client.user.displayName} Online`);
        logger.info(`[Servidores] En ${client.guilds.cache.size} servidores (este shard): ${client.guilds.cache.map(g => g.name).join(", ")}`);

        BClient.music.init(process.env.botClientID as string);

        registerSlashCommands(BClient);

        logger.info(`Comandos Slash Registrados`);

        initDevNotifier(client);
        notifyDev(new EmbedBuilder()
            .setTitle("🟢 Bot en línea")
            .setColor("Green")
            .setDescription(`**${client.guilds.cache.size}** servidores en este shard · **${BClient.slashCommands.size}** comandos · Bun ${Bun.version}`));

    }

}