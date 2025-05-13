import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, MessageFlags } from "discord.js";
import logger from "../src/class/logger.js";
import { formatMS_HHMMSS } from "../src/utils/formatMS_HHMMSS.js";
import { IQueuePaginator } from "../src/interface/QueuePaginator.js";

export default async ({ interaction, items, pageSize = 10, time = 60 * 1000 }: IQueuePaginator) => {
    try {
        if (!interaction || !items || items.length <= 0) throw new Error("[Paginator]: Invalid parameters");

        logger.debug("Paginator: ", interaction.deferred);

        await interaction.deferReply();

        logger.debug("Paginator: (deferReply())", interaction.deferred);

        const pages: EmbedBuilder[] = [];
        let currentPage: EmbedBuilder | null = null;
        let currentDescription = "";

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemDescription = `**${i + 1}.** ${item.info.title} - \`${item.info.author}\` \`${formatMS_HHMMSS(item.info.duration!)}\`\n`;

            if (currentDescription.length + itemDescription.length > 4096 || (i % pageSize === 0 && i !== 0)) {
                if (currentPage) {
                    currentPage.setDescription(currentDescription);
                    pages.push(currentPage);
                }
                currentPage = new EmbedBuilder()
                    .setTitle("Cola de Reproducción")
                    .setColor("Blue");
                currentDescription = "";
            }

            currentDescription += itemDescription;
        }

        if (currentPage) {
            currentPage.setDescription(currentDescription);
            pages.push(currentPage);
        }

        if (pages.length === 1) return await interaction.editReply({ embeds: pages, components: [] });

        let index = 0;

        const first = new ButtonBuilder()
            .setCustomId("pagefirst")
            .setEmoji("⏪")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);

        const prev = new ButtonBuilder()
            .setCustomId("pageprev")
            .setEmoji("◀️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);

        const pageCount = new ButtonBuilder()
            .setCustomId("pagecount")
            .setStyle(ButtonStyle.Secondary)
            .setLabel(`${index + 1}/${pages.length}`)
            .setDisabled(true);

        const next = new ButtonBuilder()
            .setCustomId("pagenext")
            .setEmoji("▶️")
            .setStyle(ButtonStyle.Primary);

        const last = new ButtonBuilder()
            .setCustomId("pagelast")
            .setEmoji("⏩")
            .setStyle(ButtonStyle.Primary);

        const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(first, prev, pageCount, next, last);

        const msg = await interaction.editReply({ embeds: [pages[index]], components: [buttons] });

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time
        });

        collector.on("collect", async (i) => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: "Este /queue no es para ti", flags: MessageFlags.Ephemeral });

            i.deferred ? i.deferReply() : "";

            if (i.customId === "pagefirst") {
                index = 0;
            }

            if (i.customId === "pageprev") {
                if (index > 0) index--;
            }

            if (i.customId === "pagenext") {
                if (index < pages.length - 1) index++;
            }

            if (i.customId === "pagelast") { index = pages.length - 1; }


            pageCount.setLabel(`${index + 1}/${pages.length}`);

            if (index === 0) {
                first.setDisabled(true);
                prev.setDisabled(true);
            } else {
                first.setDisabled(false);
                prev.setDisabled(false);
            }

            if (index === pages.length - 1) {
                next.setDisabled(true);
                last.setDisabled(true);
            } else {
                next.setDisabled(false);
                last.setDisabled(false);
            }

            await i.editReply({ embeds: [pages[index]], components: [buttons] }).catch(err => logger.error("Paginator:", err));

            collector.resetTimer();
        });

        collector.on("end", async () => {
            await msg.delete().catch(err => logger.error("Paginator:", err));
        });

        return msg;

    } catch (error) {
        logger.error("Paginator:", error);
    }
};