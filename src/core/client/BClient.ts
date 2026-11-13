import { AutocompleteInteraction, CacheType, ChatInputCommandInteraction, Client, GatewayIntentBits, Partials, VoiceChannel } from "discord.js";
import { Manager } from "moonlink.js";
import logger from "./logger.js";
import { loadDiscordEvents } from "../handler/Events/discordEventHandler.js";
import { loadMoonlinkEvents } from "../handler/Events/moonlinkEventHandler.js";
import { SlashCommand } from "../classes/SlashCommand.js";
import { PlayerMessage } from "../buttons/playerMessage.js";

export class BClient extends Client {
    music: Manager;
    playerMessage: PlayerMessage;

    slashCommands = new Map<string, SlashCommand>();

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildInvites,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildModeration,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildExpressions,
                GatewayIntentBits.GuildMessageReactions
            ],
            partials: [
                Partials.Channel,
                Partials.Reaction,
                Partials.Message,
                Partials.GuildMember
            ]
        })

        this.playerMessage = new PlayerMessage(this);


        try {
            this.music = this.createLavalinkConnection();
            this.on("raw", (packet) => this.music.packetUpdate(packet));

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
            volume: 20,
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
        const node = {
            identifier: "SpiderSound",
            host: process.env.lavalinkHost ?? "lavalink",
            password: process.env.lavalinkPassword ?? "password",
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



