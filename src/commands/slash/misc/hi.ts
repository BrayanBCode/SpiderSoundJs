import { SlashCommand } from "../../../core/classes/SlashCommand.js";
import { EmptyEmbed } from "../../../utils/messages.js";

export default new SlashCommand()
    .setName("hi")
    .setDescription("dice hola!")
    .setExecute(async (client, inter) => {
        return inter.reply({ embeds: [EmptyEmbed().setDescription("¡Hola! 👋")] });
    })