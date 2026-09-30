<#
.SYNOPSIS
  Installs Academic-clipper for the current Windows user (no administrator rights needed).

.DESCRIPTION
  Deploys the bundled Node runtime, bridge, launcher and extension to
  %LOCALAPPDATA%\Academic-clipper, registers the Native Messaging host for
  Edge and Chrome (HKCU), and records install-state.json.
  Safe to run repeatedly: files are refreshed, registry keys are overwritten in
  place, config.json is never overwritten.

.PARAMETER ExtensionId
  32-character ID of the loaded Academic Clipper extension (see QUICKSTART.md).
  Optional on the first run; the runtime is installed and you are told what to do next.

.PARAMETER LibraryPath
  Where saved papers go. Only used when config.json does not exist yet.
  Default: Documents\Academic-clipper\papers

.PARAMETER InstallDir / RegistryBase
  Overrides for testing. Defaults: %LOCALAPPDATA%\Academic-clipper and HKCU:\Software.
#>
[CmdletBinding()]
param(
  [string]$ExtensionId,
  [string]$LibraryPath,
  [string]$InstallDir = (Join-Path $env:LOCALAPPDATA 'Academic-clipper'),
  [string]$RegistryBase = 'HKCU:\Software'
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

$HostName = 'com.academic_clipper.bridge'
$SourceRoot = $PSScriptRoot

function Write-Step($msg) { Write-Host "[install] $msg" }

function Test-ExtensionId($id) { return ($id -cmatch '^[a-p]{32}$') }

function Stop-InstalledProcesses($dir) {
  # Stop only processes that run from inside the install directory.
  $prefix = ($dir.TrimEnd('\') + '\')
  foreach ($p in @(Get-Process -ErrorAction SilentlyContinue)) {
    $path = $null
    try { $path = $p.Path } catch { }
    if ($path -and $path.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) {
      Write-Step "Stopping running process $($p.ProcessName) (pid $($p.Id))"
      Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
      $null = $p.WaitForExit(5000)
    }
  }
}

function Sync-Directory($from, $to) {
  if (-not (Test-Path -LiteralPath $from)) { return }
  & robocopy $from $to /MIR /NFL /NDL /NJH /NJS /NP /R:2 /W:1 | Out-Null
  if ($LASTEXITCODE -ge 8) { throw "robocopy failed for $from (exit code $LASTEXITCODE)" }
  $global:LASTEXITCODE = 0
}

function Find-Csc {
  $root = if ($env:SystemRoot) { $env:SystemRoot } else { 'C:\Windows' }
  foreach ($f in 'Framework64', 'Framework') {
    $c = Join-Path $root "Microsoft.NET\$f\v4.0.30319\csc.exe"
    if (Test-Path -LiteralPath $c) { return $c }
  }
  return $null
}

function Get-RegistryKeyPaths {
  return @(
    (Join-Path $RegistryBase "Google\Chrome\NativeMessagingHosts\$HostName"),
    (Join-Path $RegistryBase "Microsoft\Edge\NativeMessagingHosts\$HostName")
  )
}

function Read-JsonFile($path) {
  if (-not (Test-Path -LiteralPath $path)) { return $null }
  try { return (Get-Content -LiteralPath $path -Raw -Encoding UTF8 | ConvertFrom-Json) } catch { return $null }
}

function Write-JsonFile($path, $obj) {
  $json = $obj | ConvertTo-Json -Depth 8
  # UTF-8 without BOM so Node and browsers parse it.
  [System.IO.File]::WriteAllText($path, $json + "`n", (New-Object System.Text.UTF8Encoding($false)))
}

try {
  $releaseManifest = Read-JsonFile (Join-Path $SourceRoot 'release-manifest.json')
  if (-not $releaseManifest) { throw 'release-manifest.json not found next to install.ps1. Run this script from the extracted release folder.' }
  $version = [string]$releaseManifest.version
  foreach ($req in 'runtime\node.exe', 'src\bridge.mjs', 'src\launcher.mjs', 'src\launcher.cs', 'extension\manifest.json', 'config.template.json') {
    if (-not (Test-Path -LiteralPath (Join-Path $SourceRoot $req))) { throw "Release is incomplete: missing $req" }
  }

  $InstallDir = [System.IO.Path]::GetFullPath($InstallDir)
  $statePath = Join-Path $InstallDir 'install-state.json'
  $previous = Read-JsonFile $statePath
  if ($previous) { Write-Step "Existing installation found (version $($previous.version)); updating to $version." }
  else { Write-Step "Fresh installation of version $version into $InstallDir" }

  if (-not $ExtensionId -and $previous -and $previous.extension -and $previous.extension.id) {
    $ExtensionId = [string]$previous.extension.id
    Write-Step 'Reusing extension ID from previous installation.'
  }
  if ($ExtensionId -and -not (Test-ExtensionId $ExtensionId)) {
    throw 'Invalid -ExtensionId: it must be exactly 32 lowercase letters between a and p.'
  }

  New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
  Stop-InstalledProcesses $InstallDir

  Write-Step 'Deploying runtime, bridge and extension files'
  foreach ($d in 'runtime', 'src', 'node_modules', 'extension') {
    Sync-Directory (Join-Path $SourceRoot $d) (Join-Path $InstallDir $d)
  }
  Copy-Item -LiteralPath (Join-Path $SourceRoot 'package.json') -Destination $InstallDir -Force
  Copy-Item -LiteralPath (Join-Path $SourceRoot 'config.template.json') -Destination $InstallDir -Force
  Copy-Item -LiteralPath (Join-Path $SourceRoot 'release-manifest.json') -Destination $InstallDir -Force

  # Launcher: native host entry point (PR14 architecture: launcher.exe -> node launcher.mjs).
  $srcDir = Join-Path $InstallDir 'src'
  $nodeExe = Join-Path $InstallDir 'runtime\node.exe'
  [System.IO.File]::WriteAllText((Join-Path $srcDir '.node-path.txt'), $nodeExe, (New-Object System.Text.UTF8Encoding($false)))
  $launcherExe = Join-Path $srcDir 'launcher.exe'
  $csc = Find-Csc
  if (-not $csc) { throw 'C# compiler (csc.exe, part of .NET Framework 4) not found; it is required to build launcher.exe.' }
  Write-Step 'Building launcher.exe'
  & $csc /nologo /target:winexe "/out:$launcherExe" (Join-Path $srcDir 'launcher.cs') | Out-Null
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $launcherExe)) { throw 'Failed to compile launcher.exe.' }

  # Configuration: create defaults only when missing; never overwrite user config.
  $configPath = Join-Path $InstallDir 'config.json'
  if (Test-Path -LiteralPath $configPath) {
    Write-Step 'Keeping existing config.json'
  } else {
    if (-not $LibraryPath) { $LibraryPath = Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'Academic-clipper\papers' }
    $config = Read-JsonFile (Join-Path $InstallDir 'config.template.json')
    if (-not $config) { throw 'config.template.json is unreadable.' }
    $config.libraryPath = [System.IO.Path]::GetFullPath($LibraryPath)
    Write-JsonFile $configPath $config
    Write-Step "Created default config.json (papers are saved to $($config.libraryPath))"
  }

  # Native Messaging host manifest + registry (idempotent: same keys, value overwritten).
  $hostRegistered = $false
  $hostManifestPath = Join-Path $InstallDir "$HostName.json"
  $regKeys = @(Get-RegistryKeyPaths)
  if ($ExtensionId) {
    $manifest = [ordered]@{
      name = $HostName
      description = 'Academic Clipper Native Messaging Host'
      path = $launcherExe
      type = 'stdio'
      allowed_origins = @("chrome-extension://$ExtensionId/")
    }
    Write-JsonFile $hostManifestPath $manifest
    foreach ($key in $regKeys) {
      if (-not (Test-Path -LiteralPath $key)) { New-Item -Path $key -Force | Out-Null }
      Set-ItemProperty -LiteralPath $key -Name '(default)' -Value $hostManifestPath
      $actual = (Get-ItemProperty -LiteralPath $key).'(default)'
      if ($actual -ne $hostManifestPath) { throw "Registry verification failed for $key" }
    }
    $hostRegistered = $true
    Write-Step 'Native Messaging host registered for Edge and Chrome'
  } else {
    Write-Step 'No extension ID yet: Native Messaging host registration is pending.'
  }

  $now = (Get-Date).ToUniversalTime().ToString('o')
  $installedAt = if ($previous -and $previous.installedAt) { [string]$previous.installedAt } else { $now }
  $state = [ordered]@{
    schemaVersion = 1
    version = $version
    installedAt = $installedAt
    updatedAt = $now
    installDir = $InstallDir
    nodeRuntime = $nodeExe
    configPath = $configPath
    nativeHost = [ordered]@{
      name = $HostName
      status = $(if ($hostRegistered) { 'registered' } else { 'pending-extension-id' })
      manifestPath = $(if ($hostRegistered) { $hostManifestPath } else { $null })
      registryKeys = $(if ($hostRegistered) { $regKeys } else { @() })
    }
    extension = [ordered]@{
      id = $(if ($ExtensionId) { $ExtensionId } else { $null })
      path = (Join-Path $InstallDir 'extension')
      status = $(if ($ExtensionId) { 'configured-load-unpacked' } else { 'not-configured' })
    }
  }
  Write-JsonFile $statePath $state

  Write-Host ''
  Write-Host "SUCCESS: Academic-clipper $version is installed in $InstallDir" -ForegroundColor Green
  if ($hostRegistered) {
    Write-Host 'Next: in Edge open edge://extensions, enable Developer mode, click "Load unpacked" and pick:'
    Write-Host "  $(Join-Path $InstallDir 'extension')"
    Write-Host 'Then confirm the extension ID shown there is the one you passed to -ExtensionId.'
  } else {
    Write-Host 'Next steps:'
    Write-Host '  1. In Edge open edge://extensions, enable Developer mode, click "Load unpacked" and pick:'
    Write-Host "       $(Join-Path $InstallDir 'extension')"
    Write-Host '  2. Copy the 32-letter extension ID shown on that page.'
    Write-Host '  3. Re-run:  powershell -ExecutionPolicy Bypass -File .\install.ps1 -ExtensionId <that id>'
  }
  exit 0
} catch {
  Write-Host ''
  Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host 'The installation may be incomplete. Fix the problem and run install.ps1 again; it is safe to repeat.'
  exit 1
}
