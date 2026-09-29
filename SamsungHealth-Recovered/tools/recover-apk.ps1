param(
    [string]$Apk = (Join-Path $PSScriptRoot '..\original\Samsung Health.apk'),
    [string]$Output = (Join-Path $PSScriptRoot '..\apktool'),
    [string]$ApktoolJar = (Join-Path $env:TEMP 'dok ra recovery tools\apktool.jar')
)

$ErrorActionPreference = 'Stop'
$resolvedApk = (Resolve-Path $Apk).Path
New-Item -ItemType Directory -Force -Path $Output | Out-Null
& java -Xmx6g -jar $ApktoolJar d -f -o $Output $resolvedApk
if ($LASTEXITCODE -ne 0) { throw "Apktool failed with exit code $LASTEXITCODE" }
Write-Output "Decoded APK into $Output"
