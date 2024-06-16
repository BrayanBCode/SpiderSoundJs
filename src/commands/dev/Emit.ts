import { ApplicationCommandOptionType, CacheType, ChatInputCommandInteraction, EmbedBuilder, Events, Guild, PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class Emit extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: 'emit',
            description: 'Emite un evento',
            category: Category.Developer,
            dev: true,
            default_member_permissions: PermissionsBitField.Flags.Administrator,
            dm_permissions: false,
            cooldown: 1,
            options: [
                {
                    name: 'event',
                    description: 'Evento a emitir',
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        { name: 'GuildCreate', value: Events.GuildCreate },
                        { name: 'GuildDelete', value: Events.GuildDelete },
                    ]
                }
            ]
        });
    }

    Execute(interaction: ChatInputCommandInteraction<CacheType>): void {
        const event = interaction.options.getString('event');

        if (event == Events.GuildCreate || event == Events.GuildDelete) {
            this.client.emit(event, interaction.guild as Guild);
        }

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Green')
                    .setDescription(`Evento \`${event}\` emitido correctamente`)
            ], ephemeral: true
        })
    }
}