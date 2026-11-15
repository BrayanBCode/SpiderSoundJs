import { APIChannel, ChannelType, Client, EmbedBuilder, OverwriteType, PermissionFlagsBits, Routes } from "discord.js";
import logger from "./logger.js";
import { createCooldown } from "../../utils/tools.js";

// Avisos para el desarrollador en un canal de texto de su servidor (DEV_GUILD_ID en el .env).
// Todo va por REST: funciona desde cualquier shard aunque el servidor del dev esté en otro.

const CHANNEL_NAME = "notificaciones-bot";
const CHANNEL_TOPIC = "Avisos automáticos de Araña Sound: arranques, servidores nuevos, errores y Lavalink.";

let client: Client | undefined;
let channelId: Promise<string | undefined> | undefined;
const allow = createCooldown(60_000);

/** Se llama al arrancar el shard; sin DEV_GUILD_ID los avisos quedan apagados */
export function initDevNotifier(c: Client) {
    client = c;
    if (!process.env.DEV_GUILD_ID) logger.info("[Notificaciones] Sin DEV_GUILD_ID en el .env: no se mandan avisos al servidor del dev");
}

/** Canal privado: oculto para @everyone; lo ven el dueño del bot (ownerID) y el bot. Los administradores lo ven igual (Discord) */
function privateOverwrites(c: Client, guildId: string) {
    const view = PermissionFlagsBits.ViewChannel | PermissionFlagsBits.ReadMessageHistory;
    const overwrites = [
        // El rol @everyone tiene el mismo ID que el servidor
        { id: guildId, type: OverwriteType.Role, deny: String(PermissionFlagsBits.ViewChannel) },
        { id: c.user!.id, type: OverwriteType.Member, allow: String(view | PermissionFlagsBits.SendMessages | PermissionFlagsBits.EmbedLinks) },
    ];
    const ownerId = process.env.ownerID;
    if (ownerId) overwrites.push({ id: ownerId, type: OverwriteType.Member, allow: String(view) });
    return overwrites;
}

/** Busca el canal de avisos en el servidor del dev o lo crea (hace falta el permiso Gestionar canales). Siempre lo deja privado */
async function resolveChannel(c: Client, guildId: string): Promise<string | undefined> {
    try {
        const permission_overwrites = privateOverwrites(c, guildId);
        const channels = await c.rest.get(Routes.guildChannels(guildId)) as APIChannel[];
        const existing = channels.find(ch => ch.type === ChannelType.GuildText && ch.name === CHANNEL_NAME);
        if (existing) {
            // Por si se creó antes de que fuera privado o alguien le cambió los permisos
            await c.rest.patch(Routes.channel(existing.id), { body: { permission_overwrites } });
            return existing.id;
        }

        // shortcut: si dos shards lo crean a la vez quedan dos canales; con un solo shard no pasa
        const created = await c.rest.post(Routes.guildChannels(guildId), {
            body: { name: CHANNEL_NAME, type: ChannelType.GuildText, topic: CHANNEL_TOPIC, permission_overwrites },
        }) as APIChannel;
        logger.info(`[Notificaciones] Canal #${CHANNEL_NAME} creado en el servidor del dev (${created.id})`);
        return created.id;
    } catch (err) {
        logger.warn(`[Notificaciones] No se pudo usar o crear #${CHANNEL_NAME} en ${guildId} (¿el bot tiene Gestionar canales?): ${err}`);
        channelId = undefined; // se reintenta en el próximo aviso
        return undefined;
    }
}

/**
 * Manda un aviso al canal del dev. Con `key`, el mismo aviso no se repite antes de un minuto
 * (para que un error en bucle no llene el canal). Nunca lanza: si falla, solo queda en el log.
 */
export async function notifyDev(embed: EmbedBuilder, key?: string): Promise<void> {
    const guildId = process.env.DEV_GUILD_ID;
    if (!client || !guildId || !client.isReady()) return;
    if (key && !allow(key)) return;

    channelId ??= resolveChannel(client, guildId);
    const id = await channelId;
    if (!id) return;

    const shard = client.shard?.ids[0];
    if (shard !== undefined) embed.setFooter({ text: `Shard ${shard}` });
    embed.setTimestamp();

    await client.rest.post(Routes.channelMessages(id), { body: { embeds: [embed.toJSON()] } })
        .catch(err => {
            channelId = undefined; // por si borraron el canal: el próximo aviso lo busca o lo crea de nuevo
            logger.warn(`[Notificaciones] No se pudo mandar el aviso "${embed.data.title}": ${err}`);
        });
}
