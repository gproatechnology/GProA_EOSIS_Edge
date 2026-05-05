@echo off
setlocal enabledelayedexpansion
title GProA EDGE - Auto Push to Submain
color 0B

echo ========================================================
echo        GProA EDGE - Git Auto-Push (submain)
echo ========================================================
echo.

:: Obtener ruta raiz
set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%.."

echo [1/3] Agregando cambios...
git add .

echo.
set /p "msg=Introduce el mensaje del commit (Enter para 'auto: updates'): "
if "!msg!"=="" set "msg=auto: updates"

echo.
echo [2/3] Creando commit...
git commit -m "!msg!"

echo.
echo [3/3] Subiendo a submain...
git push origin submain

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo [OK] Cambios subidos exitosamente a submain.
    echo ========================================================
) else (
    echo.
    echo [ERROR] Hubo un problema al subir los cambios.
)

popd
pause
