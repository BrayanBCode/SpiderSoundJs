import { InteractionReplyOptions, Message } from "discord.js"
import { BotClient } from "@/bot/BotClient.js";
import { interactionCommandType } from "@/types/types/interactionCommandType.js";
import { replyEmbed } from "@/utils/tools.js";

type ManagedMessageData = {
    message?: Message;
    isDeleted: boolean;
    timestamp?: Date;

};





/**
 * Clase para manejar mensajes en Discord.
 * Permite enviar mensajes, responder a interacciones y seguir interacciones.
 */
class MessageManager {
    private messageContainer: Map<string, ManagedMessageData> = new Map();

    constructor(private client: BotClient) { }

    private addMessage(message: Message): void {
        this.messageContainer.set(message.id, {
            message,
            isDeleted: false,
            timestamp: new Date()
        });
    }

    public delete(messageId: string): void {
        this.messageContainer.delete(messageId);
    }

    public getMessageData(messageId: string): ManagedMessageData | undefined {
        return this.messageContainer.get(messageId);
    }

    public async send(channelId: string, content: string): Promise<Message> {
        const channel = this.client.getTextChannel(channelId);
        if (!channel?.isTextBased()) throw new Error(`Channel with ID ${channelId} not found or is not a text channel.`);

        const message = await channel.send(content);
        this.addMessage(message);
        return message;
    }

    public async reply(interaction: interactionCommandType, options: InteractionReplyOptions): Promise<Message | undefined> {
        if (!interaction.isRepliable()) throw new Error("Interaction is not repliable.");

        try {
            const reply = await replyEmbed({ interaction, options });
            if (reply instanceof Message) {
                this.addMessage(reply);
                return reply;
            }
        } catch (error) {
            console.error("Error replying to interaction:", error);
        }
        return undefined;
    }



    public async followUp(interaction: interactionCommandType, options: InteractionReplyOptions): Promise<Message | undefined> {
        if (!interaction.isRepliable()) throw new Error("Interaction is not repliable.");

        try {
            const followUp = await interaction.followUp({ ...options, fetchReply: true });
            if (followUp instanceof Message) {
                this.addMessage(followUp);
                return followUp;
            }
        } catch (error) {
            console.error("Error following up interaction:", error);
        }
        return undefined;
    }

    public markAsDeleted(messageId: string): void {
        const entry = this.messageContainer.get(messageId);
        if (entry) {
            entry.message = undefined; // Clear the message reference
            entry.isDeleted = true;
        }
    }
}


