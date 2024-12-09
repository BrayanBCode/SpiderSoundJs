const { Client, GatewayIntentBits } = require("discord.js");
const { Guilds, GuildVoiceStates, GuildMessages, MessageContent } =
    GatewayIntentBits;
const { Connectors } = require("shoukaku");
const { Kazagumo, KazagumoTrack, Plugins } = require("kazagumo");
const Spotify = require("kazagumo-spotify");

const Nodes = [
    {
        name: "lavalink",
        url: "localhost:2333",
        auth: "password",
        secure: false,
    },
];
const client = new Client({
    intents: [Guilds, GuildVoiceStates, GuildMessages, MessageContent],
});
const kazagumo = new Kazagumo(
    {
        plugins: [
            new Spotify({
                clientId: "3fef53a7e8224487b126a59c23938e4e",
                clientSecret: "18981d7890de4e9eaf391b4954cbb734",
            }), new Plugins.PlayerMoved(client),
        ],
        defaultSearchEngine: "youtube",
        // MAKE SURE YOU HAVE THIS
        send: (guildId, payload) => {
            const guild = client.guilds.cache.get(guildId);
            if (guild) guild.shard.send(payload);
        },
    },
    new Connectors.DiscordJS(client),
    Nodes
);

client.on("ready", () => console.log(client.user.tag + " Ready!"));

kazagumo.shoukaku.on("ready", (name) =>
    console.log(`Lavalink ${name}: Ready!`)
);
kazagumo.shoukaku.on("error", (name, error) =>
    console.error(`Lavalink ${name}: Error Caught,`, error)
);
kazagumo.shoukaku.on("close", (name, code, reason) =>
    console.warn(
        `Lavalink ${name}: Closed, Code ${code}, Reason ${
            reason || "No reason"
        }`
    )
);
kazagumo.shoukaku.on("debug", (name, info) =>
    console.debug(`Lavalink ${name}: Debug,`, info)
);
kazagumo.shoukaku.on("disconnect", (name, count) => {
    const players = [...kazagumo.shoukaku.players.values()].filter(
        (p) => p.node.name === name
    );
    players.map((player) => {
        kazagumo.destroyPlayer(player.guildId);
        player.destroy();
    });
    console.warn(`Lavalink ${name}: Disconnected`);
});

kazagumo.on("playerStart", (player, track) => {
    client.channels.cache
        .get(player.textId)
        ?.send({
            content: `Now playing **${track.title}** by **${track.author}**`,
        })
        .then((x) => player.data.set("message", x));
});

kazagumo.on("playerEnd", (player) => {
    player.data.get("message")?.edit({ content: `Finished playing` });
});

kazagumo.on("playerEmpty", (player) => {
    client.channels.cache
        .get(player.textId)
        ?.send({ content: `Destroyed player due to inactivity.` })
        .then((x) => player.data.set("message", x));
    player.destroy();
});

client.on("messageCreate", async (msg) => {
    if (msg.author.bot) return;

    if (msg.content.startsWith("!play")) {
        const args = msg.content.split(" ");
        const query = args.slice(1).join(" ");

        const { channel } = msg.member.voice;
        if (!channel)
            return msg.reply(
                "You need to be in a voice channel to use this command!"
            );

        let player = await kazagumo.createPlayer({
            guildId: msg.guild.id,
            textId: msg.channel.id,
            voiceId: channel.id,
            volume: 40,
        });

        let result = await kazagumo.search(query, { requester: msg.author, engine: "spotify" });
        console.log(result);
        if (!result.tracks.length) return msg.reply("No results found!");
        // if (result.type === "PLAYLIST") player.queue.add(result.tracks); // do this instead of using for loop if you want queueUpdate not spammy
        else player.queue.add(result.tracks[0]);

        if (!player.playing && !player.paused) player.play();
        return msg.reply({
            content:
                result.type === "PLAYLIST"
                    ? `Queued ${result.tracks.length} from ${result.playlistName}`
                    : `Queued ${result.tracks[0].title}`,
        });
    }

    if (msg.content.startsWith("!skip")) {
        let player = kazagumo.players.get(msg.guild.id);
        if (!player) return msg.reply("No player found!");
        player.skip();
        log(msg.guild.id);
        return msg.reply({
            content: `Skipped to **${player.queue[0]?.title}** by **${player.queue[0]?.author}**`,
        });
    }

    if (msg.content.startsWith("!forceplay")) {
        let player = kazagumo.players.get(msg.guild.id);
        if (!player) return msg.reply("No player found!");
        const args = msg.content.split(" ");
        const query = args.slice(1).join(" ");
        let result = await kazagumo.search(query, { requester: msg.author });
        if (!result.tracks.length) return msg.reply("No results found!");
        player.play(new KazagumoTrack(result.tracks[0].getRaw(), msg.author));
        return msg.reply({
            content: `Forced playing **${result.tracks[0].title}** by **${result.tracks[0].author}**`,
        });
    }

    if (msg.content.startsWith("!previous")) {
        let player = kazagumo.players.get(msg.guild.id);
        if (!player) return msg.reply("No player found!");
        const previous = player.getPrevious(); // we get the previous track without removing it first
        if (!previous) return msg.reply("No previous track found!");
        await player.play(player.getPrevious(true)); // now we remove the previous track and play it
        return msg.reply("Previous!");
    }
});

client.login(
    "MTMxNDM5NzQxMjMxOTgyNTk0MA.GHn10G.AeWUAwZT6ewdSlnbuuinqwodAP-o-ILMSio_2M"
);
