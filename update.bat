@echo off
rem Actualiza Araña Sound en Windows: baja la última versión del repo y reconstruye y reinicia los contenedores.
rem Uso: update.bat (doble clic o desde una terminal). En Linux/macOS: ./update.sh
rem No toca .env, application.yml ni data/ (no están en el repo).
setlocal EnableDelayedExpansion
chcp 65001 >nul
cd /d "%~dp0"

where git >nul 2>&1 || (call :fail "no se encontró git" & goto :end)
where docker >nul 2>&1 || (call :fail "no se encontró docker" & goto :end)

rem Con cambios propios en archivos del repo el pull podría pisarlos o fallar a la mitad: mejor frenar antes
set "DIRTY="
for /f "delims=" %%l in ('git status --porcelain --untracked-files^=no') do set "DIRTY=1"
if defined DIRTY (
    git status --short --untracked-files=no
    call :fail "hay cambios locales en archivos del repo, arriba. Guardalos con 'git stash' o descartalos y volvé a correr el script"
    goto :end
)

for /f %%c in ('git rev-parse HEAD') do set "OLD_COMMIT=%%c"
for /f %%c in ('git rev-parse --short HEAD') do set "OLD_SHORT=%%c"
for /f %%b in ('git rev-parse --abbrev-ref HEAD') do set "BRANCH=%%b"
call :version OLD_VERSION
echo [Update] Versión actual: v%OLD_VERSION% (rama %BRANCH%, commit %OLD_SHORT%)

echo [Update] Buscando actualizaciones...
git pull --ff-only || (call :fail "no se pudo actualizar con git pull: ¿la rama local tiene commits propios?" & goto :end)

for /f %%c in ('git rev-parse HEAD') do set "NEW_COMMIT=%%c"
call :version NEW_VERSION
if "%OLD_COMMIT%"=="%NEW_COMMIT%" (
    echo [Update] El código ya estaba al día: v%OLD_VERSION%
) else (
    echo [Update] Código actualizado: v%OLD_VERSION% -^> v%NEW_VERSION%
    git --no-pager log --oneline -n 15 %OLD_COMMIT%..%NEW_COMMIT%
    rem Configuración nueva: las copias propias, .env y application.yml, no se actualizan solas
    git diff --quiet %OLD_COMMIT% %NEW_COMMIT% -- .env.example application.example.yml
    if errorlevel 1 (
        echo [Update] AVISO: cambiaron .env.example o application.example.yml. Comparalos con tu .env y application.yml por si hay opciones nuevas:
        git --no-pager diff --stat %OLD_COMMIT% %NEW_COMMIT% -- .env.example application.example.yml
    )
)

echo [Update] Bajando las imágenes nuevas de Lavalink, yt-cipher y spotify-tokener...
docker compose pull --ignore-buildable || (call :fail "falló docker compose pull" & goto :end)

echo [Update] Reconstruyendo el bot y reiniciando lo que cambió...
docker compose up -d --build --remove-orphans || (call :fail "falló docker compose up" & goto :end)

rem Las imágenes viejas del bot quedan sin etiqueta después de cada build y ocupan espacio
docker image prune -f >nul

docker compose ps
echo [Update] Listo: corriendo v%NEW_VERSION%. Para ver el arranque: docker compose logs -f discord-bot
set "EXIT_CODE=0"
goto :end

:version
rem Lee "version" de package.json (la línea es:  "version": "3.3.1",)
for /f "tokens=2 delims=:, " %%v in ('findstr /c:"\"version\"" package.json') do (
    set "%1=%%~v"
    goto :eof
)
goto :eof

:fail
echo [Update] ERROR: %~1 1>&2
set "EXIT_CODE=1"
goto :eof

:end
rem Con doble clic la ventana se cerraría sin dejar leer el resultado
rem find con ruta completa: si Git agrega sus herramientas al PATH, "find" sería el de Unix
echo %cmdcmdline% | "%SystemRoot%\System32\find.exe" /i "/c" >nul && pause
exit /b %EXIT_CODE%
