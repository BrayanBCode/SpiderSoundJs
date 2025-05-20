import { Collection, Message, MessageEditOptions, MessagePayload, TextChannel } from "discord.js";
import PlayerButtons from "./buttons/PlayerButtons.js";
import { Player } from "lavalink-client/dist/types";
import logger from "./logger.js";
import { BotClient } from "./BotClient.js";

/**
 * The `PlayingMessageController` class manages the sending, updating, and deletion of messages
 * related to a player in a Discord guild. It maintains a collection of messages indexed by guild ID.
 * @DEPRECATED This CLASS is deprecated and will be removed in a future release.
 */
export class PlayingMessageController {

    /**
     * A collection that stores messages indexed by guild ID.
     * @DEPRECATED This method is deprecated and will be removed in a future release.
     */
    MessageContainer: Collection<string, Message>;

    /**
     * Constructs a new instance of the `PlayingMessageController` class.
     * @DEPRECATED This method is deprecated and will be removed in a future release.
     */
    constructor() {

        this.MessageContainer = new Collection<string, Message>()

    }

    /**
     * Envia el mensaje relacionado con el player al servidor de discord y guarda en la coleción.
     * @DEPRECATED This method is deprecated and will be removed in a future release.
     */
    async SendMessage({ player, client, reSend = false }: { player: Player, client: BotClient, reSend?: boolean }) {
        if (!player || !client) throw new Error("[PlayingMessageController] Valores invalidos");

        let channel: TextChannel | undefined;
        let msg = this.getMessage(player.guildId)

        if (msg && reSend) channel = (await this.DeleteMessage(player.guildId, true) as Message).channel as TextChannel;

        if (!channel) {
            channel = client.channels.cache.get(player.textChannelId!) as TextChannel | undefined;
            if (!channel) {
                logger.warn("[PlayingMessageController] No se encontro un canal para emitir PlayingMessage...");
                return
            }
        }

        if (reSend || !msg) {
            logger.info("[PlayingMessageController] Enviando mensaje de reprodución")
            msg = await PlayerButtons({ player, TextChannel: channel, client })
        }

        if (!msg) throw new Error("[PlayingMessageController] Error al guardar el mensaje en MessageContainer")

        this.MessageContainer.set(player.guildId, msg)

        return msg
    }

    /**
     * Deletes a message from the collection and optionally deletes it from the Discord guild.
     * 
     * @param GuildID - The ID of the guild from which to delete the message.
     * @param DeleteMessage - A boolean indicating whether to delete the message from the guild.
     * @throws Will throw an error if the guild ID is invalid.
     * @DEPRECATED This method is deprecated and will be removed in a future release.
     */
    async DeleteMessage(GuildID: string, DeleteMessage: boolean = false) {
        if (!GuildID) throw new Error('[PlayingMessageController] Valor invalido')
        const msg = this.MessageContainer.get(GuildID)

        if (!msg) return

        if (DeleteMessage) {
            try {
                await msg.delete();
                logger.info(
                    `Mensaje de reproducción eliminado de **${(msg.channel as TextChannel).name}** en **${msg.guild?.name}**`
                );
            } catch (err: unknown) {
                if (err instanceof Error) {
                    logger.error("[PlayingMessageController]", err.message);
                } else {
                    logger.error("[PlayingMessageController] Unknown error", err);
                }
            }
        }



        this.MessageContainer.delete(GuildID)

        return msg
    }

    /**
     * Updates a message in the collection for a specific guild.
     * 
     * @param GuildID - The ID of the guild for which to update the message.
     * @param Message - The new message content or options.
     * @throws Will throw an error if the guild ID is invalid.
     * @DEPRECATED This method is deprecated and will be removed in a future release.
     */
    async UpdateMessage(GuildID: string, Message: string | MessageEditOptions | MessagePayload) {
        if (!GuildID) throw new Error('[PlayingMessageController] Valor invalido')

        this.MessageContainer.get(GuildID)?.edit(Message)

    }
    /**
     * DEPRECATED
     */
    getMessage(GuildID: string) {
        return this.MessageContainer.get(GuildID)
    }


}
