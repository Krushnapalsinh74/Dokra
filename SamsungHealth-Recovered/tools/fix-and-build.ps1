$ErrorActionPreference = 'Stop'

$root        = "C:\Users\AE\Desktop\DokraHealth\SamsungHealth-Recovered"
$apktoolJar  = "$root\tools\apktool.jar"
$buildDir    = "$root\build"
$apktoolDir  = "$root\apktool"
$buildTools  = "C:\AndroidEnv\android-sdk\build-tools\36.0.0"
$zipalign    = "$buildTools\zipalign.exe"
$apksigner   = "$buildTools\apksigner.bat"
$keystore    = "$buildDir\dokra-release.keystore"
$unsignedApk = "$buildDir\DokraHealth-fresh-unsigned.apk"
$alignedApk  = "$buildDir\DokraHealth-aligned.apk"
$finalApk    = "$buildDir\DokraHealth-FINAL.apk"
$ksPass      = "dokrahealth123"
$keyAlias    = "dokrahealth"
$keyPass     = "dokrahealth123"

Write-Host "=== DOKRA HEALTH APK FIX ===" -ForegroundColor Cyan

# Step 1 - Check tools
Write-Host "[1/5] Checking tools..." -ForegroundColor Yellow
foreach ($t in @($apktoolJar,$zipalign,$apksigner,$apktoolDir)) {
    if (-not (Test-Path $t)) { throw "NOT FOUND: $t" }
}
Write-Host "    OK" -ForegroundColor Green

# Step 2 - Rebuild APK
Write-Host "[2/5] Rebuilding APK with apktool..." -ForegroundColor Yellow
if (Test-Path $unsignedApk) { Remove-Item $unsignedApk -Force }
& java -Xmx4g -jar $apktoolJar b $apktoolDir --output $unsignedApk --use-aapt2 --no-crunch
if ($LASTEXITCODE -ne 0) {
    Write-Host "    aapt2 failed, retrying without aapt2..." -ForegroundColor Yellow
    & java -Xmx4g -jar $apktoolJar b $apktoolDir --output $unsignedApk --no-crunch
    if ($LASTEXITCODE -ne 0) { throw "apktool rebuild failed" }
}
Write-Host "    Rebuilt OK: $unsignedApk" -ForegroundColor Green

# Step 3 - Keystore
Write-Host "[3/5] Keystore..." -ForegroundColor Yellow
if (-not (Test-Path $keystore)) {
    & keytool -genkeypair -keystore $keystore -alias $keyAlias -keyalg RSA -keysize 2048 -validity 10000 -storepass $ksPass -keypass $keyPass -dname "CN=Dokra Health,O=DokraHealth,C=IN"
    if ($LASTEXITCODE -ne 0) { throw "keytool failed" }
}
Write-Host "    Keystore ready" -ForegroundColor Green

# Step 4 - Zipalign
Write-Host "[4/5] Zipaligning..." -ForegroundColor Yellow
if (Test-Path $alignedApk) { Remove-Item $alignedApk -Force }
& $zipalign -v -p 4 $unsignedApk $alignedApk
if ($LASTEXITCODE -ne 0) { throw "zipalign failed" }
Write-Host "    Aligned OK" -ForegroundColor Green

# Step 5 - Sign
Write-Host "[5/5] Signing APK (v1+v2+v3)..." -ForegroundColor Yellow
if (Test-Path $finalApk) { Remove-Item $finalApk -Force }
& $apksigner sign --ks $keystore --ks-pass pass:$ksPass --ks-key-alias $keyAlias --key-pass pass:$keyPass --v1-signing-enabled true --v2-signing-enabled true --v3-signing-enabled true --out $finalApk $alignedApk
if ($LASTEXITCODE -ne 0) { throw "apksigner failed" }
Write-Host "    Signed OK" -ForegroundColor Green

# Verify
Write-Host "Verifying..." -ForegroundColor Yellow
& $apksigner verify --verbose $finalApk

# Copy to Desktop
Copy-Item $finalApk "C:\Users\AE\Desktop\DokraHealth-FINAL.apk" -Force
$sz = [math]::Round((Get-Item "C:\Users\AE\Desktop\DokraHealth-FINAL.apk").Length / 1MB, 1)
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DONE! DokraHealth-FINAL.apk on Desktop" -ForegroundColor Green
Write-Host "  Size: $sz MB" -ForegroundColor White
Write-Host "  Transfer to phone and install!" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
