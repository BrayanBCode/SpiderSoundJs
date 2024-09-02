@echo off

:: Cambiar al disco correcto
%~d0
cd /d "%~dp0"

echo Creando/activando el entorno virtual y instalando las dependencias...
pipenv install

if %errorlevel% neq 0 (
    echo Error al crear el entorno o instalar las dependencias.
    pause
    exit /b 1
)

echo Dependencias instaladas correctamente.

echo Ejecutando el bot...
pipenv run python src/index.py

if %errorlevel% neq 0 (
    echo Error al ejecutar el bot.
    pause
    exit /b 1
)

echo Bot ejecutado correctamente.
pause
