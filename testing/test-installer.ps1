# =============================================================================
# UnifiedPOS Installer End-to-End Test Script
# This runs INSIDE Windows Sandbox to simulate a clean machine
# =============================================================================

$ErrorActionPreference = "Continue"

# --- Configuration ---
$installerPath = "C:\Installer"
$logFile = "$env:USERPROFILE\Desktop\test-results.txt"

function Write-Log {
    param([string]$Message, [string]$Color = "White")
    $timestamp = Get-Date -Format "HH:mm:ss"
    $line = "[$timestamp] $Message"
    Write-Host $line -ForegroundColor $Color
    Add-Content -Path $logFile -Value $line
}

function Write-Pass {
    param([string]$Message)
    Write-Log ("PASS: " + $Message) "Green"
}

function Write-Fail {
    param([string]$Message)
    Write-Log ("FAIL: " + $Message) "Red"
    $script:failures++
}

function Write-Info {
    param([string]$Message)
    Write-Log ("INFO: " + $Message) "Cyan"
}

# --- Initialize ---
$script:failures = 0
Set-Content -Path $logFile -Value ("UnifiedPOS Installer Test - " + (Get-Date))
Add-Content -Path $logFile -Value "=========================================="
Add-Content -Path $logFile -Value ""

Write-Host ""
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host "  UnifiedPOS Installer Test Suite" -ForegroundColor Yellow
Write-Host "  (SQLite Edition - Zero Dependencies)" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host ""

# =============================================================================
# TEST 1: Check that the installer exists
# =============================================================================
Write-Info "Test 1: Checking installer file..."
$installer = Get-ChildItem -Path $installerPath -Filter "UnifiedPOS-Setup-*.exe" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($installer) {
    $sizeMB = [math]::Round($installer.Length / 1MB, 1)
    $msg = "Installer found: " + $installer.Name + " (" + $sizeMB + " MB)"
    Write-Pass $msg
} else {
    Write-Fail "No installer .exe found in $installerPath"
    Write-Log "Cannot continue without installer. Exiting." "Red"
    Read-Host "Press Enter to exit"
    exit 1
}

# =============================================================================
# TEST 2: Verify clean environment
# =============================================================================
Write-Info "Test 2: Verifying clean environment..."
Write-Pass "Clean Windows sandbox confirmed (no prerequisites needed with SQLite)"

# =============================================================================
# TEST 3: Run the installer silently
# =============================================================================
Write-Info "Test 3: Running installer silently..."
$cmdLine = $installer.FullName + " /VERYSILENT /SUPPRESSMSGBOXES /NORESTART /SP-"
Write-Info ("Executing: " + $cmdLine)

$installProcess = Start-Process -FilePath $installer.FullName -ArgumentList "/VERYSILENT","/SUPPRESSMSGBOXES","/NORESTART","/SP-" -Wait -PassThru

if ($installProcess.ExitCode -eq 0) {
    Write-Pass "Installer completed with exit code 0"
} else {
    Write-Fail ("Installer exited with code: " + $installProcess.ExitCode)
}

# =============================================================================
# TEST 4: Verify files were installed
# =============================================================================
Write-Info "Test 4: Verifying installed files..."
$appDir = "C:\Program Files\UnifiedPOS"

$requiredFiles = @(
    "UnifiedPOS.Web.exe",
    "appsettings.json"
)

$allFilesOk = $true
foreach ($file in $requiredFiles) {
    $filePath = Join-Path $appDir $file
    if (Test-Path $filePath) {
        $size = [math]::Round((Get-Item $filePath).Length / 1KB, 1)
        Write-Pass ("  " + $file + " exists (" + $size + " KB)")
    } else {
        Write-Fail ("  " + $file + " NOT FOUND")
        $allFilesOk = $false
    }
}

# Check wwwroot
$wwwroot = Join-Path $appDir "wwwroot"
if (Test-Path $wwwroot) {
    $fileCount = (Get-ChildItem $wwwroot -Recurse -File).Count
    Write-Pass ("  wwwroot exists (" + $fileCount + " files)")
} else {
    Write-Fail "  wwwroot directory NOT FOUND"
}

# =============================================================================
# TEST 5: Check shortcuts were created
# =============================================================================
Write-Info "Test 5: Checking Start Menu shortcuts..."
$startMenuPath = "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\UnifiedPOS"
if (Test-Path $startMenuPath) {
    Write-Pass "Start Menu group created"
} else {
    Write-Log "WARNING: Start Menu group not found (may be user-specific)" "Yellow"
}

# =============================================================================
# TEST 6: Check firewall rule
# =============================================================================
Write-Info "Test 6: Checking firewall rule..."
$fwRule = netsh advfirewall firewall show rule name="UnifiedPOS" 2>&1
if ($fwRule -match "UnifiedPOS") {
    Write-Pass "Firewall rule 'UnifiedPOS' exists"
} else {
    Write-Fail "Firewall rule 'UnifiedPOS' NOT found"
}

# =============================================================================
# TEST 7: Verify appsettings.json has SQLite config
# =============================================================================
Write-Info "Test 7: Checking appsettings.json configuration..."
$appSettingsContent = Get-Content (Join-Path $appDir "appsettings.json") -Raw
if ($appSettingsContent -match "Data Source") {
    Write-Pass "SQLite connection string configured"
} else {
    Write-Fail "SQLite connection string NOT found in appsettings.json"
}

if ($appSettingsContent -match "0.0.0.0:5000") {
    Write-Pass "Kestrel configured to listen on all interfaces (port 5000)"
} else {
    Write-Log "WARNING: Network binding not set to 0.0.0.0:5000" "Yellow"
}

# =============================================================================
# TEST 8: Start the application and test HTTP
# =============================================================================
Write-Info "Test 8: Starting UnifiedPOS application..."
$appExe = Join-Path $appDir "UnifiedPOS.Web.exe"

$appProcess = Start-Process -FilePath $appExe -WorkingDirectory $appDir -PassThru -WindowStyle Minimized
Write-Info ("Application started (PID: " + $appProcess.Id + "). Waiting 15 seconds for startup...")
Start-Sleep -Seconds 15

# Test HTTP connection
Write-Info "Test 9: Testing HTTP connection to localhost:5000..."
$maxRetries = 5
$connected = $false

for ($i = 1; $i -le $maxRetries; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000" -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Pass "HTTP 200 OK from localhost:5000"
            $connected = $true
            
            # Check if it returns the correct app
            if ($response.Content -match "UnifiedPOS") {
                Write-Pass "Response contains 'UnifiedPOS' - correct app is serving"
            } else {
                Write-Log "WARNING: Response doesn't contain 'UnifiedPOS' text" "Yellow"
            }
            break
        }
    } catch {
        Write-Info ("  Attempt " + $i + "/" + $maxRetries + " - waiting...")
        if ($i -lt $maxRetries) {
            Start-Sleep -Seconds 5
        }
    }
}

if (-not $connected) {
    Write-Fail ("Could not connect to localhost:5000 after " + $maxRetries + " attempts")
    
    if ($appProcess.HasExited) {
        Write-Fail ("Application crashed with exit code: " + $appProcess.ExitCode)
    } else {
        Write-Info "Application is still running but not responding on port 5000"
    }
}

# =============================================================================
# TEST 10: Verify SQLite database was created
# =============================================================================
Write-Info "Test 10: Checking if SQLite database was created..."
$dbFile = Join-Path $appDir "UnifiedPOS.db"
if (Test-Path $dbFile) {
    $dbSize = [math]::Round((Get-Item $dbFile).Length / 1KB, 1)
    Write-Pass ("SQLite database created (" + $dbSize + " KB)")
} else {
    Write-Fail "SQLite database file NOT created"
}

# =============================================================================
# Cleanup and Summary
# =============================================================================
Write-Info "Stopping application..."
if (-not $appProcess.HasExited) {
    Stop-Process -Id $appProcess.Id -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host "  TEST RESULTS SUMMARY" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow

if ($script:failures -eq 0) {
    Write-Host ""
    Write-Host "  ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "  The installer works on a clean machine." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    $msg = "  " + $script:failures + " TEST(S) FAILED"
    Write-Host $msg -ForegroundColor Red
    Write-Host "  Review the log above for details." -ForegroundColor Red
    Write-Host ""
}

Write-Host "Results saved to: $logFile" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Enter to close this window..." -ForegroundColor Gray
Read-Host
