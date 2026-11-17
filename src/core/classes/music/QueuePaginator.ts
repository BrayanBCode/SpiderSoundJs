import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ComponentType, MessageFlags } from "discord.js";
import { Player } from "moonlink.js";
import { EmptyEmbed } from "../../../utils/messages.js";
import logger from "../../client/logger.js";
import { queuePage, queuePageCount } from "../../music/queueView.js";

export interface IQueuePaginatorOpt {
    interaction: ChatInputCommandInteraction<"cached"> | ButtonInteraction<"cached">;
    player: Player;
    /** Cuánto queda abierta antes de borrarse */
    timer?: number;
}

/**
 * Cola paginada, solo visible para quien la pidió (/queue o el botón 📜). Se borra sola a los 2 minutos.
 * Cada página se arma de nuevo con la cola del momento: si alguien agrega o salta canciones, se ve al cambiar de página.
 */
export class QueuePaginator {
    private interaction: IQueuePaginatorOpt["interaction"];
    private player: Player;
    private timer: number;

    constructor({ interaction, player, timer = 2 * 60 * 1000 }: IQueuePaginatorOpt) {
        this.interaction = interaction;
        this.player = player;
        this.timer = timer;
    }

    private render(page: number) {
        const { index, pages, description, footer } = queuePage({
            current: this.player.current,
            tracks: this.player.queue.tracks,
            loop: this.player.loop,
        }, page);

        const embed = EmptyEmbed()
            .setAuthor({ name: "Cola de reproducción 📜" })
            .setDescription(description)
            .setFooter({ text: footer })
            .setColor(0x1DB954);

        const first = index === 0, last = index === pages - 1;
        const button = (id: string, emoji: string, disabled: boolean) =>
            new ButtonBuilder().setCustomId(`queue_${id}`).setEmoji(emoji).setStyle(ButtonStyle.Secondary).setDisabled(disabled);

        // Discord admite 5 botones por fila: no hay botón de cerrar porque el mensaje efímero ya trae "Descartar"
        // y se borra solo al terminar el colector
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            button("first", "⏮", first),
            button("prev", "◀", first),
            new ButtonBuilder().setCustomId("queue_page").setLabel(`${index + 1}/${pages}`).setStyle(ButtonStyle.Secondary).setDisabled(true),
            button("next", "▶", last),
            button("last", "⏭", last),
        );

        return { index, embeds: [embed], components: [row] };
    }

    async reply() {
        let { index, ...view } = this.render(0);
        const response = await this.interaction.reply({ ...view, flags: MessageFlags.Ephemeral, withResponse: true });
        const message = response.resource?.message;
        if (!message) return;

        logger.debug(`[QueuePaginator] ${this.interaction.user.username} abrió la cola (${this.player.queue.size} canciones) en ${this.interaction.guild.name}`);

        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: this.timer });

        collector.on("collect", async (btn) => {
            try {
                const pages = queuePageCount({ tracks: this.player.queue.tracks, loop: this.player.loop });
                const target = { queue_first: 0, queue_prev: index - 1, queue_next: index + 1, queue_last: pages - 1 }[btn.customId] ?? index;
                ({ index, ...view } = this.render(target));
                await btn.update(view);
            } catch (error) {
                logger.error("[QueuePaginator] Error al cambiar de página", error);
            }
        });

        // Es efímero: se borra con la interacción original (un mensaje efímero no se puede borrar como uno normal)
        collector.on("end", () => {
            this.interaction.deleteReply().catch(() => undefined);
        });
    }
}
