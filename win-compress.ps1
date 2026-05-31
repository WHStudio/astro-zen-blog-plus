# Requires PowerShell 7+
[CmdletBinding()]
param(
  [string]$Source = "dist",
  [string]$Output = "dist.tar.gz"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ($PSVersionTable.PSVersion.Major -lt 7) {
  throw "This script requires PowerShell 7 or later."
}

$tar = Get-Command tar -ErrorAction Stop

$sourceItem = Get-Item -LiteralPath $Source -ErrorAction Stop
if (-not $sourceItem.PSIsContainer) {
  throw "Source path '$Source' must be a directory."
}

$outputPath = if ([System.IO.Path]::IsPathRooted($Output)) {
  $Output
} else {
  Join-Path -Path (Get-Location) -ChildPath $Output
}

if (Test-Path -LiteralPath $outputPath) {
  Remove-Item -LiteralPath $outputPath -Force
}

$sourceParent = $sourceItem.Parent.FullName
$sourceLeaf = $sourceItem.Name

Push-Location $sourceParent
try {
  & $tar.Source -czf $outputPath $sourceLeaf
  if ($LASTEXITCODE -ne 0) {
    throw "tar failed with exit code $LASTEXITCODE."
  }
}
finally {
  Pop-Location
}

& $tar.Source -tf $outputPath > $null
if ($LASTEXITCODE -ne 0) {
  throw "Archive verification failed for '$outputPath'."
}

$archive = Get-Item -LiteralPath $outputPath
Write-Host "Archive created successfully:" -ForegroundColor Green
Write-Host "  $($archive.FullName)"
Write-Host "  Size: $([Math]::Round($archive.Length / 1KB, 2)) KB"
