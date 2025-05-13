import { APIMessageComponentEmoji, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js"
import { ICustomButtonBuilder } from "../../interface/ICustomButtonBuilder"
import { BotClient } from "../BotClient";
import { collectorType } from "../../types/collectorTypes";
import { interactionButtonType } from "../../types/interactionCommandType";


export class CustomButtonBuilder extends ButtonBuilder {
    // client: BotClient
    custom_id: string;
    label: string;
    style?: ButtonStyle.Primary | ButtonStyle.Secondary | ButtonStyle.Success | ButtonStyle.Danger;
    emoji?: APIMessageComponentEmoji;
    disabled?: boolean;
    type: ComponentType.Button;
    execute: (client: BotClient, inter: interactionButtonType, col: collectorType, button: CustomButtonBuilder) => void;

    constructor({ custom_id, label, style, emoji, disabled }: ICustomButtonBuilder, execute: (client: BotClient, inter: interactionButtonType, col: collectorType, button: CustomButtonBuilder) => void) {

        super({ custom_id, label, style, emoji, disabled });

        this.custom_id = custom_id;
        this.label = label;
        this.style = style ?? ButtonStyle.Secondary;
        this.emoji = emoji;
        this.disabled = disabled;
        this.type = ComponentType.Button;
        this.execute = execute;
    }

}
