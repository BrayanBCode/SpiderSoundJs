import { ChatInputCommandInteraction, Collection, EmbedBuilder, Events } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event"
import Command from "../../base/classes/Command";

export default class CommandHandler extends Event {
    constructor(client: CustomClient) {
        super(client, {
            name: Events.InteractionCreate,
            description: "Evento que se ejecuta cuando se crea una interacción",
            once: false
        })
    }

    Execute(interaccion: ChatInputCommandInteraction) {
        if (!interaccion.isChatInputCommand()) return;

        const command: Command = this.client.commands.get(interaccion.commandName)!;

        //@ts-ignore
        if (!command) return interaccion.reply({ content: "El comando no existe", ephemeral: true }) && this.client.commands.delete(interaccion.commandName);

        if (command.dev && !this.client.config.developerUserIDs.includes(interaccion.user.id))
            return interaccion.reply({
                embeds: [new EmbedBuilder()
                    .setColor("Red")
                    .setDescription("❌ No tienes permisos para usar este comando")
                ], ephemeral: true
            })

        const { cooldowns } = this.client;

        if (!cooldowns.has(command.name)) cooldowns.set(command.name, new Collection());

        const now = Date.now();
        const timestamps = cooldowns.get(command.name)!;
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps?.has(interaccion.user.id) && (now < (timestamps.get(interaccion.user.id) || 0) + cooldownAmount))
            return interaccion.reply({
                embeds: [new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(`❌ Por favor espera ${(((timestamps.get(interaccion.user.id) || 0) + cooldownAmount - now) / 1000).toFixed(1)} segundos antes de volver a usar el comando`)],
                ephemeral: true
            });

        timestamps.set(interaccion.user.id, now);
        setTimeout(() => timestamps.delete(interaccion.user.id), cooldownAmount);


        try {
            const subCommandGroup = interaccion.options.getSubcommandGroup(false);
            const subCommand = `${interaccion.commandName}${subCommandGroup ? `.${subCommandGroup}` : ""}.${interaccion.options.getSubcommand(false) || ""}`;

            return this.client.subCommands.get(subCommand)?.Execute(interaccion) || command.Execute(interaccion)
        } catch (err) {
            console.log(err);
        }
    }

}