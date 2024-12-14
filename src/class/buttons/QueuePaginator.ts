import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, Embed, InteractionCollector, Message, CommandInteraction, EmbedBuilder } from 'discord.js';

class QueuePaginator {
    private interaction: CommandInteraction;
    private pages: EmbedBuilder[];
    private currentPage: number;
    private message: Message | null;

    constructor(interaction: CommandInteraction, pages: EmbedBuilder[]) {
        this.interaction = interaction;
        this.pages = pages;
        this.currentPage = 0;
        this.message = null;
    }

    async start() {
        const row = this.createActionRow();

        const sentMessage = await this.interaction.reply({ embeds: [this.pages[this.currentPage]], components: [row], fetchReply: true });
        this.message = sentMessage as Message;

        const collector = this.message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', async (i) => {
            if (i.user.id !== this.interaction.user.id) {
                await i.reply({ content: 'Estos botones no son para ti!', ephemeral: true });
                return;
            }

            if (i.customId === 'prev') {
                if (this.currentPage > 0) this.currentPage--;
            } else if (i.customId === 'next') {
                if (this.currentPage < this.pages.length - 1) this.currentPage++;
            }

            await i.update({ embeds: [this.pages[this.currentPage]], components: [this.createActionRow()] });
        });

        collector.on('end', async () => {
            if (this.message) {
                const disabledRow = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('prev')
                            .setLabel('Previous')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('Next')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),
                    );
                await this.message.edit({ components: [disabledRow] });
            }
        });
    }

    private createActionRow(): ActionRowBuilder<ButtonBuilder> {
        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(this.currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(this.currentPage === this.pages.length - 1),
            );
    }
}

export { QueuePaginator };


