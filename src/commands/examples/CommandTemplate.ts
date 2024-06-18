import { PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class example extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "example", // Nombre del comando
            description: "", // Descripción del comando
            category: Category.Moderation, // Categoría del comando
            dev: true, // Solo los desarrolladores pueden usar este comando
            deprecated: true, // Este comando está obsoleto en este caso es para que no se muestre en la lista de comandos
            default_member_permissions: PermissionsBitField.Flags.BanMembers, // Permisos necesarios para usar el comando
            dm_permissions: false, // No se la verdad
            cooldown: 3, // Tiempo de espera para volver a usar el comando
            options: [] // Opciones del comando
        });
    }
}