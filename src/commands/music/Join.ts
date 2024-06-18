import { CacheType, ChatInputCommandInteraction, EmbedBuilder, GuildMember, PermissionsBitField, VoiceChannel } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import { Connection } from "poru";

export default class Join extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "join",
            description: "Entra al canal de voz del usuario",
            category: Category.Music,
            dev: true,
            default_member_permissions: PermissionsBitField.Flags.Connect,
            dm_permissions: false,
            cooldown: 3,
            deprecated: true,
            options: []
        });
    }

    Execute(interaction: ChatInputCommandInteraction<CacheType>): void {
        
    }
    
}