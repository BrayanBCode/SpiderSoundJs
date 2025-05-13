import { ButtonStyle, MessageFlags, SlashCommandBuilder } from "discord.js";
import { Command } from "../../class/Commands.js";
import { config } from "../../config/config.js";
import { createEmptyEmbed } from "../../utils/tools.js";
import { DisplayButtonsBuilder } from "../../class/buttons/DisplayButtonsBuilder.js";
import { CustomButtonBuilder } from "../../class/buttons/ButtonBuilder.js";




export default new Command({
    data: {
        command: new SlashCommandBuilder()
            .setName("test")
            .setDescription("testing"),
        category: "Misc"
    },
    execute: async (client, inter) => {
        if (!inter.guildId) return;

        if (inter.user.id !== config.dev.id) {
            return await inter.reply({
                content: "Debes ser el Developer del bot para utilizar esta sección de comandos.",
                flags: MessageFlags.Ephemeral
            });
        }

        const view = new DisplayButtonsBuilder(client)

        view.addButtons(
            new CustomButtonBuilder({
                custom_id: "test",
                label: "test",
                style: ButtonStyle.Secondary
            }, (cli, inter) => { inter.reply({ embeds: [createEmptyEmbed().setDescription("Que mira bobo")] }) }),
            new CustomButtonBuilder({
                custom_id: "test2",
                label: "test2",
                style: ButtonStyle.Secondary
            }, (cli, inter) => { inter.reply({ embeds: [createEmptyEmbed().setDescription("Tonto el que toca")] }) })
        )

        view.reply(inter, [createEmptyEmbed().setDescription("Botone")])
    }

})

