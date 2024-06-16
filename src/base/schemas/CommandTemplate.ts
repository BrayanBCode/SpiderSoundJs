import { PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class example extends Command {
    constructor(client: CustomClient){
        super(client, {
            name: "",
            description: "",
            category: Category.Moderation,
            dev: true,
            default_member_permissions: PermissionsBitField.Flags.BanMembers,
            dm_permissions: false,
            cooldown: 3,
            options: []
        })
    }
}