import { Client, EmbedBuilder } from "discord.js";
import { initDevNotifier, notifyDev } from "../../client/devNotifier.js";
import { updatePresence } from "../../client/presence.js";
import { DEvent } from "../../classes/events/DEvent.js"
import logger from "../../client/logger.js";
import { BClient } from "../../client/BClient.js";
import { registerSlashCommands } from "../../handler/command/slashCommandHandler.js";

export default class Ready extends DEvent<'clientReady'> {
    constructor() {
        super('clientReady', { once: true });
    }

    async execute(BClient: BClient, client: Client<true>): Promise<void> {
        logger.info(`Bot ${client.user.displayName} Online`);
        logger.info(`[Servidores] En ${client.guilds.cache.size} servidores (este shard): ${client.guilds.cache.map(g => g.name).join(", ")}`);

        initDevNotifier(client);
        await updatePresence(client);
        BClient.music.init(process.env.botClientID as string);

        // Se espera: los comandos se cargan acá y el aviso de abajo los cuenta
        await registerSlashCommands(BClient);

        logger.info(`Comandos Slash Registrados`);

        notifyDev(new EmbedBuilder()
            .setTitle("🟢 Bot en línea")
            .setColor("Green")
            .setDescription(`**${client.guilds.cache.size}** servidores en este shard · **${BClient.slashCommands.size}** comandos · Bun ${Bun.version}`));

    }

}