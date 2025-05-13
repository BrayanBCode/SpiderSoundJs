import { ManagerOptions } from "lavalink-client/dist/types";
import { LavalinkManager } from "lavalink-client";
import { PlayingMessageController } from "./PlayingMessageController.js";

export class LavaManagerCustom extends LavalinkManager {

    private _playingMessageController: PlayingMessageController


    constructor(options: ManagerOptions) {
        super(options)
        this._playingMessageController = new PlayingMessageController()
    }


    /**
     * Utilizado en client
     */
    get playingMessages() {
        return this._playingMessageController;
    }

    /**
     * Remover cuando se deje de utilizar
     */
    get playingMessageController() {
        return this._playingMessageController;
    }

}

