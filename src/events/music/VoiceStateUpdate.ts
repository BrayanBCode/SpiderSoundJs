import { Events, VoiceState } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";

export default class evento extends Event {
    constructor(client: CustomClient) {
        super(client, {
            name: Events.VoiceStateUpdate,
            description: "Evento de ejemplo",
            once: true
        });
    }

    Execute(oldState: VoiceState, newState: VoiceState) {
        console.log("Evento ejecutado");
        // Aquí puedes agregar lógica para manejar los cambios de estado
    }
}