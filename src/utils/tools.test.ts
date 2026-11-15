import { describe, expect, test } from "bun:test";
import { titleCleaner } from "./tools.js";

// Títulos reales de los logs del bot. El artista es lo que suele mandar YouTube (el nombre del canal).
const cases: [title: string, artist: string | undefined, expected: string][] = [
    // Artista al inicio + etiqueta del video
    ["Avril Lavigne - Complicated (Official Video)", "Avril Lavigne", "Complicated"],
    ["AC/DC - Back In Black (Official 4K Video)", "AC/DC", "Back In Black"],
    ["Adele - Skyfall (Official Lyric Video)", "Adele", "Skyfall"],
    ["Green Day - Holiday (Official Audio)", "Green Day", "Holiday"],
    ["LAST DINOSAURS - ELEVEN (OFFICIAL MUSIC VIDEO)", "Last Dinosaurs", "ELEVEN"],
    ["Red Hot Chili Peppers - By The Way [Official Music Video]", "Red Hot Chili Peppers", "By The Way"],
    ["Rage Against The Machine - Killing In The Name (Official HD Video)", "Rage Against The Machine", "Killing In The Name"],
    ["The Cranberries - Linger (4K Official Music Video)", "The Cranberries", "Linger"],
    ["Indila - Dernière Danse (Clip Officiel)", "Indila", "Dernière Danse"],
    ["The Smashing Pumpkins- Rat In a Cage", "The Smashing Pumpkins", "Rat In a Cage"],
    ["t.A.T.u. - All The Things She Said (Official Music Video)", "t.A.T.u.", "All The Things She Said"],

    // Canal distinto del nombre escrito (VEVO, " - Topic", sin espacios)
    ["Avril Lavigne - Complicated (Official Video)", "AvrilLavigneVEVO", "Complicated"],
    ["Un Verano - Menos Diez", "Un Verano - Topic", "Menos Diez"],

    // Artista al final o entre corchetes
    ["Bleed It Out (Official Music Video) [4K Upgrade] - Linkin Park", "Linkin Park", "Bleed It Out"],
    ["Given Up [Official Music Video] - Linkin Park", "Linkin Park", "Given Up"],
    ["Moves Like Jagger - Maroon 5 featuring Christina Aguilera", "Maroon 5", "Moves Like Jagger"],
    ["【Ado】Raven Sky", "Ado", "Raven Sky"],

    // Colaboraciones: el lado de los artistas se va entero
    ["Eurythmics, Annie Lennox, Dave Stewart - Sweet Dreams (Are Made Of This) (Official Video)", "Eurythmics", "Sweet Dreams (Are Made Of This)"],
    ["Un Verano, Joaquín Levinton - Icónica (Lyric Video)", "Un Verano", "Icónica"],

    // Lo que es parte de la canción se queda
    ["Gotye - Somebody That I Used To Know (feat. Kimbra) [Official Music Video]", "Gotye", "Somebody That I Used To Know (feat. Kimbra)"],
    ["Dua Lipa - Training Season (Live from the Royal Albert Hall) [Official Performance Video]", "Dua Lipa", "Training Season (Live from the Royal Albert Hall)"],
    ["Papa Roach - Last Resort official video HD (Explicit/dirty  Version)", "Papa Roach", "Last Resort (Explicit/dirty Version)"],
    ["SIN DATOS - DON (Miranda!)", "SIN DATOS", "DON (Miranda!)"],

    // Español y separadores " | "
    ["Sin datos - Parte de mí (Letra)", "Sin Datos", "Parte de mí"],
    ["Miranda! Don (Letra)", "Miranda!", "Miranda! Don"],
    ["Cactus | Nasa Histoires | Letra", "Nasa Histoires", "Cactus"],

    // Sin nada que limpiar, o artista que no coincide con el canal
    ["Así Soy Yo", "Delfi Can", "Así Soy Yo"],
    ["Halo", undefined, "Halo"],
    ["OneRepublic - Counting Stars", "Some Lyrics Channel", "OneRepublic - Counting Stars"],

    // No cortar palabras ni dejar el título vacío
    ["Delfina - Canción", "Delfi", "Delfina - Canción"],
    ["Childhood (HD)", undefined, "Childhood"],
    ["Video Games", "Lana Del Rey", "Video Games"],
    ["Linkin Park", "Linkin Park", "Linkin Park"],
    ["(Official Video)", undefined, "(Official Video)"],
];

describe("titleCleaner", () => {
    test.each(cases)("%p (artista: %p) → %p", (title, artist, expected) => {
        expect(titleCleaner(title, artist)).toBe(expected);
    });
});
