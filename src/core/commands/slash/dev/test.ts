import { config } from "@/config/config.js";
import { CustomButtonBuilder } from "@/modules/buttons/ButtonBuilder.js";
import { DisplayButtonsBuilder } from "@/modules/buttons/DisplayButtonsBuilder.js";
import { SlashCommand } from "@/structures/commands/SlashCommand.js";
import { createEmptyEmbed } from "@/utils/tools.js";
import { MessageFlags, ButtonStyle } from "discord.js";



export default new SlashCommand()
    .setName("test")
    .setDescription("testing")
    .setCategory("Dev")
    .setExecute(async (client, inter) => {
        if (!inter.guildId) return;

        if (inter.user.id !== config.dev.id) {
            return await inter.reply({
                content: "Debes ser el Developer del bot para utilizar esta sección de comandos.",
                flags: MessageFlags.Ephemeral
            });
        }

        const view = new DisplayButtonsBuilder(client, inter.guildId)

        view.addButtons(
            new CustomButtonBuilder({
                custom_id: "test",
                label: "test",
                style: ButtonStyle.Secondary
            },
                (cli, inter) => {
                    inter.reply({ embeds: [createEmptyEmbed().setDescription("Que mira bobo")] })
                }),
            new CustomButtonBuilder({
                custom_id: "test2",
                label: "test2",
                style: ButtonStyle.Secondary
            },
                (cli, inter) => {
                    inter.reply({
                        embeds: [createEmptyEmbed().setDescription("Tonto el que toca")]

                    })
                })
        )

        view.reply(inter, [createEmptyEmbed().setDescription("Botone")])
    })

