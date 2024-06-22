import { Client, GatewayIntentBits, IntentsBitField, Message } from 'discord.js';
import { createAudioResource, StreamType, joinVoiceChannel, createAudioPlayer, AudioPlayerStatus } from '@discordjs/voice';
import path from 'path';
import ytdl from 'ytdl-core';

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
] 
});

client.once('ready', () => {
    console.log('El bot está listo.');
});

client.on('messageCreate', async (msg) => {
    if (msg.content === '=play') {
        await playMusic(msg);
    }

});

async function playMusic(msg: Message) {
    if (!msg.member!.voice.channel) {
        await msg.reply('Debes estar en un canal de voz para reproducir música.');
        return;
    }

    const connection = joinVoiceChannel({
        channelId: msg.member!.voice.channel.id,
        guildId: msg.guild?.id!,
        adapterCreator: msg.guild?.voiceAdapterCreator!,
    });

    const stream = ytdl('https://www.youtube.com/watch?v=22aBr6luZAQ', { filter: 'audioonly' });
    const resource = createAudioResource(stream); 
    const player = createAudioPlayer();

    player.play(resource);
    connection.subscribe(player);

    player.on('stateChange', (oldState, newState) => {
        console.log(`El estado del reproductor cambió de ${oldState.status} a ${newState.status}`);
        if (newState.status === AudioPlayerStatus.AutoPaused) {
            console.log('Reproductor auto-pausado, intentando reanudar...');
            player.unpause(); // Intenta reanudar la reproducción
        }
    });

    player.on('error', error => {
        console.error(`Error en el AudioPlayer: ${error.message}`);
    });

    await msg.reply('Reproduciendo música en el canal de voz.');
}

client.login('MTI1MTY0OTkxODc3NTU5NTE1MA.GntRUl.Ib4RFnlwO4LIw5-i5Itt2EB2dQk2kI927IeI98');