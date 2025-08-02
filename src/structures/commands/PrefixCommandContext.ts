import { BotClient } from "@/bot/BotClient.js";
import { config } from "@/config/config.js";
import { OmitPartialGroupDMChannel, Message, TextChannel, EmbedBuilder, ActionRowData, APIMessageTopLevelComponent, JSONEncodable, MessageActionRowComponentBuilder, MessageActionRowComponentData, TopLevelComponentData } from "discord.js";


export class PrefixCommandContext {
    private _client: BotClient;
    private _message: OmitPartialGroupDMChannel<Message<boolean>>;
    private _textChannel: TextChannel;
    private _cmdName: string;
    private _cmdType: "prefix" | "withOutPrefix";

    constructor(client: BotClient, message: OmitPartialGroupDMChannel<Message<boolean>>) {
        this._client = client;
        this._message = message;
        this._textChannel = message.channel as TextChannel;
        this._cmdName = message.content
            .replace(config.bot.prefix, "")
            .trim()
            .split(/ +/)[0]
            .toLowerCase();

        this._cmdType = message.content.startsWith(config.bot.prefix) ? "prefix" : "withOutPrefix";
        if (!this._cmdName) {
            throw new Error("[PrefixCommandContext] No command name found in message");
        }

    }

    public get client(): BotClient {
        return this._client;
    }
    public get message(): OmitPartialGroupDMChannel<Message<boolean>> {
        return this._message;
    }
    public get textChannel(): TextChannel {
        return this._textChannel;
    }
    public get cmdName(): string {
        return this._cmdName;
    }
    public get cmdType(): "prefix" | "withOutPrefix" {
        return this._cmdType;
    }


    public reply(content: string | replyOptions, repliedUser?: boolean): Promise<Message<boolean>> {
        if (typeof content === "string") {
            return this._message.reply({
                content,
                allowedMentions: { repliedUser },
            });
        } else {
            return this._message.reply({
                content: content.content,
                embeds: content.embeds,
                components: content.components,
                allowedMentions: { repliedUser },
            });
        }

    }

    public send(content: sendOptions) {

        const { channelId, content: msgContent, embeds, components, repliedUser } = content;

        const channel = this._client.channels.cache.get(channelId) as TextChannel;

        if (!channel) {
            throw new Error(`[PrefixCommandContext] Channel with ID ${channelId} not found`);
        }

        return channel.send({
            content: msgContent,
            embeds: embeds,
            components: components,
            allowedMentions: { repliedUser },
        });

    }

}

interface replyOptions {
    content?: string;
    embeds?: EmbedBuilder[];
    components?: readonly (
        | JSONEncodable<APIMessageTopLevelComponent>
        | TopLevelComponentData
        | ActionRowData<MessageActionRowComponentData | MessageActionRowComponentBuilder>
        | APIMessageTopLevelComponent
    )[];
}

interface sendOptions extends replyOptions {
    channelId: string;
    repliedUser?: boolean;
}