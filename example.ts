import { Client, GatewayIntentBits, VoiceBasedChannel } from "discord.js";
import { LavalinkManager, LavalinkManagerEvents } from "lavalink-client";
import { joinVoiceChannel } from '@discordjs/voice'

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const token =
    "MTI1NjM5NTI0OTQxNzQ1Nzc3NQ.GVh87R.2rejeUud0f9m9CmL8bzbii8CJFNOydZaclUcFo";

(async () => {
    const lavalink = new LavalinkManager({
        nodes: [
            {
                authorization: "password",
                host: "lavalink", // Asegúrate de que coincide con el nombre del servicio en docker-compose.yml
                port: 2333,
                id: "testnode",
                requestSignalTimeoutMS: 3000,
                closeOnError: true,
                heartBeatInterval: 30000,
                enablePingOnStatsCheck: true,
                retryDelay: 10000,
                secure: false,
                retryAmount: 5,
            },
        ],
        sendToShard: (guildId, payload) =>
            client.guilds.cache.get(guildId)?.shard?.send(payload),
        autoSkip: true,
        client: {
            id: "1256395249417457775", // Asegúrate de que este ID es correcto
            username: "SpiderTest",
        },
        autoSkipOnResolveError: true,
        emitNewSongsOnly: true,
        playerOptions: {
            maxErrorsPerTime: {
                threshold: 10000,
                maxAmount: 3,
            },
            minAutoPlayMs: 10000,
            applyVolumeAsFilter: false,
            clientBasedPositionUpdateInterval: 50,
            defaultSearchPlatform: "spotify",
            volumeDecrementer: 0.75,
            onDisconnect: {
                autoReconnect: true,
                destroyPlayer: false,
            },
            onEmptyQueue: {
                destroyAfterMs: 30000,
            },
            useUnresolvedData: true,
        },
        linksAllowed: true,
        linksBlacklist: [],
        linksWhitelist: [],
        advancedOptions: {
            enableDebugEvents: true,
            maxFilterFixDuration: 600000,
            debugOptions: {
                noAudio: false,
                playerDestroy: {
                    dontThrowError: false,
                    debugLog: false,
                },
                logCustomSearches: false,
            },
        },
    });

    // Inicializa el manager después de que el bot esté listo
    client.once("ready", () => {
        console.log("Bot está listo");
        lavalink.init({
            id: client.user!.id,
            username: client.user!.username,
        });

        const payload = {
            op: "play",
            guildId: "1149753197573968024",
            track: "https://open.spotify.com/intl-es/track/22UZeBQhw1JsGo7Z8GBZ92?si=4ef545104d344e81",
        };

        // Enviar el payload al shard correspondiente
        client.guilds.cache.get(payload.guildId)?.shard?.send(payload);
    });

    // Manejo de eventos
    lavalink.nodeManager.on("connect", (node) => {
        console.log(`Node ${node.options.id} conectado`);
    });

    lavalink.nodeManager.on("error", (node, error, payload) => {
        console.log(`Node ${node.options.id} tuvo un error: ${error.message}`);
    });

    client.on("messageCreate", async (message) => {

		if (message.content.startsWith('!join')) {
			const voiceChannel = message.member?.voice.channel as VoiceBasedChannel;
			if (!voiceChannel) {
			  return message.reply('Debes estar en un canal de voz para usar este comando.');
			}
		
			const connection = joinVoiceChannel({
			  channelId: voiceChannel.id,
			  guildId: voiceChannel.guild.id,
			  adapterCreator: voiceChannel.guild.voiceAdapterCreator,
			});
		
			message.reply('Me he unido al canal de voz!');
		  }


        if (message.content.startsWith("!spotify")) {
            const args = message.content.split(" ");
            const query = args.slice(1).join(" ");

            if (!query) {
                return message.reply(
                    "Por favor proporciona un enlace de Spotify."
                );
            }

            try {
                const result = await lavalink
                    .getPlayer(message.guildId!)
                    ?.search(query, message.author)!;
                if (
                    // @ts-ignore
                    result.loadType === "TRACK_LOADED" ||
                    // @ts-ignore
                    result.loadType === "SEARCH_RESULT"
                ) {
                    const track = result.tracks[0];
                    message.reply(`URL de streaming: ${track.info.uri}`);
                } else {
                    message.reply("No se encontró ninguna pista.");
                }
            } catch (error) {
                console.error(error);
                message.reply("Hubo un error al buscar la pista.");
            }
        }
    });

	

    client.login(token);
})();
