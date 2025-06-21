import { BotClient } from "@/bot/BotClient.js";
import { PrefixCommandContext } from "@/structures/commands/PrefixCommandContext.js";

// export type PrefixCommandExecute = (client: BotClient, message: OmitPartialGroupDMChannel<Message<boolean>>, ...args: string[]) => any
export type PrefixCommandExecute = (client: BotClient, ctx: PrefixCommandContext, args: string[]) => any
