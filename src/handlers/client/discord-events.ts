import { ChatInputCommandInteraction, CommandInteractionOptionResolver } from "discord.js";
import { BotClient } from "../../class/BotClient.js";
import { Command, SubCommand } from "../../class/Commands.js";

export function deployClientEvents(client: BotClient) {
    client.once("ready", () => {
        console.log(`|| ${client.user!.username} Se ejecuto con exitó ||`);
        client.lavalink!.init({
            id: client.user!.id,
            username: client.user!.username,
        });
    })

    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand() && !interaction.isAutocomplete()) return;
        const subCommand = (interaction.options as CommandInteractionOptionResolver).getSubcommand(false);
        const command = client.commands.get(interaction.commandName);
        if (!command) return console.error(`No command matching ${interaction.commandName} was found.`);
        try {
            if (interaction.isCommand()) {
                if (subCommand) {
                    if (typeof (command as SubCommand).execute[subCommand] !== "function") return console.error(`[Command-Error] Sub-Command is missing property "execute#${subCommand}".`);
                    // execute subcommand
                    return await (command as SubCommand).execute[subCommand](client, interaction as ChatInputCommandInteraction<"cached">);
                }
                // execute command
                return await (command as Command).execute(client, interaction as ChatInputCommandInteraction<"cached">);
            }
            if (interaction.isAutocomplete()) {
                if (subCommand) {
                    if (typeof (command as SubCommand).autocomplete?.[subCommand] !== "function") return console.error(`[Command-Error] Sub-Command is missing property "autocomplete#${subCommand}".`);
                    // execute subcommand-autocomplete
                    return await (command as SubCommand).autocomplete?.[subCommand](client, interaction);
                }
                if (!(command as Command).autocomplete) return console.error(`[Command-Error] Command is missing property "autocomplete".`);
                // execute command-autocomplete
                return await (command as Command).autocomplete?.(client, interaction);
            }
        } catch (error) {
            console.error(error);
            if (interaction.isAutocomplete()) return;
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    })
}

