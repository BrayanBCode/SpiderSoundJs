import { APIMessageComponentEmoji, ButtonStyle } from "discord.js"

export interface ICustomButtonBuilder {
    // client: BotClient
    custom_id: string
    label: string
    style?: ButtonStyle.Primary | ButtonStyle.Secondary | ButtonStyle.Success | ButtonStyle.Danger
    emoji?: APIMessageComponentEmoji
    disabled?: boolean
}