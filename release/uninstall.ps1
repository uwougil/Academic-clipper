<#
.SYNOPSIS
  Removes Academic-clipper for the current Windows user.

.DESCRIPTION
  Stops the bridge, removes the Native Messaging registration, generated
  manifests, runtime files and install-state.json.
  Never touches your paper library. config.json is kept unless -RemoveConfig is given.
  Remove the browser extension yourself from edge://extensions.
#>
[CmdletBinding()]
param(
  [switch]$RemoveConfig,
  [string]$InstallDir = (Join-Path $env:LOCALAPPDATA 'Academic-clipper'),
  [string]$RegistryBase = 'HKCU:\Software'
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

$HostName = 'com.academic_clipper.bridge'

function Write-Step($msg) { Write-Host "[uninstall] $msg" }

try {
  $InstallDir = [System.IO.Path]::GetFullPath($InstallDir)
  if (-not (Test-Path -LiteralPath $InstallDir)) {
    Write-Step "Nothing to remove in $InstallDir"
  } else {
    $prefix = ($InstallDir.TrimEnd('\') + '\')
    foreach ($p in @(Get-Process -ErrorAction SilentlyContinue)) {
      $path = $null
      try { $path = $p.Path } catch { }
      if ($path -and $path.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        Write-Step "Stopping process $($p.ProcessName) (pid $($p.Id))"
        Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
        $null = $p.WaitForExit(5000)
      }
    }
  }

  foreach ($key in @(
      (Join-Path $RegistryBase "Google\Chrome\NativeMessagingHosts\$HostName"),
      (Join-Path $RegistryBase "Microsoft\Edge\NativeMessagingHosts\$HostName"))) {
    if (Test-Path -LiteralPath $key) {
      Remove-Item -LiteralPath $key -Recurse -Force
      Write-Step "Removed registry key $key"
    }
  }

  if (Test-Path -LiteralPath $InstallDir) {
    # Remove only files the installer created. Anything else (config, papers a user
    # pointed libraryPath into this folder) is left alone.
    foreach ($name in 'runtime', 'src', 'node_modules', 'extension') {
      $p = Join-Path $InstallDir $name
      if (Test-Path -LiteralPath $p) { Remove-Item -LiteralPath $p -Recurse -Force; Write-Step "Removed $name\" }
    }
    $files = @("$HostName.json", 'install-state.json', 'package.json', 'config.template.json',
      'release-manifest.json', '.bridge-run.json', '.bridge-startup.lock')
    if ($RemoveConfig) { $files += 'config.json' }
    foreach ($name in $files) {
      $p = Join-Path $InstallDir $name
      if (Test-Path -LiteralPath $p) { Remove-Item -LiteralPath $p -Force; Write-Step "Removed $name" }
    }
    if (@(Get-ChildItem -LiteralPath $InstallDir -Force).Count -eq 0) {
      Remove-Item -LiteralPath $InstallDir -Force
      Write-Step "Removed empty folder $InstallDir"
    } else {
      Write-Step "Kept remaining user files in $InstallDir"
    }
  }

  Write-Host ''
  Write-Host 'SUCCESS: Academic-clipper was uninstalled. Your paper library was not touched.' -ForegroundColor Green
  Write-Host 'Remove the browser extension manually from edge://extensions if you no longer want it.'
  exit 0
} catch {
  Write-Host ''
  Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}
