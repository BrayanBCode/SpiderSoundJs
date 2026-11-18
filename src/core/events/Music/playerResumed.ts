import { Player } from "moonlink.js";
import { BClient } from "../../client/BClient.js";
import { MEvent } from "../../classes/events/MEvent.js";
import logger from "../../client/logger.js";

/** El bot se reinició y Lavalink reanudó la sesión: la música siguió, pero el mensaje "Escuchando" quedó sin control */
export default class PResumed extends MEvent<"playerResumed"> {
    constructor() {
        super("playerResumed");
    }
    async execute(client: BClient, player: Player) {
        const guildName = client.getGuild(player.guildId)?.name ?? player.guildId;
        logger.info(`[Resume] Reproductor reanudado en ${guildName}: "${player.current?.title ?? "sin canción"}" (cola: ${player.queue.size})`);

        if (!player.current || !player.textChannelId) return;
        await client.playerMessage.adopt(player.guildId, player.textChannelId)
            .catch(err => logger.error(`[Resume] No se pudo rearmar el mensaje "Escuchando" en ${guildName}`, err));
    }
}
