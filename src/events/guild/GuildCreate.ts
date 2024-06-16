import { EmbedBuilder, Events, Guild } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class GuildCreate extends Event {
    constructor(client: CustomClient) {
        super(client, {
            name: Events.GuildCreate,
            description: "Evento que se ejecuta cuando el bot entra a un servidor",
            once: false
        });
    }

    async Execute(guild: Guild) {
        try {
            if (!await GuildConfig.exists({ guildID: guild.id }))
                await GuildConfig.create({ guildID: guild.id });
            console.log(`El bot ha sido añadido al servidor ${guild.name} (${guild.id})`);
        } catch (error) {
            console.log(error)
        }

        const owner = await guild.fetchOwner();
        owner?.send({
            embeds: [new EmbedBuilder()
                .setColor("Green")
                .setDescription(`Hola! Soy ${this.client.user?.username}, gracias por invitarme a tu servidor! Para ver una lista de mis comandos usa \`/help\``)
            ]
        }).catch();
    }
}