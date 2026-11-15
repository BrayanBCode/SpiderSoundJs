import { ActionRowBuilder, AutocompleteInteraction, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, MessageFlags } from "discord.js"
import { SlashCommand } from "../../../core/classes/SlashCommand.js"
import { BClient } from "../../../core/client/BClient.js"
import logger from "../../../core/client/logger.js"
import { PlaylistSummary } from "../../../core/db/database.js"
import { editReplyEmbed, MAX_LOAD, queueSavedTracks, resolveTracksToSave, savedTrackSearch, showSavedList, voiceChannelFor } from "../../../core/music/savedTracks.js"
import { EmptyEmbed, replyEmbed } from "../../../utils/messages.js"
import { shuffle, titleCleaner } from "../../../utils/tools.js"

/** Discord muestra hasta 25 opciones en el autocompletado */
const MAX_PLAYLISTS = 25
/** Igual al tope de carga: así una playlist siempre se reproduce entera */
const MAX_TRACKS = MAX_LOAD
const NAME_MAX = 50
const CONFIRM_TIME = 30 * 1000

type Inter = ChatInputCommandInteraction<"cached">

const replyEphemeral = (inter: Inter, description: string, color: "Green" | "Yellow" | "Red") =>
    replyEmbed({ interaction: inter, embed: EmptyEmbed({ description }).setColor(color), ephemeral: true })

/** La playlist elegida en la opción `playlist`. Si no existe (o es de otro), avisa y devuelve `undefined` */
async function findPlaylist(client: BClient, inter: Inter, deferred = false): Promise<PlaylistSummary | undefined> {
    const name = inter.options.getString("playlist", true).trim()
    const playlist = client.db.getPlaylist(inter.user.id, name)
    if (playlist) return playlist

    const msg = `No tenés una playlist llamada **${name}**. Mirá las tuyas con \`/playlist ver\`.`
    if (deferred) await editReplyEmbed(inter, msg, "Yellow")
    else await replyEphemeral(inter, msg, "Yellow")
}

async function create(client: BClient, inter: Inter) {
    const name = inter.options.getString("nombre", true).trim()
    if (!name) return replyEphemeral(inter, "El nombre no puede estar vacío.", "Yellow")
    if (client.db.getPlaylists(inter.user.id).length >= MAX_PLAYLISTS)
        return replyEphemeral(inter, `Ya tenés ${MAX_PLAYLISTS} playlists, que es el máximo. Borrá alguna con \`/playlist borrar\`.`, "Yellow")

    const playlist = client.db.createPlaylist(inter.user.id, name)
    if (!playlist) return replyEphemeral(inter, `Ya tenés una playlist llamada **${name}**.`, "Yellow")

    logger.info(`[Playlist] ${inter.user.username} creó "${name}" en ${inter.guild.name}`)
    return replyEphemeral(inter, `📁 Se creó la playlist **${name}**. Agregale canciones con \`/playlist agregar\`.`, "Green")
}

async function add(client: BClient, inter: Inter) {
    // Buscar puede tardar más de los 3 s que da Discord; la respuesta la ve solo quien la pide
    await inter.deferReply({ flags: MessageFlags.Ephemeral })

    const playlist = await findPlaylist(client, inter, true)
    if (!playlist) return
    if (playlist.trackCount >= MAX_TRACKS)
        return editReplyEmbed(inter, `**${playlist.name}** ya tiene ${MAX_TRACKS} canciones, que es el máximo.`, "Yellow")

    // Acepta enlaces de playlists (ej. de YouTube): se agregan todas sus canciones
    const resolved = await resolveTracksToSave(client, inter, true)
    if (!resolved) return

    if (!resolved.playlistName) {
        const [track] = resolved.tracks
        const title = titleCleaner(track.title, track.author)
        if (!client.db.addToPlaylist(playlist.id, track)) return editReplyEmbed(inter, `**${title}** ya estaba en **${playlist.name}**.`, "Yellow")

        logger.info(`[Playlist] ${inter.user.username} agregó "${track.title}" (${track.uri}) a "${playlist.name}" en ${inter.guild.name}`)
        return editReplyEmbed(inter, `➕ **${title}** se agregó a **${playlist.name}** (${playlist.trackCount + 1} canciones).`, "Green")
    }

    // Se agregan en orden hasta llenar el lugar libre; las repetidas se saltean sin ocupar lugar
    let added = 0, repeated = 0, free = MAX_TRACKS - playlist.trackCount
    for (const track of resolved.tracks) {
        if (added >= free) break
        if (client.db.addToPlaylist(playlist.id, track)) added++
        else repeated++
    }
    const leftOut = resolved.tracks.length - added - repeated

    logger.info(`[Playlist] ${inter.user.username} agregó ${added} canciones de la playlist "${resolved.playlistName}" a "${playlist.name}" en ${inter.guild.name} (repetidas: ${repeated}, sin lugar: ${leftOut})`)

    const notes = [
        repeated ? `${repeated} ya estaban` : "",
        leftOut ? `${leftOut} no entraron (máximo ${MAX_TRACKS} por playlist)` : "",
    ].filter(Boolean).join(" · ")
    return editReplyEmbed(inter,
        `➕ Se agregaron **${added}** canciones de **${resolved.playlistName}** a **${playlist.name}** (${playlist.trackCount + added} canciones).${notes ? `\n${notes}` : ""}`,
        added ? "Green" : "Yellow")
}

async function play(client: BClient, inter: Inter) {
    const VCID = await voiceChannelFor(client, inter)
    if (!VCID) return

    const playlist = await findPlaylist(client, inter)
    if (!playlist) return

    const saved = client.db.getPlaylistTracks(playlist.id)
    if (!saved.length) return replyEphemeral(inter, `**${playlist.name}** está vacía. Agregale canciones con \`/playlist agregar\`.`, "Yellow")

    const mix = inter.options.getBoolean("mezclar") ?? false

    // Buscar cada enlace puede tardar más de los 3 s que da Discord
    await inter.deferReply()
    const { tracks, failed, queueSize } = await queueSavedTracks(client, inter, VCID, mix ? shuffle(saved) : saved)
    if (!tracks.length) return editReplyEmbed(inter, `❌ No se pudo cargar ninguna canción de **${playlist.name}**, probá de nuevo en un rato.`, "Red")

    logger.info(`[playlist] ${inter.user.username} cargó "${playlist.name}" (${tracks.length} canciones${mix ? ", mezcladas" : ""}) en ${inter.guild.name} (fallaron: ${failed.length}, cola: ${queueSize})`)

    const embed = EmptyEmbed()
        .setAuthor({ name: `Playlist de ${inter.member.displayName} 📁`, iconURL: inter.user.displayAvatarURL() })
        .setTitle(playlist.name)
        .setDescription(`Se agregaron **${tracks.length}** canciones${mix ? " mezcladas" : ""} a la cola.`)
        .setThumbnail(tracks[0].artworkUrl ?? null)
        .setColor("Green")
    if (failed.length) embed.addFields({ name: "No se pudieron cargar", value: `${failed.length} (puede que ya no estén disponibles)` })

    return inter.editReply({ embeds: [embed] })
}

async function view(client: BClient, inter: Inter) {
    // Sin playlist: el resumen de todas
    if (!inter.options.getString("playlist")) {
        const playlists = client.db.getPlaylists(inter.user.id)
        if (!playlists.length) return replyEphemeral(inter, "Todavía no tenés playlists. Creá una con `/playlist crear`.", "Yellow")

        return replyEmbed({
            interaction: inter,
            ephemeral: true,
            embed: EmptyEmbed()
                .setAuthor({ name: `Playlists de ${inter.member.displayName} 📁` })
                .setColor(0x1DB954)
                .setDescription(playlists.map(p => `• **${p.name}** · ${p.trackCount} ${p.trackCount === 1 ? "canción" : "canciones"}`).join("\n"))
                .setFooter({ text: `${playlists.length}/${MAX_PLAYLISTS} playlists · /playlist ver playlist:<nombre> para ver sus canciones` }),
        })
    }

    const playlist = await findPlaylist(client, inter)
    if (!playlist) return

    // Posición: identifica la canción aunque la lista cambie desde otra ventana
    const load = () => client.db.getPlaylistTracks(playlist.id).map(t => ({ ...t, key: String(t.position) }))
    if (!load().length) return replyEphemeral(inter, `**${playlist.name}** está vacía. Agregale canciones con \`/playlist agregar\`.`, "Yellow")

    return showSavedList(inter, {
        title: `${playlist.name} 📁`,
        idPrefix: "pl",
        hint: "/playlist play para escucharla",
        load,
        remove: item => {
            if (client.db.removeFromPlaylist(playlist.id, Number(item.key)))
                logger.info(`[Playlist] ${inter.user.username} quitó "${item.title}" (${item.uri}) de "${playlist.name}"`)
        },
    })
}

async function rename(client: BClient, inter: Inter) {
    const playlist = await findPlaylist(client, inter)
    if (!playlist) return

    const newName = inter.options.getString("nuevo_nombre", true).trim()
    if (!newName) return replyEphemeral(inter, "El nombre no puede estar vacío.", "Yellow")
    if (!client.db.renamePlaylist(inter.user.id, playlist.id, newName))
        return replyEphemeral(inter, `Ya tenés otra playlist llamada **${newName}**.`, "Yellow")

    logger.info(`[Playlist] ${inter.user.username} renombró "${playlist.name}" a "${newName}"`)
    return replyEphemeral(inter, `✏️ **${playlist.name}** ahora se llama **${newName}**.`, "Green")
}

async function remove(client: BClient, inter: Inter) {
    const playlist = await findPlaylist(client, inter)
    if (!playlist) return

    // Borrar no se puede deshacer: se pide confirmación con botones
    const { resource } = await inter.reply({
        embeds: [EmptyEmbed({ description: `¿Borrar **${playlist.name}** y sus ${playlist.trackCount} canciones? No se puede deshacer.` }).setColor("Red")],
        components: [new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId("pl-delete-yes").setLabel("Borrar").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("pl-delete-no").setLabel("Cancelar").setStyle(ButtonStyle.Secondary))],
        flags: MessageFlags.Ephemeral,
        withResponse: true,
    })
    if (!resource?.message) return

    try {
        const answer = await resource.message.awaitMessageComponent({
            time: CONFIRM_TIME,
            filter: i => i.user.id === inter.user.id && i.customId.startsWith("pl-delete-"),
        })

        if (answer.customId === "pl-delete-no")
            return answer.update({ embeds: [EmptyEmbed({ description: `Se canceló: **${playlist.name}** sigue igual.` })], components: [] })

        const deleted = client.db.deletePlaylist(inter.user.id, playlist.id)
        if (deleted) logger.info(`[Playlist] ${inter.user.username} borró "${playlist.name}" (${playlist.trackCount} canciones)`)
        return answer.update({
            embeds: [EmptyEmbed({ description: deleted ? `🗑️ Se borró **${playlist.name}**.` : `**${playlist.name}** ya no existía.` }).setColor(deleted ? "Green" : "Yellow")],
            components: [],
        })
    } catch {
        // Se venció el tiempo sin respuesta
        return inter.editReply({ embeds: [EmptyEmbed({ description: `No se borró nada: **${playlist.name}** sigue igual.` })], components: [] }).catch(() => { })
    }
}

/** Sugiere las playlists del usuario, o canciones si se está escribiendo `busqueda` */
async function autocomplete(client: BClient, inter: AutocompleteInteraction) {
    const focused = inter.options.getFocused(true)
    if (focused.name === "busqueda") return savedTrackSearch.autocomplete(client, inter)

    const text = focused.value.toLowerCase()
    return inter.respond(client.db.getPlaylists(inter.user.id)
        .filter(p => p.name.toLowerCase().includes(text))
        .slice(0, 25)
        .map(p => ({ name: `${p.name} (${p.trackCount} ${p.trackCount === 1 ? "canción" : "canciones"})`.slice(0, 100), value: p.name })))
}

const subcommands: Record<string, (client: BClient, inter: Inter) => Promise<unknown>> = {
    crear: create, agregar: add, play, ver: view, renombrar: rename, borrar: remove,
}

export default new SlashCommand()
    .setName("playlist")
    .setDescription("Tus playlists: crealas, agregales canciones y reproducilas.")
    .setCategory("Music")
    .setExecute(async (client, inter) => {
        try {
            await subcommands[inter.options.getSubcommand()]?.(client, inter)
        } catch (err) {
            logger.error(`[/playlist] Error no controlado en el comando:`, err)
        }
    })
    .setAutoComplete(async (client, inter) => {
        try {
            await autocomplete(client, inter)
        } catch (err) {
            logger.error(`[/playlist] Error en el autocompletado:`, err)
        }
    })
    .addSubcommand(sub => sub
        .setName("crear")
        .setDescription("Crea una playlist vacía.")
        .addStringOption(o => o.setName("nombre").setDescription("Nombre de la playlist.").setRequired(true).setMaxLength(NAME_MAX)))
    .addSubcommand(sub => sub
        .setName("agregar")
        .setDescription("Agrega una canción o una playlist de YouTube (o la que suena, si no escribís nada).")
        .addStringOption(o => o.setName("playlist").setDescription("A qué playlist.").setRequired(true).setAutocomplete(true))
        .addStringOption(o => o.setName("busqueda").setDescription("Nombre de la canción, artista, o enlace de una canción o playlist.").setAutocomplete(true)))
    .addSubcommand(sub => sub
        .setName("play")
        .setDescription("Agrega una playlist a la cola.")
        .addStringOption(o => o.setName("playlist").setDescription("Cuál reproducir.").setRequired(true).setAutocomplete(true))
        .addBooleanOption(o => o.setName("mezclar").setDescription("Mezclarla al azar (si no, va en el orden en que se agregaron).")))
    .addSubcommand(sub => sub
        .setName("ver")
        .setDescription("Muestra tus playlists, o las canciones de una (con menú para quitarlas).")
        .addStringOption(o => o.setName("playlist").setDescription("Cuál ver (si no, se listan todas).").setAutocomplete(true)))
    .addSubcommand(sub => sub
        .setName("renombrar")
        .setDescription("Le cambia el nombre a una playlist.")
        .addStringOption(o => o.setName("playlist").setDescription("Cuál renombrar.").setRequired(true).setAutocomplete(true))
        .addStringOption(o => o.setName("nuevo_nombre").setDescription("El nombre nuevo.").setRequired(true).setMaxLength(NAME_MAX)))
    .addSubcommand(sub => sub
        .setName("borrar")
        .setDescription("Borra una playlist y sus canciones (pide confirmación).")
        .addStringOption(o => o.setName("playlist").setDescription("Cuál borrar.").setRequired(true).setAutocomplete(true)))
