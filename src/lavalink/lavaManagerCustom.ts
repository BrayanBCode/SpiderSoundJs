import { LavalinkManager, ManagerOptions } from "lavalink-client";
import { PlayingMessageController } from "@/modules/messages/PlayingMessageController.js";

/**
 * @DEPRECATED This class is deprecated and will be removed in a future release.
 */
export class LavaManagerCustom extends LavalinkManager {
    /**
     * @DEPRECATED This variable is deprecated and will be removed in a future release.
     */
    private _playingMessageController: PlayingMessageController

    /**
     * @DEPRECATED This method is deprecated and will be removed in a future release.
     */
    constructor(options: ManagerOptions) {
        super(options)
        this._playingMessageController = new PlayingMessageController()
    }


    /**
     * Utilizado en client
     * 
     * @DEPRECATED This method is deprecated and will be removed in a future release.
     */
    get playingMessages() {
        return this._playingMessageController;
    }

    /**
     * Remover cuando se deje de utilizar
     * 
     * @DEPRECATED This getter is deprecated and will be removed in a future release.
     */
    get playingMessageController() {
        return this._playingMessageController;
    }

}

