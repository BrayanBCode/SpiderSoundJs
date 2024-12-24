import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { BotClient } from '../../class/BotClient.js';
import { Command } from '../../class/Commands.js';

export default new Command(
    {
        data: new SlashCommandBuilder()
            .setName("ping")
            .setDescription("Responde Pong!"),
        execute: (client, interaction) => {
            interaction.reply("Pong! " + client.user?.username)
        }
    }
)
