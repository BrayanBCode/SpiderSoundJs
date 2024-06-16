import { Schema, model } from "mongoose";

interface IGuildConfig {
    guildID: string;
    logs: {
        moderation: {
            enabled: boolean;
            channelID: string;
        }
    }
}

export default model<IGuildConfig>("GuildConfig", new Schema<IGuildConfig>({
    guildID: String,
    logs: {
        moderation: {
            enabled: Boolean,
            channelID: String,
        }
    }
}, {
    timestamps: true
}))