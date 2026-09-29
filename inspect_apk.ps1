Add-Type -AssemblyName System.IO.Compression.FileSystem
$apkPath = 'C:\AndroidEnv\DokraStandalone.apk'
$zip = [System.IO.Compression.ZipFile]::OpenRead($apkPath)
$dex = $zip.Entries | Where-Object { $_.Name -like '*.dex' }
Write-Host ("DEX count: " + $dex.Count)
$dex | ForEach-Object { Write-Host ($_.FullName + " " + $_.Length + " bytes") }
Write-Host "--- Checking injected provider classes ---"
$providers = $zip.Entries | Where-Object { $_.FullName -like '*dokra*' }
Write-Host ("Dokra entries: " + $providers.Count)
$providers | ForEach-Object { Write-Host $_.FullName }
Write-Host "--- Native libs ---"
$libs = $zip.Entries | Where-Object { $_.FullName -like 'lib/*' }
$abis = $libs | ForEach-Object { ($_.FullName -split '/')[1] } | Sort-Object -Unique
Write-Host ("ABIs: " + ($abis -join ', '))
$zip.Dispose()
