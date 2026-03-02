# UnifiedPOS Build & Installer Script
# Run this script to build the application and create the Windows installer
# Prerequisites:
#   - .NET 9 SDK
#   - Node.js 18+
#   - Inno Setup 6 (https://jrsoftware.org/isdl.php)

param(
    [switch]$SkipBuild,
    [switch]$SkipInstaller,
    [string]$Version = "1.0.0"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  UnifiedPOS Build & Installer Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build Angular Frontend
if (-not $SkipBuild) {
    Write-Host "[1/4] Building Angular frontend..." -ForegroundColor Yellow
    Push-Location "$ProjectRoot\src\Web\ClientApp"
    try {
        npm run build
        if ($LASTEXITCODE -ne 0) { throw "Angular build failed" }
        Write-Host "      Frontend build completed!" -ForegroundColor Green
    }
    finally {
        Pop-Location
    }

    # Step 2: Publish .NET Backend
    Write-Host "[2/4] Publishing .NET backend..." -ForegroundColor Yellow
    Push-Location "$ProjectRoot\src\Web"
    try {
        # Clean previous publish
        if (Test-Path "publish") {
            Remove-Item -Recurse -Force "publish" -ErrorAction SilentlyContinue
        }
        
        dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -o ./publish
        if ($LASTEXITCODE -ne 0) { throw ".NET publish failed" }
        
        # Copy appsettings
        Copy-Item "appsettings.json" "publish\" -Force
        
        Write-Host "      Backend publish completed!" -ForegroundColor Green
    }
    finally {
        Pop-Location
    }
} else {
    Write-Host "[1/4] Skipping frontend build..." -ForegroundColor DarkGray
    Write-Host "[2/4] Skipping backend publish..." -ForegroundColor DarkGray
}

# Step 3: Update version in installer script
Write-Host "[3/4] Updating version to $Version..." -ForegroundColor Yellow
$issContent = Get-Content "$ProjectRoot\installer.iss" -Raw
$issContent = $issContent -replace '#define MyAppVersion ".*"', "#define MyAppVersion `"$Version`""
Set-Content "$ProjectRoot\installer.iss" $issContent
Write-Host "      Version updated!" -ForegroundColor Green

# Step 4: Build Installer
if (-not $SkipInstaller) {
    Write-Host "[4/4] Building Windows installer..." -ForegroundColor Yellow
    
    # Create output directory
    $OutputDir = "$ProjectRoot\installer\output"
    if (-not (Test-Path $OutputDir)) {
        New-Item -ItemType Directory -Path $OutputDir | Out-Null
    }
    
    # Find Inno Setup compiler
    $InnoSetupPath = @(
        "C:\Program Files (x86)\Inno Setup 6\ISCC.exe",
        "C:\Program Files\Inno Setup 6\ISCC.exe",
        "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe",
        "${env:ProgramFiles}\Inno Setup 6\ISCC.exe"
    ) | Where-Object { Test-Path $_ } | Select-Object -First 1
    
    if (-not $InnoSetupPath) {
        Write-Host ""
        Write-Host "ERROR: Inno Setup 6 not found!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install Inno Setup 6 from:" -ForegroundColor Yellow
        Write-Host "  https://jrsoftware.org/isdl.php" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "After installation, run this script again." -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "      Using Inno Setup: $InnoSetupPath" -ForegroundColor DarkGray
    
    # Run Inno Setup compiler
    Push-Location $ProjectRoot
    try {
        & $InnoSetupPath "installer.iss"
        if ($LASTEXITCODE -ne 0) { throw "Inno Setup compilation failed" }
        Write-Host "      Installer created successfully!" -ForegroundColor Green
    }
    finally {
        Pop-Location
    }
} else {
    Write-Host "[4/4] Skipping installer build..." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "  Build Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Installer location:" -ForegroundColor White
Write-Host "  $ProjectRoot\installer\output\UnifiedPOS-Setup-$Version.exe" -ForegroundColor Cyan
Write-Host ""
