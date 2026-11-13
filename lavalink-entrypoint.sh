#!/bin/sh
# Entrypoint de Lavalink: elige la versión del plugin de YouTube según YOUTUBE_PLUGIN_CHANNEL (release|dev)
# y la pasa por YOUTUBE_PLUGIN_VERSION / YOUTUBE_PLUGIN_SNAPSHOT, que application.yml usa como ${...}.
# Si no hay canal o maven.lavalink.dev no responde, quedan los valores por defecto de application.yml.

log() { echo "[YouTubePlugin] $*"; }

# versión fija de application.yml (el valor por defecto del ${YOUTUBE_PLUGIN_VERSION:...} o la versión escrita a mano)
fixed=$(sed -n "s/.*youtube-plugin:\(\${YOUTUBE_PLUGIN_VERSION:\)\{0,1\}\([^}'\"]*\).*/\2/p" application.yml | head -n 1)

case "$YOUTUBE_PLUGIN_CHANNEL" in
    release) repo=releases tag=release snapshot=false ;;
    dev) repo=snapshots tag=latest snapshot=true ;;
    "") repo= ; log "YOUTUBE_PLUGIN_CHANNEL sin definir -> versión fija de application.yml ($fixed)" ;;
    *) repo= ; log "AVISO: YOUTUBE_PLUGIN_CHANNEL='$YOUTUBE_PLUGIN_CHANNEL' no es release ni dev -> versión fija de application.yml ($fixed)" ;;
esac

if [ -n "$repo" ]; then
    url="https://maven.lavalink.dev/$repo/dev/lavalink/youtube/youtube-plugin/maven-metadata.xml"
    version=$(wget -q -T 10 -t 2 -O - "$url" | sed -n "s:.*<$tag>\(.*\)</$tag>.*:\1:p" | head -n 1)
    case "$version" in
        # vacío o con caracteres raros (no se confía en lo que devuelve la red: iría dentro de la config de Spring)
        "" | *[!A-Za-z0-9._-]*)
            log "AVISO: no se pudo obtener la última versión del canal $YOUTUBE_PLUGIN_CHANNEL desde $url -> versión fija de application.yml ($fixed)" ;;
        *)
            export YOUTUBE_PLUGIN_VERSION="$version" YOUTUBE_PLUGIN_SNAPSHOT="$snapshot"
            [ "$snapshot" = true ] && tipo="snapshot" || tipo="release"
            log "Canal $YOUTUBE_PLUGIN_CHANNEL -> versión $version ($tipo)"
            grep -q 'YOUTUBE_PLUGIN_VERSION' application.yml ||
                log "AVISO: application.yml no usa \${YOUTUBE_PLUGIN_VERSION}; se ignora el canal y queda la versión fija ($fixed). Ver application.example.yml"
            ;;
    esac
fi

exec java -jar Lavalink.jar "$@"
