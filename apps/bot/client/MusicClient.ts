import { AutocompleteInteraction, ChatInputCommandInteraction, Client, Collection, GatewayIntentBits, Partials, type CacheType } from "discord.js";
import { Manager as MoonLink } from "moonlink.js";
import logger from "@/utils/logger";
import type { SlashCommand } from "@/src/Base/discord/SlashCommand";
import { eventHandler } from "@/src/handler/EventHandler";
import { commandHandler } from "@/src/handler/CommandHandler";
import { moonLinkEventHandler } from "@/src/handler/MoonLinkEventHandler";


export default class MusicClient extends Client {

    commandCol: Collection<string, SlashCommand> = new Collection();
    music!: MoonLink;


    constructor() {
        super({
            intents: [
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.Guilds,
            ],
            partials: [
                Partials.Channel,
                Partials.Reaction,
                Partials.Message,
                Partials.GuildMember
            ]
        });
    }

    async init() {
        await eventHandler(this);
        await commandHandler(this);
        await this.login(process.env.TOKEN);
    }

    async createServerConnection(attempts: number = 0): Promise<MoonLink> {
        let connection: MoonLink;
        if (attempts === 3) throw new Error("Failed to connect to NodeLink server after 3 attempts");

        try {
            connection = new MoonLink({
                nodes: [{
                    host: "0.0.0.0",
                    port: 3000,
                    password: `youshallnotpass`,
                    secure: false
                }],

                options: {
                    defaultPlayer: { autoLeave: true, historySize: 10, selfDeaf: true, volume: 50, loop: "off" },
                    database: {
                        type: "local",
                    },

                },
                send: (guildId, payload) => {
                    const guild = this.guilds.cache.get(guildId);
                    if (guild) guild.shard.send(payload);
                },

            })

            await connection.init(process.env.CLIENT_ID!);

            this.on("raw", (packet) => connection.packetUpdate(packet));

            logger.info("Connection to NodeLink server established");

        } catch (error) {
            setTimeout(() => {
                logger.warn(`Failed to connect to NodeLink server, retrying... (${attempts + 1}/3)`);
            }, 5000);
            return await this.createServerConnection(attempts + 1);
        }

        return connection;
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

}