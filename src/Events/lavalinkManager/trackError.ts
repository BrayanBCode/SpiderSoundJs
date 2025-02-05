import { Player, Track, UnresolvedTrack, TrackExceptionEvent } from "lavalink-client/dist/types";
import { BotClient } from "../../class/BotClient.js";
import { BaseLavalinkManagerEvents } from "../../class/events/BaseLavalinkManagerEvents.js";

export default class trackError extends BaseLavalinkManagerEvents<"trackError"> {
    name: "trackError" = "trackError";
    execute(client: BotClient, player: Player, track: Track | UnresolvedTrack | null, payload: TrackExceptionEvent): void {

    }

}