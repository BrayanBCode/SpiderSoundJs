import { BotClient } from "../../class/BotClient.js";

export function deployLavalinkEvents(client: BotClient){
    console.log("Cargando Eventos de Lavalink");

    client.on("raw", (d) => client.lavalink!.sendRawData(d))
    
    client.lavalink!.nodeManager.on("connect", (node) => {
        console.log(`Node ${node.options.id} conectado`);
    });

    client.lavalink!.nodeManager.on("error", (node, error) => {
        console.log(`Node ${node.options.id} tuvo un error: ${error.message}`);
    });

    client.lavalink!.nodeManager.LavalinkManager.on("trackEnd", (client, track)=> {
        console.log(`Termino: ${track?.info.title}`);
    })
    client.lavalink!.nodeManager.LavalinkManager.on("trackStart", (client, track)=> {
        console.log(`reporduciendo: ${track?.info.title}`);
    })
    client.lavalink!.nodeManager.LavalinkManager.on("trackStuck", (client, track)=> {
        console.warn(`Se trabo: ${track?.info.title}`);
    })
    client.lavalink!.nodeManager.LavalinkManager.on("trackError", (client, track)=> {
        console.error(track);
    })    
    client.lavalink!.nodeManager.LavalinkManager.on("playerSocketClosed", (data) => {
        console.error('WebSocket cerrado:', data);
    });
    
    // client.lavalink!.nodeManager.LavalinkManager.on('playerUpdate', (state) => {
    //     console.log('Actualización del estado del jugador:', state);
    // });

    
}

