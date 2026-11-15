import { ChatInputCommandInteraction, MessageFlags } from "discord.js"
import { SlashCommand } from "../../../core/classes/SlashCommand.js"
import { BClient } from "../../../core/client/BClient.js"
import logger from "../../../core/client/logger.js"
import { editReplyEmbed, MAX_LOAD, queueSavedTracks, resolveTracksToSave, savedTrackSearch, showSavedList, voiceChannelFor } from "../../../core/music/savedTracks.js"
import { EmptyEmbed, replyEmbed } from "../../../utils/messages.js"
import { shuffle, titleCleaner } from "../../../utils/tools.js"

const noFavorites = EmptyEmbed({ description: "Todavía no tenés favoritos: tocá ❤️ en el mensaje del reproductor para guardar la canción que suena." }).setColor("Yellow")

/** /favoritos agregar: guarda una canción buscada, o la que suena si no se escribe nada */
async function add(client: BClient, inter: ChatInputCommandInteraction<"cached">) {
    // Buscar puede tardar más de los 3 s que da Discord; la respuesta la ve solo quien la pide
    await inter.deferReply({ flags: MessageFlags.Ephemeral })

    const resolved = await resolveTracksToSave(client, inter)
    if (!resolved) return
    const [track] = resolved.tracks

    const title = titleCleaner(track.title, track.author)
    if (!client.db.addFavorite(inter.user.id, track)) return editReplyEmbed(inter, `**${title}** ya estaba en tus favoritos.`, "Yellow")

    logger.info(`[Favoritos] ${inter.user.username} agregó "${track.title}" (${track.uri}) desde /favoritos agregar en ${inter.guild.name}`)
    return editReplyEmbed(inter, `❤️ **${title}** se agregó a tus favoritos.`, "Green")
}

/** /favoritos reproducir: carga los favoritos del usuario en la cola */
async function play(client: BClient, inter: ChatInputCommandInteraction<"cached">) {
    const VCID = await voiceChannelFor(client, inter)
    if (!VCID) return

    const favorites = client.db.getFavorites(inter.user.id)
    if (!favorites.length) return replyEmbed({ interaction: inter, embed: noFavorites, ephemeral: true })

    const amount = inter.options.getInteger("cantidad") ?? MAX_LOAD
    const mix = inter.options.getBoolean("mezclar") ?? false
    const selected = (mix ? shuffle(favorites) : favorites).slice(0, amount)

    // Buscar cada enlace puede tardar más de los 3 s que da Discord
    await inter.deferReply()
    const { tracks, failed, queueSize } = await queueSavedTracks(client, inter, VCID, selected)
    if (!tracks.length) return editReplyEmbed(inter, "❌ No se pudo cargar ninguno de tus favoritos, probá de nuevo en un rato.", "Red")

    logger.info(`[favoritos] ${inter.user.username} cargó ${tracks.length} favoritos${mix ? " mezclados" : ""} en ${inter.guild.name} (fallaron: ${failed.length}, cola: ${queueSize})`)

    const embed = EmptyEmbed()
        .setAuthor({ name: `Favoritos de ${inter.member.displayName} ❤️`, iconURL: inter.user.displayAvatarURL() })
        .setDescription(`Se agregaron **${tracks.length}** canciones${mix ? " mezcladas" : ""} a la cola.`)
        .setThumbnail(tracks[0].artworkUrl ?? null)
        .setColor("Green")
    if (failed.length) embed.addFields({ name: "No se pudieron cargar", value: `${failed.length} (puede que ya no estén disponibles)` })
    if (favorites.length > selected.length) embed.setFooter({ text: `Tenés ${favorites.length} favoritos; se cargaron ${selected.length}.` })

    return inter.editReply({ embeds: [embed] })
}

/** /favoritos ver: lista paginada, solo para quien la pide, con un menú para quitar canciones */
async function view(client: BClient, inter: ChatInputCommandInteraction<"cached">) {
    // Momento en que se agregó: identifica la canción aunque la lista cambie desde otra ventana
    const load = () => client.db.getFavorites(inter.user.id).map(fav => ({ ...fav, key: String(fav.addedAt) }))
    if (!load().length) return replyEmbed({ interaction: inter, embed: noFavorites, ephemeral: true })

    return showSavedList(inter, {
        title: `Favoritos de ${inter.member.displayName} ❤️`,
        idPrefix: "fav",
        hint: "/favoritos reproducir para escucharlos",
        load,
        remove: fav => {
            if (client.db.removeFavorite(inter.user.id, fav.uri))
                logger.info(`[Favoritos] ${inter.user.username} quitó "${fav.title}" (${fav.uri}) desde /favoritos ver`)
        },
    })
}

export default new SlashCommand()
    .setName("favoritos")
    .setDescription("Tus canciones favoritas (las que guardaste con ❤️).")
    .setCategory("Music")
    .setExecute(async (client, inter) => {
        try {
            const sub = inter.options.getSubcommand()
            if (sub === "reproducir") await play(client, inter)
            else if (sub === "agregar") await add(client, inter)
            else await view(client, inter)
        } catch (err) {
            logger.error(`[/favoritos] Error no controlado en el comando:`, err)
        }
    })
    .setAutoComplete(async (client, inter) => {
        try {
            await savedTrackSearch.autocomplete(client, inter)
        } catch (err) {
            logger.error(`[/favoritos] Error en el autocompletado:`, err)
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
        .setName("agregar")
        .setDescription("Guarda una canción en tus favoritos (la que suena, si no escribís nada).")
        .addStringOption(o => o
            .setName("busqueda")
            .setDescription("Nombre de la canción, artista o enlace.")
            .setAutocomplete(true)))
    .addSubcommand(sub => sub
        .setName("ver")
        .setDescription("Muestra tus favoritos (solo vos los ves) y permite quitarlos."))
