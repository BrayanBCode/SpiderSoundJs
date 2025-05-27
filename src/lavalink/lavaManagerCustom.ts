import { LavalinkManager, ManagerOptions } from "lavalink-client";

export class LavaManagerCustom extends LavalinkManager {

    /**
     * Custom Lavalink Manager class that extends the LavalinkManager from lavalink-client.
     * This class can be used to add custom functionality or override existing methods.
     * 
     * @param {ManagerOptions} options - The options for the Lavalink manager.
     */
    constructor(options: ManagerOptions) {
        super(options)
    }

}

