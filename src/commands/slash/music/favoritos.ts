import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, GuildMember, MessageFlags, StringSelectMenuBuilder } from "discord.js"
import { Track } from "moonlink.js"
import { SlashCommand } from "../../../core/classes/SlashCommand.js"
import { BClient } from "../../../core/client/BClient.js"
import logger from "../../../core/client/logger.js"
import { FavoriteRow } from "../../../core/db/database.js"
import { startIfIdle } from "../../../core/strategy/PlaybackStrategy.js"
import { warnJoinToVC, warnNeedSameVC } from "../../../core/strategy/PlayBackStrategy.messages.js"
import { checkUserVC } from "../../../core/strategy/PlayBackStrategy.modules.js"
import { EmptyEmbed, replyEmbed } from "../../../utils/messages.js"
import { chunkArray, formatMS_HHMMSS, shuffle, titleCleaner } from "../../../utils/tools.js"

/** Tope de canciones por carga: cada una es una búsqueda en Lavalink */
const MAX_LOAD = 100
/** Búsquedas a la vez al cargar favoritos (para no saturar Lavalink ni YouTube) */
const SEARCH_BATCH = 5
const PAGE_SIZE = 10
/** Cuánto tiempo responden los botones y el menú de /favoritos ver */
const VIEW_TIME = 2 * 60 * 1000

const noFavorites = EmptyEmbed({ description: "Todavía no tenés favoritos: tocá ❤️ en el mensaje del reproductor para guardar la canción que suena." }).setColor("Yellow")

/** /favoritos reproducir: carga los favoritos del usuario en la cola */
async function play(client: BClient, inter: ChatInputCommandInteraction<"cached">) {
    const VCID = (inter.member as GuildMember).voice.channelId
    if (!VCID) return warnJoinToVC(inter)
    if (!checkUserVC(inter)) return

    const existing = client.getPlayer(inter.guildId)
    if (existing?.connected && existing.voiceChannelId !== VCID) return warnNeedSameVC(inter)

    const favorites = client.db.getFavorites(inter.user.id)
    if (!favorites.length) return replyEmbed({ interaction: inter, embed: noFavorites, ephemeral: true })

    const amount = inter.options.getInteger("cantidad") ?? MAX_LOAD
    const mix = inter.options.getBoolean("mezclar") ?? false
    const selected = (mix ? shuffle(favorites) : favorites).slice(0, amount)

    // Buscar cada enlace puede tardar más de los 3 s que da Discord
    await inter.deferReply()

    // Se buscan de a SEARCH_BATCH y se conserva el orden elegido
    const tracks: Track[] = []
    const failed: FavoriteRow[] = []
    for (const batch of chunkArray(selected, SEARCH_BATCH)) {
        const results = await Promise.all(batch.map(fav =>
            client.music.search({ query: fav.uri, requester: inter.user })
                .then(res => res?.tracks?.[0])
                .catch(err => { logger.debug(`[favoritos] Error buscando ${fav.uri}: ${err}`); return undefined })))
        results.forEach((track, i) => track ? tracks.push(track) : failed.push(batch[i]))
    }

    if (failed.length) logger.warn(`[favoritos] No se pudieron cargar ${failed.length} favoritos de ${inter.user.username}: ${failed.map(f => f.uri).join(", ")}`)

    if (!tracks.length)
        return inter.editReply({ embeds: [EmptyEmbed({ description: "❌ No se pudo cargar ninguno de tus favoritos, probá de nuevo en un rato." }).setColor("Red")] })

    const player = client.getPlayerOrDefault(inter, inter.guildId)
    if (!player.connected) {
        if (player.voiceChannelId !== VCID) player.setVoiceChannelId(VCID)
        await player.connect({ selfDeaf: true, selfMute: false })
    }

    player.queue.add(tracks)
    await startIfIdle(player)

    logger.info(`[favoritos] ${inter.user.username} cargó ${tracks.length} favoritos${mix ? " mezclados" : ""} en ${inter.guild.name} (fallaron: ${failed.length}, cola: ${player.queue.size})`)

    const embed = EmptyEmbed()
        .setAuthor({ name: `Favoritos de ${inter.member.displayName} ❤️`, iconURL: inter.user.displayAvatarURL() })
        .setDescription(`Se agregaron **${tracks.length}** canciones${mix ? " mezcladas" : ""} a la cola.`)
        .setThumbnail(tracks[0].artworkUrl ?? null)
        .setColor("Green")
    if (failed.length) embed.addFields({ name: "No se pudieron cargar", value: `${failed.length} (puede que ya no estén disponibles)` })
    if (favorites.length > selected.length) embed.setFooter({ text: `Tenés ${favorites.length} favoritos; se cargaron ${selected.length}.` })

    return inter.editReply({ embeds: [embed] })
}

/** Embed y componentes de una página de /favoritos ver */
function renderPage(favorites: FavoriteRow[], page: number, userName: string) {
    const pages = Math.max(1, Math.ceil(favorites.length / PAGE_SIZE))
    const start = page * PAGE_SIZE
    const items = favorites.slice(start, start + PAGE_SIZE)

    const embed = EmptyEmbed()
        .setAuthor({ name: `Favoritos de ${userName} ❤️` })
        .setColor(0x1DB954)
        .setDescription(items.length
            ? items.map((fav, i) => `**${start + i + 1}.** [${titleCleaner(fav.title, fav.author)}](${fav.uri}) · ${fav.author} · \`${formatMS_HHMMSS(fav.duration)}\``).join("\n")
            : "No te quedan favoritos.")
        .setFooter({ text: `Página ${page + 1}/${pages} · ${favorites.length} favoritos · /favoritos reproducir para escucharlos` })

    const components: ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[] = []
    if (items.length) components.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("fav-remove")
            .setPlaceholder("Quitar de favoritos…")
            .addOptions(items.map((fav, i) => ({
                label: `${start + i + 1}. ${titleCleaner(fav.title, fav.author)}`.slice(0, 100),
                description: fav.author.slice(0, 100),
                // Momento en que se agregó: identifica la canción aunque la lista cambie desde otra ventana
                value: String(fav.addedAt),
            })))))
    if (pages > 1) components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId("fav-prev").setEmoji("⬅️").setStyle(ButtonStyle.Secondary).setDisabled(page === 0),
        new ButtonBuilder().setCustomId("fav-next").setEmoji("➡️").setStyle(ButtonStyle.Secondary).setDisabled(page >= pages - 1)))

    return { embeds: [embed], components }
}

/** /favoritos ver: lista paginada, solo para quien la pide, con un menú para quitar canciones */
async function view(client: BClient, inter: ChatInputCommandInteraction<"cached">) {
    let favorites = client.db.getFavorites(inter.user.id)
    if (!favorites.length) return replyEmbed({ interaction: inter, embed: noFavorites, ephemeral: true })

    let page = 0
    const name = inter.member.displayName
    const { resource } = await inter.reply({ ...renderPage(favorites, page, name), flags: MessageFlags.Ephemeral, withResponse: true })
    if (!resource?.message) return

    // Colector atado a este mensaje y a sus controles: sin esto también atrapaba el ❤️ del reproductor y fallaba con "Unknown interaction"
    const collector = resource.message.createMessageComponentCollector({
        time: VIEW_TIME,
        filter: i => i.user.id === inter.user.id && i.customId.startsWith("fav-"),
    })

    collector.on("collect", async i => {
        try {
            if (i.componentType === ComponentType.StringSelect) {
                const fav = client.db.getFavorites(inter.user.id).find(f => String(f.addedAt) === i.values[0])
                if (fav && client.db.removeFavorite(inter.user.id, fav.uri))
                    logger.info(`[Favoritos] ${inter.user.username} quitó "${fav.title}" (${fav.uri}) desde /favoritos ver`)
                favorites = client.db.getFavorites(inter.user.id)
            } else if (i.customId === "fav-prev") page--
            else if (i.customId === "fav-next") page++

            page = Math.min(Math.max(page, 0), Math.max(0, Math.ceil(favorites.length / PAGE_SIZE) - 1))
            await i.update(renderPage(favorites, page, name))
        } catch (err) {
            logger.error(`[favoritos] Error en /favoritos ver de ${inter.user.username}:`, err)
        }
    })

    // Al vencer, se sacan los controles para que no queden botones que no responden
    collector.on("end", () => { inter.editReply({ components: [] }).catch(() => { }) })
}

export default new SlashCommand()
    .setName("favoritos")
    .setDescription("Tus canciones favoritas (las que guardaste con ❤️).")
    .setCategory("Music")
    .setExecute(async (client, inter) => {
        try {
            const sub = inter.options.getSubcommand()
            if (sub === "reproducir") await play(client, inter)
            else await view(client, inter)
        } catch (err) {
            logger.error(`[/favoritos] Error no controlado en el comando:`, err)
        }
    })
    .addSubcommand(sub => sub
        .setName("reproducir")
        .setDescription("Agrega tus favoritos a la cola.")
        .addIntegerOption(o => o
            .setName("cantidad")
            .setDescription(`Cuántas cargar (todas si no lo indicás, hasta ${MAX_LOAD}).`)
            .setMinValue(1)
            .setMaxValue(MAX_LOAD))
        .addBooleanOption(o => o
            .setName("mezclar")
            .setDescription("Mezclarlas al azar (si no, van de la más nueva a la más vieja).")))
    .addSubcommand(sub => sub
        .setName("ver")
        .setDescription("Muestra tus favoritos (solo vos los ves) y permite quitarlos."))
