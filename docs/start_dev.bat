@echo off
setlocal enabledelayedexpansion
title GProA EDGE - Development Launcher
color 0A

:: ================= CONFIGURACIÓN =================
set "BACKEND_PORT=8000"
set "FRONTEND_PORT=3000"
set "LOG_DIR=%~dp0logs"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
set "BACKEND_LOG=%LOG_DIR%\backend.log"
set "FRONTEND_LOG=%LOG_DIR%\frontend.log"

:: Obtener ruta raíz (directorio superior al del script)
set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%.."
set "ROOT_DIR=%CD%"
popd

:: ================= INICIO =================
call :check_deps
if errorlevel 1 (
    echo [ERROR] Dependencias faltantes. Pulsa una tecla para salir.
    pause > nul
    exit /b 1
)
goto main_menu

:: ================= MENÚ PRINCIPAL =================
:main_menu
cls
echo.
echo  ====================================================
echo         G P r o A   E D G E   -   M E N Ú
echo  ====================================================
echo   Directorio: %ROOT_DIR%
echo.
call :check_services_status
echo.
echo   1. Iniciar Todo
echo   2. Iniciar Backend
echo   3. Iniciar Frontend
echo   4. Ver Estado
echo   5. Ver Logs
echo   6. Detener Servicios
echo   7. Diagnóstico
echo   8. Limpiar y Reiniciar (venv / node_modules)
echo   9. Cargar Datos Mock (Seed)
echo   0. Salir
echo.
set /p "opt=Selecciona (0-9): "
echo.

if "%opt%"=="1" goto opt_1
if "%opt%"=="2" goto opt_2
if "%opt%"=="3" goto opt_3
if "%opt%"=="4" goto opt_4
if "%opt%"=="5" goto opt_5
if "%opt%"=="6" goto opt_6
if "%opt%"=="7" goto opt_7
if "%opt%"=="8" goto opt_8
if "%opt%"=="9" goto opt_9
if "%opt%"=="0" goto opt_0
goto main_menu

:opt_1
call :start_backend
if errorlevel 1 goto :eof
timeout /t 2 /nobreak >nul
call :start_frontend
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
:view_logs
cls
echo.
echo  1. Ver log del Backend
echo  2. Ver log del Frontend
echo  3. Ver ambos (split screen)
echo  4. Volver
echo.
set /p "logopt=Opción: "
if "%logopt%"=="1" (
    if exist "%BACKEND_LOG%" ( more "%BACKEND_LOG%" ) else ( echo [INFO] No hay log aún. Inicia el backend primero. )
    pause
    goto view_logs
)
if "%logopt%"=="2" (
    if exist "%FRONTEND_LOG%" ( more "%FRONTEND_LOG%" ) else ( echo [INFO] No hay log aún. Inicia el frontend primero. )
    pause
    goto view_logs
)
if "%logopt%"=="3" (
    echo Mostrando ambos logs (presiona Ctrl+C para salir)...
    start "Backend Log" cmd /k "type "%BACKEND_LOG%" 2>nul || echo [Backend] Sin log"
    start "Frontend Log" cmd /k "type "%FRONTEND_LOG%" 2>nul || echo [Frontend] Sin log"
    pause
)
goto main_menu

:opt_6
echo.
echo [CAZADOR] Deteniendo todos los servicios...
call :stop_all
echo [OK] Todos los servicios detenidos.
pause
goto main_menu

:opt_7
cls
call :diagnostic
pause
goto main_menu

:opt_8
echo.
echo [ADVERTENCIA] Esto eliminará venv y node_modules y los recreará.
set /p "confirm=¿Continuar? (s/N): "
if /i not "!confirm!"=="s" goto main_menu
call :stop_all
echo Eliminando venv...
if exist "%ROOT_DIR%\backend\venv" rmdir /s /q "%ROOT_DIR%\backend\venv"
echo Eliminando node_modules...
if exist "%ROOT_DIR%\frontend\node_modules" rmdir /s /q "%ROOT_DIR%\frontend\node_modules"
echo Limpieza completada.
pause
goto main_menu

:opt_9
call :seed_data
pause
goto main_menu

:opt_0
call :stop_all
exit /b 0

:: ================= FUNCIONES =================

:check_deps
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python no está instalado o no está en PATH.
    exit /b 1
)
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js no está instalado o no está en PATH.
    exit /b 1
)
:: Verificar curl (opcional)
where curl >nul 2>&1
if errorlevel 1 (
    echo [WARN] curl no encontrado. Se usará PowerShell para health checks.
)
exit /b 0

:check_services_status
echo ====================================================
echo                ESTADO DE SERVICIOS
echo ====================================================
call :check_service_detail %BACKEND_PORT% BACKEND
call :check_service_detail %FRONTEND_PORT% FRONTEND
echo.
call :check_backend_health
exit /b 0

:check_service_detail
set "port=%1"
set "name=%2"
set "pid="
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr /r ":%port%[^0-9]"') do (
    set "pid=%%a"
    goto :found
)
:found
if not defined pid (
    echo [%name%] Puerto %port%: LIBRE
    exit /b 0
)
echo [%name%] Puerto %port%: ACTIVO (PID: !pid!)
for /f "tokens=1,2,5" %%a in ('tasklist /FI "PID eq !pid!" /NH 2^>nul ^| findstr /i "!pid!"') do (
    echo    Proceso: %%a
    echo    Memoria: %%b
)
exit /b 0

:check_backend_health
echo -------------------------------
echo   HEALTH CHECK BACKEND
echo -------------------------------
set "health_url=http://localhost:%BACKEND_PORT%/api"
where curl >nul 2>&1
if %errorlevel% equ 0 (
    curl -s --max-time 3 "%health_url%" >nul 2>&1
    if %errorlevel% equ 0 ( echo [BACKEND] OK - API responde ) else ( echo [BACKEND] No responde o iniciando )
) else (
    powershell -Command "try { (Invoke-WebRequest -Uri '%health_url%' -TimeoutSec 3).StatusCode -eq 200 } catch { $false }" >nul 2>&1
    if %errorlevel% equ 0 ( echo [BACKEND] OK - API responde ) else ( echo [BACKEND] No responde o iniciando )
)
exit /b 0

:start_backend
set "bd=%ROOT_DIR%\backend"
if not exist "%bd%" (
    echo [ERROR] Carpeta backend no encontrada en %bd%
    exit /b 1
)

:: Crear entorno virtual si no existe
if not exist "%bd%\venv" (
    echo [INFO] Creando entorno virtual...
    cd /d "%bd%"
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Falló creación de venv.
        exit /b 1
    )
    echo [INFO] Instalando dependencias (puede tardar)...
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERROR] Falló instalación de dependencias.
        exit /b 1
    )
)

:: Configurar .env si no existe
if not exist "%bd%\.env" (
    if exist "%ROOT_DIR%\.env.example" (
        copy "%ROOT_DIR%\.env.example" "%bd%\.env" >nul
        echo [INFO] .env creado desde raíz/.env.example
    ) else if exist "%bd%\.env.example" (
        copy "%bd%\.env.example" "%bd%\.env" >nul
        echo [INFO] .env creado desde backend/.env.example
    ) else (
        echo [WARN] No se encontró .env.example. Creando .env básico.
        echo BACKEND_PORT=%BACKEND_PORT% > "%bd%\.env"
    )
)

:: Verificar si el puerto ya está en uso
call :is_port_in_use %BACKEND_PORT%
if not errorlevel 1 (
    echo [ERROR] El puerto %BACKEND_PORT% ya está en uso. Detén el servicio primero.
    exit /b 1
)

echo.
echo [INFO] Iniciando Backend...
echo ====================================================
echo  API Base : http://localhost:%BACKEND_PORT%/api
echo  Swagger  : http://localhost:%BACKEND_PORT%/docs
echo  ReDoc    : http://localhost:%BACKEND_PORT%/redoc
echo ====================================================
start "GProA EDGE - Backend" /D "%bd%" cmd /c "call venv\Scripts\activate.bat && uvicorn app.main:app --reload --port %BACKEND_PORT% > "%BACKEND_LOG%" 2>&1"
if errorlevel 1 (
    echo [ERROR] No se pudo iniciar el backend.
    exit /b 1
)
echo [OK] Backend lanzado (log en %BACKEND_LOG%)
exit /b 0

:start_frontend
set "fd=%ROOT_DIR%\frontend"
if not exist "%fd%" (
    echo [ERROR] Carpeta frontend no encontrada en %fd%
    exit /b 1
)

:: Instalar node_modules si no existen
if not exist "%fd%\node_modules" (
    echo [INFO] Instalando dependencias frontend (npm install)...
    cd /d "%fd%"
    call npm install
    if errorlevel 1 (
        echo [ERROR] Falló npm install.
        exit /b 1
    )
)

:: Verificar puerto
call :is_port_in_use %FRONTEND_PORT%
if not errorlevel 1 (
    echo [ERROR] El puerto %FRONTEND_PORT% ya está en uso. Detén el servicio primero.
    exit /b 1
)

echo.
echo [INFO] Iniciando Frontend (React)...
start "GProA EDGE - Frontend" /D "%fd%" cmd /c "set "REACT_APP_BACKEND_URL=http://localhost:%BACKEND_PORT%/" && npm start > "%FRONTEND_LOG%" 2>&1"
if errorlevel 1 (
    echo [ERROR] No se pudo iniciar el frontend.
    exit /b 1
)
echo [OK] Frontend lanzado (log en %FRONTEND_LOG%)
exit /b 0

:is_port_in_use
:: Retorna errorlevel 1 si el puerto está libre, 0 si está ocupado
set "p=%1"
netstat -aon 2>nul | findstr /r ":%p%[^0-9]" >nul
if %errorlevel% equ 0 (
    exit /b 0  ; ocupado
) else (
    exit /b 1  ; libre
)

:stop_all
echo [INFO] Deteniendo procesos GProA EDGE...
:: Matar por título de ventana
taskkill /FI "WINDOWTITLE eq GProA EDGE - Backend" /T >nul 2>&1
taskkill /FI "WINDOWTITLE eq GProA EDGE - Frontend" /T >nul 2>&1
:: Esperar un poco
timeout /t 1 /nobreak >nul
:: Matar por puerto por si quedaron procesos sin ventana
for %%p in (%BACKEND_PORT% %FRONTEND_PORT%) do (
    for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr /r ":%%p[^0-9]"') do (
        echo   Matando PID %%a (puerto %%p)
        taskkill /F /PID %%a >nul 2>&1
    )
)
:: Limpiar logs viejos (opcional, mantener último inicio)
if exist "%BACKEND_LOG%" move "%BACKEND_LOG%" "%BACKEND_LOG%.old" >nul 2>&1
if exist "%FRONTEND_LOG%" move "%FRONTEND_LOG%" "%FRONTEND_LOG%.old" >nul 2>&1
exit /b 0

:diagnostic
echo ====================================================
echo              DIAGNÓSTICO AVANZADO
echo ====================================================
echo [1] Versiones de Python y Node:
python --version 2>&1
node --version 2>&1
echo.
echo [2] Estado de puertos:
call :check_service_detail %BACKEND_PORT% BACKEND
call :check_service_detail %FRONTEND_PORT% FRONTEND
echo.
echo [3] Health API:
call :check_backend_health
echo.
echo [4] Variables de entorno:
echo     ROOT_DIR = %ROOT_DIR%
echo     BACKEND_PORT = %BACKEND_PORT%
echo     FRONTEND_PORT = %FRONTEND_PORT%
echo     LOG_DIR = %LOG_DIR%
echo.
echo [5] Espacio en disco:
dir "%ROOT_DIR%" | findstr "bytes free"
echo.
echo [6] Errores recientes en logs (últimas 5 líneas):
if exist "%BACKEND_LOG%" ( echo --- Backend log --- & powershell -Command "Get-Content '%BACKEND_LOG%' -Tail 5" 2>nul )
if exist "%FRONTEND_LOG%" ( echo --- Frontend log --- & powershell -Command "Get-Content '%FRONTEND_LOG%' -Tail 5" 2>nul )
echo ====================================================
exit /b 0

:seed_data
echo.
echo [INFO] Cargando datos mock en http://localhost:%BACKEND_PORT%/api/debug/seed...
call :check_backend_health | findstr "OK" >nul
if errorlevel 1 (
    echo [ERROR] El backend no está disponible. Inícialo primero.
    exit /b 1
)
where curl >nul 2>&1
if %errorlevel% equ 0 (
    curl -s -X POST http://localhost:%BACKEND_PORT%/api/debug/seed
    if %errorlevel% equ 0 ( echo [OK] Datos cargados exitosamente ) else ( echo [ERROR] Falló la carga. Revisa logs. )
) else (
    powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:%BACKEND_PORT%/api/debug/seed' -Method POST -UseBasicParsing } catch { Write-Host 'ERROR' }"
    echo [OK] Comando ejecutado (verificar manualmente)
)
exit /b 0