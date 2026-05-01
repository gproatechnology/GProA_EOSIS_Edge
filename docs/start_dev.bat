@echo off
setlocal enabledelayedexpansion
title GProA EDGE - Development Launcher
color 0A

set "BACKEND_PORT=8000"
set "FRONTEND_PORT=3000"

set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%.."
set "ROOT_DIR=%CD%"
popd

call :check_deps
goto main_menu

:main_menu
cls
echo ========================================================
echo        GProA EDGE - Menu de Desarrollo
echo ========================================================
echo.
echo [INFO] Ruta: %ROOT_DIR%
echo.
call :check_services_status
echo.
echo  1. Iniciar Todo
echo  2. Iniciar Backend
echo  3. Iniciar Frontend
echo  4. Ver Estado
echo  5. Ver Logs
echo  6. Detener Servicios
echo  7. Diagnostico
echo  8. Salir
echo  9. Cargar Datos Mock (Seed)
echo.
set /p opt="Selecciona (1-9): "

if "%opt%"=="1" goto opt_1
if "%opt%"=="2" goto opt_2
if "%opt%"=="3" goto opt_3
if "%opt%"=="4" goto opt_4
if "%opt%"=="5" goto opt_5
if "%opt%"=="6" goto opt_6
if "%opt%"=="7" goto opt_7
if "%opt%"=="8" goto opt_8
if "%opt%"=="9" goto opt_9
goto main_menu

:opt_1
echo.
call :start_backend
timeout /t 2 /nobreak >nul
call :start_frontend
echo.
echo [OK] Servicios iniciados
pause
goto main_menu

:opt_2
call :start_backend
pause
goto main_menu

:opt_3
call :start_frontend
pause
goto main_menu

:opt_4
cls
call :check_services_status
pause
goto main_menu

:opt_5
cls
echo 1. Backend Logs
echo 2. Frontend Logs
set /p logopt="Selecciona: "
if "%logopt%"=="1" start "Backend Logs" /D "%ROOT_DIR%\backend" cmd /k "call venv\Scripts\activate.bat && uvicorn app.main:app --reload --port %BACKEND_PORT%"
if "%logopt%"=="2" start "Frontend Logs" /D "%ROOT_DIR%\frontend" cmd /k "npm start"
goto main_menu

:opt_6
echo.
echo [CAZADOR] Deteniendo servicios...
call :stop_all
echo [OK] Listo
pause
goto main_menu

:opt_7
cls
call :diagnostic
pause
goto main_menu

:opt_8
call :stop_all
exit

:check_deps
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python no encontrado
    pause
    exit 1
)
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js no encontrado
    pause
    exit 1
)
exit /b 0

:check_services_status
echo ========================================================
echo                 ESTADO DE SERVICIOS
echo ========================================================
call :check_service_detail %BACKEND_PORT% BACKEND
call :check_service_detail %FRONTEND_PORT% FRONTEND
echo.
call :check_backend_health
exit /b 0

:check_service_detail
set "PORT=%1"
set "NAME=%2"
set "PID="
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%PORT% "') do (
    set "PID=%%a"
)
if not defined PID (
    echo [%NAME%] Puerto %PORT%: LIBRE
    exit /b 0
)
echo [%NAME%] Puerto %PORT%: ACTIVO (PID: !PID!)
for /f "tokens=1,2,5" %%a in ('tasklist /FI "PID eq !PID!" ^| findstr !PID!') do (
    echo    Proceso: %%a
    echo    Memoria: %%b
)
exit /b 0

:check_backend_health
echo -------------------------------
echo   HEALTH CHECK BACKEND
echo -------------------------------
curl -s --max-time 2 http://localhost:%BACKEND_PORT%/api/ > "%TEMP%\temp_health.txt"
if %errorlevel% neq 0 (
    echo [BACKEND] No responde (Offline o iniciando...)
    if exist "%TEMP%\temp_health.txt" del "%TEMP%\temp_health.txt" >nul 2>&1
    exit /b 0
)
set /p response=<"%TEMP%\temp_health.txt"
if "%response%"=="" (
    echo [BACKEND] Sin respuesta valida
) else (
    echo [BACKEND] OK - API responde correctamente
)
if exist "%TEMP%\temp_health.txt" del "%TEMP%\temp_health.txt" >nul 2>&1
exit /b 0

:check_port
set "p=%1"
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%p% "') do exit /b 1
exit /b 0

:stop_all
echo.
echo [INFO] Iniciando cierre amigable de servicios...
:: 1. Intentar cerrar ventanas por titulo
taskkill /FI "WINDOWTITLE eq GProA EDGE*" /T >nul 2>&1

:: 2. Cerrar procesos especificos por puerto si aun existen
for %%p in (%BACKEND_PORT% %FRONTEND_PORT%) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%%p "') do (
        echo [INFO] Liberando puerto %%p (PID: %%a)...
        taskkill /F /PID %%a /T >nul 2>&1
    )
)
echo [OK] Servicios detenidos completamente.
exit /b 0

:diagnostic
echo ========================================================
echo                 DIAGNOSTICO AVANZADO
echo ========================================================
echo.
echo [1] Python:
python --version 2>&1
echo [2] Node:
node --version 2>&1
echo.
echo [3] Estado de Puertos:
call :check_service_detail %BACKEND_PORT% BACKEND
call :check_service_detail %FRONTEND_PORT% FRONTEND
echo.
echo [4] Health API:
call :check_backend_health
echo.
echo [5] Variables de Entorno:
echo     ROOT_DIR: %ROOT_DIR%
echo     BACKEND_PORT: %BACKEND_PORT%
echo     FRONTEND_PORT: %FRONTEND_PORT%
echo.
echo ========================================================
exit /b 0

:start_backend
set "bd=%ROOT_DIR%\backend"
if not exist "%bd%" (echo [ERROR] backend no existe & exit /b 1)

if exist "%bd%\venv" goto skip_venv
echo [INFO] Creando entorno virtual e instalando dependencias (esto tomara un momento)...
cd /d "%bd%"
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
:skip_venv

if not exist "%bd%\.env" (if exist "%ROOT_DIR%\.env.example" copy "%ROOT_DIR%\.env.example" "%bd%\.env" >nul)
echo.
echo [INFO] Iniciando Backend...
echo ========================================================
echo  Backend API : http://localhost:%BACKEND_PORT%/api
echo  Swagger Docs: http://localhost:%BACKEND_PORT%/docs
echo  ReDoc       : http://localhost:%BACKEND_PORT%/redoc
echo ========================================================
start "GProA EDGE - Backend" /D "%bd%" cmd /k "call venv\Scripts\activate.bat && uvicorn app.main:app --reload --port %BACKEND_PORT%"
exit /b 0

:start_frontend
set "fd=%ROOT_DIR%\frontend"
if not exist "%fd%" (echo [ERROR] frontend no existe & exit /b 1)

if exist "%fd%\node_modules" goto skip_node_modules
echo [INFO] Instalando dependencias con npm...
cd /d "%fd%"
call npm install
:skip_node_modules

start "GProA EDGE - Frontend" /D "%fd%" cmd /k "set REACT_APP_BACKEND_URL=http://localhost:%BACKEND_PORT%&& npm start"
exit /b 0

:opt_9
echo.
echo [INFO] Cargando datos mock en http://localhost:%BACKEND_PORT%/api/debug/seed...
echo [!] Asegurate de que el Backend este iniciado.
curl -s -X POST http://localhost:%BACKEND_PORT%/api/debug/seed
echo.
echo [OK] Proceso completado.
pause
goto main_menu