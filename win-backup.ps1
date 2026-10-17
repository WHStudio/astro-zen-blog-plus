# Pack and restore site customizations plus published posts.
# Includes: src/config.ts, public/, src/content/blog/
# Does not include the theme source, dependencies, or build output.
# Requires Windows PowerShell 5.1+ or PowerShell 7+, and tar.

[CmdletBinding()]
param(
  [Parameter(Position = 0)]
  [string]$Action = "pack",

  [Parameter(Position = 1)]
  [string]$Archive = "",

  [switch]$Force,

  [switch]$Help
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$OutputEncoding = New-Object System.Text.UTF8Encoding $false
try {
  [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding $false
} catch {
}

$Root = $PSScriptRoot
if (-not $Root) {
  $Root = Split-Path -Parent $MyInvocation.MyCommand.Path
}

$ManifestName = "azbp-content-manifest.txt"
$Magic = "azbp-content-backup"
$FormatVersion = "1"
$Script:TempDirs = @()

function Fail {
  param([string]$Message)
  [Console]::Error.WriteLine("错误: $Message")
  exit 1
}

function Show-Usage {
  Write-Host @'
用法:
  .\win-backup.ps1 [pack] [-Archive 压缩包] [-Force]
  .\win-backup.ps1 unpack -Archive <压缩包> [-Force]

打包内容（相对项目根目录）:
  src/config.ts        站点自定义配置
  public/              图标等静态资源
  src/content/blog/    已发布文章

unpack 会用压缩包里的上述内容替换当前项目，压缩包中没有的文章和静态文件会被删除。
脚本所在目录视为项目根目录，可从任意工作目录执行。

示例:
  .\win-backup.ps1
  .\win-backup.ps1 unpack .\content-backup-20261017-120000.tar.gz
'@
}

function Get-ProjectPath {
  param(
    [string]$Base,
    [string]$Relative
  )
  $path = $Base
  foreach ($part in ($Relative -split '[\\/]')) {
    if ($part -ne "") {
      $path = Join-Path $path $part
    }
  }
  return $path
}

function Resolve-FullPath {
  param([string]$Path)
  return [System.IO.Path]::GetFullPath($Path)
}

function Test-IsInsidePath {
  param(
    [string]$Child,
    [string]$Parent
  )
  $childPath = Resolve-FullPath $Child
  $parentPath = Resolve-FullPath $Parent
  $separator = [System.IO.Path]::DirectorySeparatorChar
  if (-not $parentPath.EndsWith($separator)) {
    $parentPath = $parentPath + $separator
  }
  $same = $childPath.TrimEnd($separator).Equals(
    $parentPath.TrimEnd($separator),
    [System.StringComparison]::OrdinalIgnoreCase
  )
  return $same -or $childPath.StartsWith($parentPath, [System.StringComparison]::OrdinalIgnoreCase)
}

function New-TempDirectory {
  $dir = Join-Path ([System.IO.Path]::GetTempPath()) ("azbp-backup-" + [guid]::NewGuid().ToString("n"))
  New-Item -ItemType Directory -Path $dir | Out-Null
  $Script:TempDirs += $dir
  return $dir
}

function Remove-TempDirectories {
  foreach ($dir in $Script:TempDirs) {
    if ($dir -and (Test-Path -LiteralPath $dir)) {
      Remove-Item -LiteralPath $dir -Recurse -Force -ErrorAction SilentlyContinue
    }
  }
  $Script:TempDirs = @()
}

function Get-TarPath {
  $command = Get-Command tar -ErrorAction SilentlyContinue
  if (-not $command) {
    Fail "未找到 tar。Windows 10 及以上系统自带 tar.exe。"
  }
  return $command.Source
}

function Assert-ProjectLayout {
  $required = @(
    (Join-Path $Root "astro.config.mjs"),
    (Get-ProjectPath $Root "src/config.ts"),
    (Get-ProjectPath $Root "src/content.config.ts")
  )
  foreach ($path in $required) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
      Fail "脚本需要位于 astro-zen-blog-plus 项目根目录。未在 $Root 找到完整的站点内容。"
    }
  }
  foreach ($relative in @("src/content/blog", "public")) {
    $path = Get-ProjectPath $Root $relative
    if (-not (Test-Path -LiteralPath $path -PathType Container)) {
      Fail "脚本需要位于 astro-zen-blog-plus 项目根目录。未在 $Root 找到完整的站点内容。"
    }
  }
  foreach ($path in @(
      (Get-ProjectPath $Root "src/config.ts"),
      (Get-ProjectPath $Root "src/content/blog"),
      (Get-ProjectPath $Root "public")
    )) {
    $item = Get-Item -LiteralPath $path -Force
    if ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
      Fail "请使用普通文件和目录，不要使用符号链接：$path"
    }
  }
}

function Get-ResiduePaths {
  return @(
    (Get-ProjectPath $Root "src/.config.ts.replaced-bak"),
    (Get-ProjectPath $Root "src/content/.blog.replaced-bak"),
    (Join-Path $Root ".public.replaced-bak"),
    (Get-ProjectPath $Root "src/.config.ts.incoming"),
    (Get-ProjectPath $Root "src/content/.blog.incoming"),
    (Join-Path $Root ".public.incoming")
  )
}

function Assert-NoResidue {
  foreach ($path in (Get-ResiduePaths)) {
    if (Test-Path -LiteralPath $path) {
      Fail "发现未完成的还原残留：$path。请先确认项目内容完整并移走该残留后再试。"
    }
  }
}

function Assert-ArchiveLocation {
  param([string]$ArchivePath)
  $full = Resolve-FullPath $ArchivePath
  $blocked = @(
    (Get-ProjectPath $Root "src/config.ts"),
    (Get-ProjectPath $Root "src/content/blog"),
    (Get-ProjectPath $Root "public")
  )
  foreach ($parent in $blocked) {
    if (Test-IsInsidePath $full $parent) {
      Fail "压缩包不能放在 src/config.ts、public 或 src/content/blog 里面。"
    }
  }
}

function ConvertTo-NormalizedEntry {
  param([string]$Entry)
  $normalized = $Entry.Trim().Replace("\", "/")
  while ($normalized.StartsWith("./")) {
    $normalized = $normalized.Substring(2)
  }
  $normalized = $normalized.TrimStart("/")
  while ($normalized.EndsWith("/")) {
    $normalized = $normalized.Substring(0, $normalized.Length - 1)
  }
  return $normalized
}

function Assert-EntryAllowed {
  param([string]$Entry)
  $normalized = ConvertTo-NormalizedEntry $Entry
  if ([string]::IsNullOrWhiteSpace($normalized) -or $normalized.Contains(":")) {
    Fail "压缩包包含非法路径：$Entry"
  }
  foreach ($part in ($normalized -split "/")) {
    if ($part -eq "" -or $part -eq "." -or $part -eq "..") {
      Fail "压缩包包含非法路径：$Entry"
    }
  }
  $allowed = @(
    $ManifestName,
    "src/config.ts",
    "src/content/blog",
    "public"
  )
  $prefixAllowed = $normalized.StartsWith("src/content/blog/") -or $normalized.StartsWith("public/")
  if (-not ($allowed -contains $normalized -or $prefixAllowed)) {
    Fail "压缩包包含未预期的路径：$normalized"
  }
  return $normalized
}

function Get-ArchiveEntries {
  param(
    [string]$Tar,
    [string]$ArchivePath
  )
  $entries = @(& $Tar -tf $ArchivePath)
  if ($LASTEXITCODE -ne 0) {
    Fail "无法读取压缩包：$ArchivePath"
  }
  return @($entries | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) })
}

function Assert-ArchiveListing {
  param(
    [string]$Tar,
    [string]$ArchivePath
  )
  $entries = @(Get-ArchiveEntries $Tar $ArchivePath)
  if ($entries.Count -eq 0) {
    Fail "压缩包是空的：$ArchivePath"
  }
  $seenManifest = $false
  $seenConfig = $false
  $seenBlog = $false
  $seenPublic = $false
  foreach ($entry in $entries) {
    $text = [string]$entry
    if ($text -match "^(tar:|.*: )") {
      Fail "无法读取压缩包：$ArchivePath"
    }
    $normalized = Assert-EntryAllowed $text
    if ($normalized -eq $ManifestName) { $seenManifest = $true }
    elseif ($normalized -eq "src/config.ts") { $seenConfig = $true }
    elseif ($normalized -eq "src/content/blog" -or $normalized.StartsWith("src/content/blog/")) { $seenBlog = $true }
    elseif ($normalized -eq "public" -or $normalized.StartsWith("public/")) { $seenPublic = $true }
  }
  if (-not ($seenManifest -and $seenConfig -and $seenBlog -and $seenPublic)) {
    Fail "压缩包缺少站点配置、文章、静态资源或备份清单。"
  }
}

function Read-Manifest {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
    Fail "不是内容备份包：缺少 $ManifestName。"
  }
  $text = [System.IO.File]::ReadAllText($Path)
  $text = $text.TrimStart([char]0xFEFF)
  $magic = ""
  $version = ""
  $paths = @()
  foreach ($raw in ($text -split "`r?`n")) {
    $line = $raw.Trim()
    if ($line -eq "") { continue }
    $separator = $line.IndexOf("=")
    if ($separator -lt 1) {
      Fail "备份清单格式不正确。"
    }
    $key = $line.Substring(0, $separator)
    $value = $line.Substring($separator + 1)
    switch ($key) {
      "magic" { $magic = $value }
      "version" { $version = $value }
      "paths" { $paths += $value }
      "created" {}
      "posts" {}
      "public_files" {}
      default { Fail "备份清单包含未知字段：$key" }
    }
  }
  if ($magic -ne $Magic) {
    Fail "不是本项目的内容备份包。"
  }
  if ($version -ne $FormatVersion) {
    Fail "不支持的备份版本：$version"
  }
  $expected = @("public", "src/config.ts", "src/content/blog") | Sort-Object
  $actual = @($paths | Sort-Object)
  if (($actual -join "|") -ne ($expected -join "|")) {
    Fail "备份清单中的路径与当前脚本不一致。"
  }
}

function Assert-PlainTree {
  param([string]$Directory)
  $items = @(Get-ChildItem -LiteralPath $Directory -Recurse -Force)
  foreach ($item in $items) {
    if ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
      Fail "发现符号链接或特殊文件，已拒绝。"
    }
  }
}

function Assert-ExtractedTree {
  param([string]$Directory)
  Assert-PlainTree $Directory
  $config = Get-ProjectPath $Directory "src/config.ts"
  $blog = Get-ProjectPath $Directory "src/content/blog"
  $public = Get-ProjectPath $Directory "public"
  if (-not (Test-Path -LiteralPath $config -PathType Leaf)) {
    Fail "备份包中的 src/config.ts 不可用。"
  }
  if (-not (Test-Path -LiteralPath $blog -PathType Container)) {
    Fail "备份包中的 src/content/blog 不可用。"
  }
  if (-not (Test-Path -LiteralPath $public -PathType Container)) {
    Fail "备份包中的 public 不可用。"
  }
  Read-Manifest (Join-Path $Directory $ManifestName)
}

function Test-SkippedBackupPath {
  param([string]$Path)
  $normalized = $Path.Replace("\", "/")
  return ($normalized -match "/node_modules(/|$)") -or ($normalized -match "/\.git(/|$)")
}

function Get-MarkdownCount {
  param([string]$Directory)
  $files = @(Get-ChildItem -LiteralPath $Directory -Recurse -Force -File -Filter "*.md" |
    Where-Object { -not (Test-SkippedBackupPath $_.FullName) })
  return $files.Count
}

function Get-PublicFileCount {
  param([string]$Directory)
  $excluded = @(".DS_Store", "Thumbs.db", "desktop.ini")
  $files = @(Get-ChildItem -LiteralPath $Directory -Recurse -Force -File |
    Where-Object { ($excluded -notcontains $_.Name) -and -not (Test-SkippedBackupPath $_.FullName) })
  return $files.Count
}

function Write-ManifestFile {
  param([string]$Path)
  $posts = Get-MarkdownCount (Get-ProjectPath $Root "src/content/blog")
  $publicFiles = Get-PublicFileCount (Get-ProjectPath $Root "public")
  $created = [datetime]::UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss'Z'", [System.Globalization.CultureInfo]::InvariantCulture)
  $lines = @(
    "magic=$Magic",
    "version=$FormatVersion",
    "created=$created",
    "paths=src/config.ts",
    "paths=src/content/blog",
    "paths=public",
    "posts=$posts",
    "public_files=$publicFiles"
  )
  $utf8 = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllText($Path, (($lines -join "`n") + "`n"), $utf8)
}

function Copy-BackupTree {
  param(
    [string]$Source,
    [string]$Destination
  )
  $item = Get-Item -LiteralPath $Source -Force
  if (-not $item.PSIsContainer) {
    $parent = Split-Path -Parent $Destination
    if (-not (Test-Path -LiteralPath $parent)) {
      New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    Copy-Item -LiteralPath $Source -Destination $Destination -Force
    return
  }

  New-Item -ItemType Directory -Path $Destination -Force | Out-Null
  $sourceFull = $item.FullName
  $separator = [System.IO.Path]::DirectorySeparatorChar
  if (-not $sourceFull.EndsWith($separator)) {
    $sourceFull = $sourceFull + $separator
  }
  $children = @(Get-ChildItem -LiteralPath $item.FullName -Recurse -Force)
  foreach ($child in $children) {
    $relative = $child.FullName.Substring($sourceFull.Length)
    $target = Join-Path $Destination $relative
    if ($child.PSIsContainer) {
      if (-not (Test-Path -LiteralPath $target)) {
        New-Item -ItemType Directory -Path $target | Out-Null
      }
    } else {
      $targetParent = Split-Path -Parent $target
      if (-not (Test-Path -LiteralPath $targetParent)) {
        New-Item -ItemType Directory -Path $targetParent -Force | Out-Null
      }
      Copy-Item -LiteralPath $child.FullName -Destination $target -Force
    }
  }
}

function Get-StagedNames {
  param([string]$Relative)
  $destination = Get-ProjectPath $Root $Relative
  $parent = Split-Path -Parent $destination
  $leaf = Split-Path -Leaf $destination
  return @{
    Destination = $destination
    Parent = $parent
    Incoming = (Join-Path $parent ".$leaf.incoming")
    Backup = (Join-Path $parent ".$leaf.replaced-bak")
  }
}

function Restore-ReplacedItem {
  param([string]$Relative)
  $names = Get-StagedNames $Relative
  if (Test-Path -LiteralPath $names.Destination) {
    Remove-Item -LiteralPath $names.Destination -Recurse -Force
  }
  if (Test-Path -LiteralPath $names.Backup) {
    Move-Item -LiteralPath $names.Backup -Destination $names.Destination
  }
}

function Remove-IncomingCopies {
  foreach ($relative in @("src/config.ts", "src/content/blog", "public")) {
    $incoming = (Get-StagedNames $relative).Incoming
    if (Test-Path -LiteralPath $incoming) {
      Remove-Item -LiteralPath $incoming -Recurse -Force
    }
  }
}

function Invoke-ReplaceItem {
  param(
    [string]$Relative,
    [string]$SourceRoot
  )
  $names = Get-StagedNames $Relative
  $incoming = Get-ProjectPath $SourceRoot $Relative
  if (-not (Test-Path -LiteralPath $names.Parent)) {
    New-Item -ItemType Directory -Path $names.Parent -Force | Out-Null
  }
  if (Test-Path -LiteralPath $names.Incoming) {
    Remove-Item -LiteralPath $names.Incoming -Recurse -Force
  }
  Copy-BackupTree $incoming $names.Incoming
  $movedAside = $false
  try {
    if (Test-Path -LiteralPath $names.Destination) {
      Move-Item -LiteralPath $names.Destination -Destination $names.Backup
      $movedAside = $true
    }
    Move-Item -LiteralPath $names.Incoming -Destination $names.Destination
  } catch {
    if ($movedAside -and -not (Test-Path -LiteralPath $names.Destination) -and (Test-Path -LiteralPath $names.Backup)) {
      Move-Item -LiteralPath $names.Backup -Destination $names.Destination
    }
    throw
  }
}

function Invoke-ApplyTree {
  param([string]$SourceRoot)
  $rels = @("src/config.ts", "src/content/blog", "public")
  $done = @()
  try {
    foreach ($relative in $rels) {
      Invoke-ReplaceItem $relative $SourceRoot
      $done += $relative
    }
  } catch {
    for ($i = $done.Count - 1; $i -ge 0; $i--) {
      Restore-ReplacedItem $done[$i]
    }
    Remove-IncomingCopies
    Fail "覆盖失败，已尝试回滚。$($_.Exception.Message)"
  }
  foreach ($relative in $rels) {
    $backup = (Get-StagedNames $relative).Backup
    if (Test-Path -LiteralPath $backup) {
      Remove-Item -LiteralPath $backup -Recurse -Force
    }
  }
}

function Confirm-Overwrite {
  param(
    [string]$Extracted,
    [string]$ArchivePath
  )
  $posts = Get-MarkdownCount (Get-ProjectPath $Extracted "src/content/blog")
  Write-Host "即将用压缩包覆盖以下内容："
  Write-Host "  src/config.ts"
  Write-Host "  public/"
  Write-Host "  src/content/blog/（$posts 篇 Markdown）"
  Write-Host "压缩包：$ArchivePath"
  Write-Host "这些位置上、压缩包里没有的文件会被删除。"
  if ($Force) {
    return
  }
  $interactive = $true
  try {
    $interactive = -not [Console]::IsInputRedirected
  } catch {
  }
  if (-not $interactive) {
    Fail "非交互环境请追加 -Force 确认覆盖。"
  }
  $answer = Read-Host "继续？[y/N]"
  $accepted = @("y", "yes", "是")
  if ($accepted -notcontains $answer.Trim().ToLower()) {
    Fail "已取消。"
  }
}

function Invoke-Tar {
  param(
    [string]$Tar,
    [string[]]$TarArgs
  )
  & $Tar @TarArgs
  if ($LASTEXITCODE -ne 0) {
    Fail "tar 失败，退出码 $LASTEXITCODE。"
  }
}

function Invoke-Pack {
  param([string]$ArchivePath)
  $tar = Get-TarPath
  Assert-ProjectLayout
  Assert-NoResidue
  if ([string]::IsNullOrWhiteSpace($ArchivePath)) {
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $ArchivePath = Join-Path $Root "content-backup-$stamp.tar.gz"
  } else {
    $ArchivePath = Resolve-FullPath $ArchivePath
  }
  Assert-ArchiveLocation $ArchivePath
  if ((Test-Path -LiteralPath $ArchivePath) -and -not $Force) {
    Fail "压缩包已存在：$ArchivePath（追加 -Force 覆盖）"
  }
  if (Test-Path -LiteralPath $ArchivePath -PathType Container) {
    Fail "压缩包路径是目录：$ArchivePath"
  }
  $parent = Split-Path -Parent $ArchivePath
  if (-not (Test-Path -LiteralPath $parent)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
  }

  $stage = New-TempDirectory
  $manifest = Join-Path $stage $ManifestName
  Write-ManifestFile $manifest
  $partial = Join-Path $stage "archive.tar.gz"
  Write-Host "==> 打包 src/config.ts、public/、src/content/blog/"
  Invoke-Tar $tar @(
    "-czf", $partial,
    "--format", "pax",
    "--exclude", ".DS_Store",
    "--exclude", "Thumbs.db",
    "--exclude", "desktop.ini",
    "--exclude", "node_modules",
    "--exclude", ".git",
    "-C", $Root,
    "src/config.ts", "src/content/blog", "public",
    "-C", $stage,
    $ManifestName
  )
  Assert-ArchiveListing $tar $partial
  $extracted = New-TempDirectory
  Invoke-Tar $tar @("-xzf", $partial, "-C", $extracted)
  Assert-ExtractedTree $extracted
  $posts = Get-MarkdownCount (Get-ProjectPath $extracted "src/content/blog")
  $publicFiles = Get-PublicFileCount (Get-ProjectPath $extracted "public")
  Move-Item -LiteralPath $partial -Destination $ArchivePath -Force
  $bytes = (Get-Item -LiteralPath $ArchivePath).Length
  $kb = "{0:N2}" -f ($bytes / 1KB)
  Write-Host "==> 已打包站点配置、静态资源和已发布文章" -ForegroundColor Green
  Write-Host "    文章: $posts 篇"
  Write-Host "    静态文件: $publicFiles 个"
  Write-Host "    压缩包: $ArchivePath"
  Write-Host "    大小: $kb KB"
  Write-Host "还原覆盖请执行:"
  Write-Host "  .\win-backup.ps1 unpack $ArchivePath"
}

function Invoke-Unpack {
  param([string]$ArchivePath)
  if ([string]::IsNullOrWhiteSpace($ArchivePath)) {
    Fail "请指定要还原的压缩包。例如: .\win-backup.ps1 unpack .\content-backup-20261017-120000.tar.gz"
  }
  $tar = Get-TarPath
  Assert-ProjectLayout
  Assert-NoResidue
  $ArchivePath = Resolve-FullPath $ArchivePath
  Assert-ArchiveLocation $ArchivePath
  if (-not (Test-Path -LiteralPath $ArchivePath -PathType Leaf)) {
    Fail "未找到压缩包：$ArchivePath"
  }
  Assert-ArchiveListing $tar $ArchivePath
  $extracted = New-TempDirectory
  Write-Host "==> 检查备份包"
  Invoke-Tar $tar @("-xzf", $ArchivePath, "-C", $extracted)
  Assert-ExtractedTree $extracted
  Confirm-Overwrite $extracted $ArchivePath
  Write-Host "==> 覆盖 src/config.ts、public/、src/content/blog/"
  Invoke-ApplyTree $extracted
  $posts = Get-MarkdownCount (Get-ProjectPath $Root "src/content/blog")
  Write-Host "==> 已覆盖还原" -ForegroundColor Green
  Write-Host "    src/config.ts"
  Write-Host "    public/"
  Write-Host "    src/content/blog/（$posts 篇 Markdown）"
  Write-Host "可以执行 pnpm dev 或 pnpm build 查看站点。"
}

try {
  if ($Help -or $Action -eq "help" -or $Action -eq "-h" -or $Action -eq "--help") {
    Show-Usage
    exit 0
  }
  switch ($Action.ToLower()) {
    "pack" { Invoke-Pack $Archive }
    "unpack" { Invoke-Unpack $Archive }
    "restore" { Invoke-Unpack $Archive }
    default { Fail "未知命令：$Action。可用命令：pack、unpack。执行 .\win-backup.ps1 help 查看用法。" }
  }
} finally {
  Remove-TempDirectories
}
