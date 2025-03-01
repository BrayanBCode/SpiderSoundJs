import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../class/Commands.js";

export default new Command({
    data: {
        command: new SlashCommandBuilder()
            .setName("remove")
            .setDescription("Cosas"),

        category: "Music"
    },
    execute: async (client, interaction) => {
        if (!interaction.guildId) return

        return await interaction.reply({ embeds: [new EmbedBuilder().setDescription("Sin implementar")] })

    },

    autocomplete: async (client, interaction) => {
        if (!interaction.guildId) return



        const player = client.lavaManager.getPlayer(interaction.guildId);

        if (!player || player.queue.tracks.length === 0) {
            return interaction.respond([{ name: 'No hay canciones en la cola', value: 'no_tracks' }]);
        }
    }
})