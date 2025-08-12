import { registerDiscordEvents } from "@/core/handler/RegisterDiscordEvent.js";
import { Client, ChatInputCommandInteraction, AutocompleteInteraction, CacheType, GuildMember, Guild, TextChannel, VoiceChannel } from "discord.js";
import { PlayerMessage } from "@/modules/messages/playerMessage.js";
import { config } from "@/config/config.js";
import { SlashCommand } from "@/structures/commands/SlashCommand.js";
import { PrefixCommand } from "@/structures/commands/PrefixCommand.js";
import { BotClientOptions } from "@/types/interface/IClient.js";
import { WithOutPrefix } from "@/structures/commands/WithOutPrefix.js";
import { Manager } from "moonlink.js";



export class BotClient extends Client {
    manager!: Manager;
    slashCommands: Map<string, SlashCommand>;
    prefixCommands: Map<string, PrefixCommand>;
    withOutPrefixCommands: Map<string, WithOutPrefix>;
    defaultVolume: number;
    playerMessage: PlayerMessage;

    constructor(options: BotClientOptions) {
        const intents = options.intents;
        super({ intents });

        this.slashCommands = options.slashCommands ?? new Map();
        this.prefixCommands = options.prefixCommands ?? new Map();
        this.withOutPrefixCommands = options.withOutPrefixCommands ?? new Map();
        this.defaultVolume = options.defaultVolume ?? 10.0;

        this.playerMessage = new PlayerMessage(this)
    }

    getPlayer(guildId: string) {
        return this.manager.getPlayer(guildId)
    }

    getPlayerOrDefault(inter: ChatInputCommandInteraction<"cached"> | AutocompleteInteraction<CacheType>, guildId: string) {
        let player = this.manager.getPlayer(guildId)

        player ??= this.manager.createPlayer({
            guildId: guildId,
            voiceChannelId: (inter.member as GuildMember).voice.channelId!,
            textChannelId: inter.channelId,
            volume: this.defaultVolume,
        })

        return player
    }

    getGuild(guildId: string) {
        return this.guilds.cache.get(guildId) as Guild | undefined
    }

    getTextChannel(channelID: string) {
        return this.channels.cache.get(channelID) as TextChannel | undefined;
    }

    getVoiceChannel(channelID: string) {
        return this.channels.cache.get(channelID) as VoiceChannel | undefined
    }

    async init() {
        await registerDiscordEvents(this)
        this.login(config.bot.token)
    }

}
