const {
    EmbedBuilder,
    PermissionsBitField,
    SlashCommandBuilder,
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Pone una cancion")
        .addStringOption((option) =>
            option
                .setName("search")
                .setDescription("la Cancion")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        try {
            const search = interaction.options.getString("search");
            const { channel } = interaction.member.voice;

            if (!channel) {
                return interaction.reply({
                    content: "Necesitas estar en un canal de voz",
                    ephemeral: true,
                });
            }

            if (
                !channel
                    .permissionsFor(interaction.guild.members.me)
                    .has(PermissionsBitField.Flags.Connect)
            ) {
                return interaction.reply({
                    content: "No tengo permisos para entrar al canal",
                    ephemeral: true,
                });
            }

            await interaction.reply({
                content: "Buscanding...",
            });
            const player = await client.manager.createPlayer({
                guildId: interaction.guild.id,
                textId: interaction.channel.id,
                voiceId: channel.id,
                volume: 100,
                deaf: true,
            });

            const res = await player.search(search, {
                requester: interaction.user,
            });

            console.log(res);

            if (!res.tracks.length) {
                return interaction.editReply("No se encontro nada");
            }

            if (res.type === "PLAYLIST") {
                for (let track of res.tracks) {
                    player.queue.add(track);
                }

                if (!player.playing && !player.paused) {
                    console.log(player.queue);
                    player.play();
                }

                const embed = new EmbedBuilder()
                    .setColor("#1DB954")
                    .setTitle("🎵 Playlist Agregada")
                    .setDescription(
                        `**[${res.playlistName}](${search})** \n\n**Canciones agregadas:** \`${res.tracks.length}\` \n)}\``
                    )
                    .setFooter({ text: "Disfruta! 🎧" });

                return interaction.editReply({ content: "", embeds: [embed] });
            } else {
                player.queue.add(res.tracks[0]);
                if (!player.playing && !player.paused) {
                    console.log("--------------------------------");
                    console.log(player.queue);

                    player.play();
                    console.log({
                        playing: player.playing,
                        paused: player.paused,
                        queue: player.queue.size,
                        volume: player.volume,
                      });
                      
                }

                const emb = new EmbedBuilder()
                    .setColor("Random")
                    .setDescription(
                        `[${res.tracks[0].title}](${res.tracks[0].uri})`
                    )
                    .setFooter({ text: "Reproduciendo!" })
                    .setTimestamp();

                return interaction.editReply({
                    content: "",
                    embeds: [emb],
                });
            }
        } catch (error) {
            console.error(error);
        }
    },
};
