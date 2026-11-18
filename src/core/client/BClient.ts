import { AutocompleteInteraction, CacheType, ChatInputCommandInteraction, Client, GatewayIntentBits, VoiceChannel } from "discord.js";
import { Manager } from "moonlink.js";
import logger from "./logger.js";
import { loadDiscordEvents } from "../handler/Events/discordEventHandler.js";
import { loadMoonlinkEvents } from "../handler/Events/moonlinkEventHandler.js";
import { SlashCommand } from "../classes/SlashCommand.js";
import { PlayerMessage } from "../buttons/playerMessage.js";
import { BotDatabase } from "../db/database.js";

/** Volumen con el que arranca el reproductor si el servidor no eligió otro con /volume predeterminado */
export const DEFAULT_VOLUME = 5;

export class BClient extends Client {
    music: Manager;
    playerMessage: PlayerMessage;
    /** Favoritos y playlists por usuario (data/bot.db) */
    db = new BotDatabase();

    slashCommands = new Map<string, SlashCommand>();

    constructor() {
        super({
            // Solo lo que el bot usa: servidores y canales (Guilds) y quién está en cada canal de voz (GuildVoiceStates).
            // Los comandos y botones llegan como interacciones, que no necesitan intents. Ninguno es privilegiado,
            // así que no hay que activar nada en el Developer Portal.
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildVoiceStates,
            ],
        })

        this.playerMessage = new PlayerMessage(this);


        try {
            this.music = this.createLavalinkConnection();
            this.on("raw", (packet) => this.music.packetUpdate(packet));
            this.playerMessage.watch(this.music);

        } catch (error) {
            logger.error('Lavalink connection failed', error as Error);
            throw new Error(`Lavalink connection failed: ${(error as Error).message}`);
        }

    }

    getChannel(id: string) {
        return this.channels.cache.get(id);
    }

    getTextChannel(id: string) {
        const channel = this.channels.cache.get(id);
        if (channel?.isTextBased()) return channel;
        return null;
    }

    getVoiceChannel(channelID: string) {
        return this.channels.cache.get(channelID) as VoiceChannel | undefined
    }

    getGuild(id: string) {
        return this.guilds.cache.get(id);
    }


    getPlayerOrDefault(inter: ChatInputCommandInteraction<"cached"> | AutocompleteInteraction<CacheType>, guildId: string) {
        let player = this.music.players.get(guildId) ?? this.music.players.create({
            guildId,
            textChannelId: inter.channelId ?? undefined,
            voiceChannelId: (inter.member as any).voice.channelId,
            volume: this.db.getGuildVolume(guildId) ?? DEFAULT_VOLUME,
        });

        return player;
    }

    getPlayer(guildId: string) {
        return this.music.players.get(guildId);
    }

    public async init() {
        await loadDiscordEvents(this);
        await loadMoonlinkEvents(this);

        this.login(process.env.token).catch(err => {
            logger.error('Error logging in:', err);
            process.exit(1);
        });

    }

    private createLavalinkConnection() {
        // Defaults = el servicio "lavalink" de docker-compose; fuera de Docker se usa lo del .env
        const password = process.env.lavalinkPassword;
        if (!password) throw new Error("Falta lavalinkPassword en el .env (tiene que ser igual a server.password de application.yml)");

        const node = {
            identifier: "SpiderSound",
            host: process.env.lavalinkHost ?? "lavalink",
            password,
            port: Number(process.env.lavalinkPort ?? 2333),
            secure: process.env.lavalinkSecure === "true",
        };
        logger.info(`[Lavalink] Nodo ${node.identifier} -> ${node.secure ? "wss" : "ws"}://${node.host}:${node.port}`);

        return new Manager({
            nodes: [node],
            send: (guildID: string, payload: any) => {
                const guild = this.guilds.cache.get(guildID);
                if (guild) guild.shard.send(payload);
            },
        })
    }

}



