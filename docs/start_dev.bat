@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title GProA EDGE - Development Launcher
color 0A

:: ================= CONFIGURACIÓN UI =================
:: Códigos ANSI (coloress)
for /F "tokens=1,2 delims=#" %%a in ('"prompt #$H#$E# & echo on & for %%b in (1) do rem"') do (set "ESC=%%b")
set "RESET=%ESC%[0m"
set "BOLD=%ESC%[1m"
set "RED=%ESC%[91m"
set "GREEN=%ESC%[92m"
set "YELLOW=%ESC%[93m"
set "CYAN=%ESC%[96m"
set "WHITE=%ESC%[97m"
set "GRAY=%ESC%[90m"

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
    call :print_error "Dependencias faltantes. Pulsa una tecla para salir."
    pause > nul
    exit /b 1
)
goto main_menu

:: ================= MENÚ PRINCIPAL =================
:main_menu
cls
call :print_banner
call :print_info "Directorio: %ROOT_DIR%"
echo.
call :check_services_status
echo.
call :print_menu_item "1" "Iniciar Todo"
call :print_menu_item "2" "Iniciar Backend"
call :print_menu_item "3" "Iniciar Frontend"
call :print_menu_item "4" "Ver Estado"
call :print_menu_item "5" "Ver Logs"
call :print_menu_item "6" "Detener Servicios"
call :print_menu_item "7" "Diagnóstico"
call :print_menu_item "8" "Limpiar y Reiniciar (venv / node_modules)"
call :print_menu_item "9" "Cargar Datos Mock (Seed)"
call :print_menu_item "0" "Salir"
echo.
set /p "opt=%CYAN%Selecciona (0-9): %RESET%"
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
call :print_submenu "Visualización de Logs"
call :print_menu_item "1" "Ver log del Backend"
call :print_menu_item "2" "Ver log del Frontend"
call :print_menu_item "3" "Ver ambos (split screen)"
call :print_menu_item "4" "Volver"
echo.
set /p "logopt=%CYAN%Opción: %RESET%"
if "%logopt%"=="1" (
    if exist "%BACKEND_LOG%" ( more "%BACKEND_LOG%" ) else ( call :print_warning "No hay log aún. Inicia el backend primero." )
    pause
    goto view_logs
)
if "%logopt%"=="2" (
    if exist "%FRONTEND_LOG%" ( more "%FRONTEND_LOG%" ) else ( call :print_warning "No hay log aún. Inicia el frontend primero." )
    pause
    goto view_logs
)
if "%logopt%"=="3" (
    echo.
    call :print_info "Mostrando ambos logs (presiona Ctrl+C para salir)..."
    start "Backend Log" cmd /k "type "%BACKEND_LOG%" 2>nul || echo [Backend] Sin log"
    start "Frontend Log" cmd /k "type "%FRONTEND_LOG%" 2>nul || echo [Frontend] Sin log"
    pause
)
goto main_menu

:opt_6
echo.
call :print_info "Deteniendo todos los servicios..."
call :stop_all
call :print_success "Todos los servicios detenidos."
pause
goto main_menu

:opt_7
cls
call :diagnostic
pause
goto main_menu

:opt_8
echo.
call :print_warning "Esto eliminará venv y node_modules y los recreará."
set /p "confirm=%CYAN%¿Continuar? (s/N): %RESET%"
if /i not "!confirm!"=="s" goto main_menu
call :stop_all
call :print_info "Eliminando venv..."
if exist "%ROOT_DIR%\backend\venv" rmdir /s /q "%ROOT_DIR%\backend\venv"
call :print_info "Eliminando node_modules..."
if exist "%ROOT_DIR%\frontend\node_modules" rmdir /s /q "%ROOT_DIR%\frontend\node_modules"
call :print_success "Limpieza completada."
pause
goto main_menu

:opt_9
call :seed_data
pause
goto main_menu

:opt_0
call :stop_all
exit /b 0

:: ================= FUNCIONES UI =================
:print_banner
set "line="
for /l %%i in (1,1,55) do set "line=!line!="
echo %CYAN%╔═══════════════════════════════════════════════════════╗%RESET%
echo %CYAN%║%RESET%       %BOLD%G P r o A   E D G E   -   M E N Ú   D E   D E S A R R O L L O%RESET%       %CYAN%║%RESET%
echo %CYAN%╚═══════════════════════════════════════════════════════╝%RESET%
exit /b

:print_submenu
set "title=%~1"
echo %CYAN%┌─────────────────────────────────────────────────────┐%RESET%
echo %CYAN%│%RESET%  %BOLD%%title%%RESET%
echo %CYAN%└─────────────────────────────────────────────────────┘%RESET%
exit /b

:print_menu_item
set "num=%~1"
set "desc=%~2"
echo   %GREEN%[%num%]%RESET% %desc%
exit /b

:print_success
echo %GREEN%✓%RESET% %*
exit /b

:print_error
echo %RED%✗%RESET% %*
exit /b

:print_warning
echo %YELLOW%⚠%RESET% %*
exit /b

:print_info
echo %CYAN%ℹ%RESET% %*
exit /b

:print_separator
echo %GRAY%──────────────────────────────────────────────────────%RESET%
exit /b

:print_status_ok
echo %GREEN%● ACTIVO%RESET% %*
exit /b

:print_status_ko
echo %RED%○ INACTIVO%RESET% %*
exit /b

:: ================= FUNCIONES LÓGICAS (sin cambios relevantes) =================
:check_deps
python --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Python no está instalado o no está en PATH."
    exit /b 1
)
node --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Node.js no está instalado o no está en PATH."
    exit /b 1
)
where curl >nul 2>&1
if errorlevel 1 (
    call :print_warning "curl no encontrado. Se usará PowerShell para health checks."
)
exit /b 0

:check_services_status
echo %CYAN%┌───────────────────── ESTADO DE SERVICIOS ─────────────────────┐%RESET%
call :check_service_detail %BACKEND_PORT% BACKEND
call :check_service_detail %FRONTEND_PORT% FRONTEND
echo %CYAN%├───────────────────────────────────────────────────────────────┤%RESET%
call :check_backend_health
echo %CYAN%└───────────────────────────────────────────────────────────────┘%RESET%
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
    call :print_status_ko "[%name%] Puerto %port% libre"
    exit /b 0
)
call :print_status_ok "[%name%] Puerto %port% activo (PID: !pid!)"
for /f "tokens=1,2,5" %%a in ('tasklist /FI "PID eq !pid!" /NH 2^>nul ^| findstr /i "!pid!"') do (
    echo           Proceso: %%a   Memoria: %%b
)
exit /b 0

:check_backend_health
set "health_url=http://localhost:%BACKEND_PORT%/api/"
where curl >nul 2>&1
if %errorlevel% equ 0 (
    curl -s --max-time 3 "%health_url%" >nul 2>&1
    if %errorlevel% equ 0 ( call :print_success "BACKEND Health Check: OK" ) else ( call :print_warning "BACKEND Health Check: No responde o iniciando" )
) else (
    powershell -Command "try { (Invoke-WebRequest -Uri '%health_url%' -TimeoutSec 3).StatusCode -eq 200 } catch { $false }" >nul 2>&1
    if %errorlevel% equ 0 ( call :print_success "BACKEND Health Check: OK" ) else ( call :print_warning "BACKEND Health Check: No responde o iniciando" )
)
exit /b 0

:start_backend
set "bd=%ROOT_DIR%\backend"
if not exist "%bd%" (
    call :print_error "Carpeta backend no encontrada en %bd%"
    exit /b 1
)

if not exist "%bd%\venv" (
    call :print_info "Creando entorno virtual..."
    cd /d "%bd%"
    python -m venv venv
    if errorlevel 1 (
        call :print_error "Falló creación de venv."
        exit /b 1
    )
    call :print_info "Instalando dependencias (puede tardar)..."
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    if errorlevel 1 (
        call :print_error "Falló instalación de dependencias."
        exit /b 1
    )
)

if not exist "%bd%\.env" (
    if exist "%ROOT_DIR%\.env.example" (
        copy "%ROOT_DIR%\.env.example" "%bd%\.env" >nul
        call :print_success ".env creado desde raíz/.env.example"
    ) else if exist "%bd%\.env.example" (
        copy "%bd%\.env.example" "%bd%\.env" >nul
        call :print_success ".env creado desde backend/.env.example"
    ) else (
        call :print_warning "No se encontró .env.example. Creando .env básico."
        echo BACKEND_PORT=%BACKEND_PORT% > "%bd%\.env"
    )
)

call :is_port_in_use %BACKEND_PORT%
if not errorlevel 1 (
    call :print_error "El puerto %BACKEND_PORT% ya está en uso. Detén el servicio primero."
    exit /b 1
)

echo.
call :print_info "Iniciando Backend..."
echo %CYAN%═══════════════════════════════════════════════════════════════%RESET%
call :print_info "API Base : http://localhost:%BACKEND_PORT%/api"
call :print_info "Swagger  : http://localhost:%BACKEND_PORT%/docs"
call :print_info "ReDoc    : http://localhost:%BACKEND_PORT%/redoc"
echo %CYAN%═══════════════════════════════════════════════════════════════%RESET%
start "GProA EDGE - Backend" /D "%bd%" cmd /c "call venv\Scripts\activate.bat && uvicorn app.main:app --reload --port %BACKEND_PORT% > "%BACKEND_LOG%" 2>&1"
if errorlevel 1 (
    call :print_error "No se pudo iniciar el backend."
    exit /b 1
)
call :print_success "Backend lanzado (log en %BACKEND_LOG%)"
exit /b 0

:start_frontend
set "fd=%ROOT_DIR%\frontend"
if not exist "%fd%" (
    call :print_error "Carpeta frontend no encontrada en %fd%"
    exit /b 1
)

if not exist "%fd%\node_modules" (
    call :print_info "Instalando dependencias frontend (npm install)..."
    cd /d "%fd%"
    call npm install
    if errorlevel 1 (
        call :print_error "Falló npm install."
        exit /b 1
    )
)

call :is_port_in_use %FRONTEND_PORT%
if not errorlevel 1 (
    call :print_error "El puerto %FRONTEND_PORT% ya está en uso. Detén el servicio primero."
    exit /b 1
)

echo.
call :print_info "Iniciando Frontend (React)..."
start "GProA EDGE - Frontend" /D "%fd%" cmd /c "set REACT_APP_BACKEND_URL=http://localhost:%BACKEND_PORT%/ && npm start > "%FRONTEND_LOG%" 2>&1"
if errorlevel 1 (
    call :print_error "No se pudo iniciar el frontend."
    exit /b 1
)
call :print_success "Frontend lanzado (log en %FRONTEND_LOG%)"
exit /b 0

:is_port_in_use
set "p=%1"
netstat -aon 2>nul | findstr /r ":%p%[^0-9]" >nul
if %errorlevel% equ 0 ( exit /b 0 ) else ( exit /b 1 )

:stop_all
call :print_info "Deteniendo procesos GProA EDGE..."
taskkill /FI "WINDOWTITLE eq GProA EDGE - Backend" /T >nul 2>&1
taskkill /FI "WINDOWTITLE eq GProA EDGE - Frontend" /T >nul 2>&1
timeout /t 1 /nobreak >nul
for %%p in (%BACKEND_PORT% %FRONTEND_PORT%) do (
    for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr /r ":%%p[^0-9]"') do (
        echo   Matando PID %%a (puerto %%p)
        taskkill /F /PID %%a >nul 2>&1
    )
)
if exist "%BACKEND_LOG%" move "%BACKEND_LOG%" "%BACKEND_LOG%.old" >nul 2>&1
if exist "%FRONTEND_LOG%" move "%FRONTEND_LOG%" "%FRONTEND_LOG%.old" >nul 2>&1
exit /b 0

:diagnostic
call :print_banner
echo %CYAN%┌───────────────────── DIAGNÓSTICO AVANZADO ────────────────────┐%RESET%
echo %CYAN%│%RESET%                                                               %CYAN%│%RESET%
call :print_info "Versiones:"
python --version 2>&1 | findstr /v "^$" > con
node --version 2>&1 | findstr /v "^$" > con
echo %CYAN%│%RESET%                                                               %CYAN%│%RESET%
call :print_info "Estado de puertos:"
call :check_service_detail %BACKEND_PORT% BACKEND
call :check_service_detail %FRONTEND_PORT% FRONTEND
echo %CYAN%│%RESET%                                                               %CYAN%│%RESET%
call :print_info "Health API:"
call :check_backend_health
echo %CYAN%│%RESET%                                                               %CYAN%│%RESET%
call :print_info "Variables de entorno:"
echo     ROOT_DIR = %ROOT_DIR%
echo     BACKEND_PORT = %BACKEND_PORT%
echo     FRONTEND_PORT = %FRONTEND_PORT%
echo     LOG_DIR = %LOG_DIR%
echo %CYAN%│%RESET%                                                               %CYAN%│%RESET%
call :print_info "Espacio en disco:"
dir "%ROOT_DIR%" | findstr "bytes free"
echo %CYAN%│%RESET%                                                               %CYAN%│%RESET%
call :print_info "Errores recientes en logs (últimas 5 líneas):"
if exist "%BACKEND_LOG%" ( echo --- Backend log --- & powershell -Command "Get-Content '%BACKEND_LOG%' -Tail 5" 2>nul )
if exist "%FRONTEND_LOG%" ( echo --- Frontend log --- & powershell -Command "Get-Content '%FRONTEND_LOG%' -Tail 5" 2>nul )
echo %CYAN%└───────────────────────────────────────────────────────────────┘%RESET%
exit /b 0

:seed_data
echo.
call :print_info "Cargando datos mock en http://localhost:%BACKEND_PORT%/api/debug/seed..."
call :check_backend_health | findstr "OK" >nul
if errorlevel 1 (
    call :print_error "El backend no está disponible. Inícialo primero."
    exit /b 1
)
where curl >nul 2>&1
if %errorlevel% equ 0 (
    curl -s -X POST http://localhost:%BACKEND_PORT%/api/debug/seed
    if %errorlevel% equ 0 ( call :print_success "Datos cargados exitosamente" ) else ( call :print_error "Falló la carga. Revisa logs." )
) else (
    powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:%BACKEND_PORT%/api/debug/seed' -Method POST -UseBasicParsing } catch { Write-Host 'ERROR' }"
    call :print_success "Comando ejecutado (verificar manualmente)"
)
exit /b 0