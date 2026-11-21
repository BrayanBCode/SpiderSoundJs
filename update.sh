#!/usr/bin/env sh
# Actualiza Araña Sound en el servidor: baja la última versión del repo y reconstruye y reinicia los contenedores.
# Uso: ./update.sh   (en Windows: update.bat)
# No toca .env, application.yml ni data/ (no están en el repo).
set -eu
cd "$(dirname "$0")"

log() { echo "[Update] $*"; }
fail() { echo "[Update] ERROR: $*" >&2; exit 1; }
version() { sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' package.json | head -n 1; }

command -v git >/dev/null 2>&1 || fail "no se encontró git"
command -v docker >/dev/null 2>&1 || fail "no se encontró docker"

# Con cambios propios en archivos del repo el pull podría pisarlos o fallar a la mitad: mejor frenar antes
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
    git status --short --untracked-files=no
    fail "hay cambios locales en archivos del repo (arriba). Guardalos con 'git stash' o descartalos y volvé a correr el script"
fi

old_commit=$(git rev-parse HEAD)
old_version=$(version)
branch=$(git rev-parse --abbrev-ref HEAD)
log "Versión actual: v$old_version (rama $branch, commit $(git rev-parse --short HEAD))"

log "Buscando actualizaciones..."
git pull --ff-only || fail "no se pudo actualizar con git pull (¿la rama local tiene commits propios?)"

new_commit=$(git rev-parse HEAD)
if [ "$old_commit" = "$new_commit" ]; then
    log "El código ya estaba al día (v$old_version)"
else
    log "Código actualizado: v$old_version -> v$(version)"
    git log --oneline "$old_commit..$new_commit" | head -n 15
    # Configuración nueva: las copias propias (.env, application.yml) no se actualizan solas
    if ! git diff --quiet "$old_commit" "$new_commit" -- .env.example application.example.yml; then
        log "AVISO: cambiaron .env.example o application.example.yml. Comparalos con tu .env y application.yml por si hay opciones nuevas:"
        git diff --stat "$old_commit" "$new_commit" -- .env.example application.example.yml
    fi
fi

log "Bajando las imágenes nuevas de Lavalink, yt-cipher y spotify-tokener..."
docker compose pull --ignore-buildable

log "Reconstruyendo el bot y reiniciando lo que cambió..."
docker compose up -d --build --remove-orphans

# Las imágenes viejas del bot quedan sin etiqueta después de cada build y ocupan espacio
docker image prune -f >/dev/null

docker compose ps
log "Listo: corriendo v$(version). Para ver el arranque: docker compose logs -f discord-bot"
