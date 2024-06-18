import { Events, VoiceChannel } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import CustomEvent from "../../base/classes/CustomEvent";
import { Player, Poru, Track } from "poru";

export default class TrackStart extends CustomEvent {
    constructor(client: CustomClient) {
        super(client, {
            name: "trackStart",
            description: "Evento que se ejecuta al iniciar una canción",
            once: true
        });
    }

    Execute(player: Player, track: Track): void {
        const channel = this.client.channels.cache.get(player.textChannel) as VoiceChannel;
        channel.send(`Reproduciendo: ${track.info.title}`);
    }
}