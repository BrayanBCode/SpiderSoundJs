import { Player } from "moonlink.js";
import { BClient } from "../../client/BClient.js";
import { MEvent } from "../../classes/events/MEvent.js";
import logger from "../../client/logger.js";
import { clearInactivityTimer } from "../Bot/voiceStateUpdate.js";

export default class PDestroy extends MEvent<"playerDestroy"> {
    constructor() {
        super("playerDestroy");
    }
    async execute(client: BClient, player: Player, reason?: string): Promise<void> {
        logger.info(`[PlayerDestroy] Player destruido en ${client.getGuild(player.guildId)?.name ?? player.guildId} (motivo: ${reason ?? "sin especificar"})`);

        // Sin player, el mensaje con botones, sus datos y el timer de inactividad ya no sirven
        clearInactivityTimer(player.guildId, "player destruido");
        await client.playerMessage.remove(player.guildId);
    }

}