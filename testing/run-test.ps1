# =============================================================================
# UnifiedPOS Test Launcher
# Run this on YOUR machine to launch the sandbox test
# =============================================================================

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  UnifiedPOS - Clean Machine Test Launcher" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Windows Sandbox is enabled (avoiding Get-WindowsOptionalFeature to prevent admin errors)
$sandboxExe = Join-Path $env:windir "System32\WindowsSandbox.exe"
$sandboxEnabled = Test-Path $sandboxExe

if (-not $sandboxEnabled) {
    Write-Host "Windows Sandbox does not appear to be enabled on your system." -ForegroundColor Red
    Write-Host ""
    Write-Host "To enable it, run this command in an Administrator PowerShell:" -ForegroundColor Yellow
    Write-Host '  Enable-WindowsOptionalFeature -Online -FeatureName "Containers-DisposableClientVM" -All -NoRestart' -ForegroundColor White
    Write-Host ""
    
    $enable = Read-Host "Would you like to enable it now? (Y/N)"
    if ($enable -eq "Y" -or $enable -eq "y") {
        Write-Host "Enabling Windows Sandbox (requires admin prompt)..." -ForegroundColor Cyan
        Start-Process powershell.exe -Verb RunAs -ArgumentList '-NoProfile -Command "Enable-WindowsOptionalFeature -Online -FeatureName Containers-DisposableClientVM -All -NoRestart; Write-Host ''Feature enabled!''; Read-Host ''Press Enter to close this window, then RESTART your computer''"'
        Write-Host "Please restart your computer after the feature is enabled." -ForegroundColor Yellow
    }
    exit 1
}

# Check installer exists
$installerDir = Join-Path $PSScriptRoot "..\installer\output"
$installer = Get-ChildItem -Path $installerDir -Filter "UnifiedPOS-Setup-*.exe" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if (-not $installer) {
    Write-Host "No installer found in: $installerDir" -ForegroundColor Red
    Write-Host "Please build the installer first using: .\build-installer.ps1 -Version ""x.x.x""" -ForegroundColor Yellow
    exit 1
}

Write-Host "Installer: $($installer.Name)" -ForegroundColor Green
Write-Host "Size: $([math]::Round($installer.Length / 1MB, 1)) MB" -ForegroundColor Gray
Write-Host ""
Write-Host "This will open a Windows Sandbox (a clean, disposable Windows VM)" -ForegroundColor White
Write-Host "and automatically run the installer + test suite inside it." -ForegroundColor White
Write-Host ""
Write-Host "What the test does:" -ForegroundColor Yellow
Write-Host "  1. Verifies there's no SQL Server pre-installed (clean machine)" -ForegroundColor Gray
Write-Host "  2. Runs the UnifiedPOS installer silently" -ForegroundColor Gray
Write-Host "  3. Verifies all files are installed correctly" -ForegroundColor Gray
Write-Host "  4. Checks Start Menu shortcuts and firewall rules" -ForegroundColor Gray
Write-Host "  5. Starts the application and tests the HTTP endpoint" -ForegroundColor Gray
Write-Host "  6. Tests the health check endpoint" -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "Launch sandbox test? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Launching Windows Sandbox..." -ForegroundColor Cyan
Write-Host "Watch the sandbox window for test results!" -ForegroundColor Yellow
Write-Host ""

$wsbFile = Join-Path $PSScriptRoot "UnifiedPOS-Test.wsb"
Start-Process $wsbFile
