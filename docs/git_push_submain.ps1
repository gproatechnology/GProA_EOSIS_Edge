<#
.SYNOPSIS
    GProA EDGE - Git Auto-Push to submain
#>

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       GProA EDGE - Git Auto-Push (submain)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$ROOT_DIR = Split-Path -Parent $SCRIPT_DIR

Push-Location $ROOT_DIR

Write-Host "[1/3] Agregando cambios..." -ForegroundColor Gray
git add .

$msg = Read-Host "Introduce el mensaje del commit (Enter para 'auto: updates')"
if ([string]::IsNullOrWhiteSpace($msg)) { $msg = "auto: updates" }

Write-Host "`n[2/3] Creando commit..." -ForegroundColor Gray
git commit -m $msg

Write-Host "`n[3/3] Subiendo a submain..." -ForegroundColor Gray
git push origin submain

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host "[OK] Cambios subidos exitosamente a submain." -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
} else {
    Write-Host "`n[ERROR] Hubo un problema al subir los cambios." -ForegroundColor Red
}

Pop-Location
Read-Host "`nPresiona Enter para salir"
