# aidl sync.ps1 — Bidirectional sync between aidl repo and VSCode user config (Windows)
# Usage: .\scripts\sync.ps1 <subcommand> [options]
#   push [--yes]             Copy user-sync/ files to VSCode config
#   pull [--yes]             Copy untracked VSCode files into user-sync/
#   add <name|url> [--yes]   Install asset from registry or URL
#   list                     List registry assets grouped by type
#   status                   Show synced, new, and orphaned files
#   clean                    Remove orphaned manifest entries

[CmdletBinding()]
param(
    [Parameter(Position=0)][string]$Subcommand = "",
    [Parameter(Position=1)][string]$Arg1 = "",
    [Parameter(Position=2)][string]$Arg2 = "",
    [switch]$Yes
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot    = Split-Path -Parent $ScriptDir
$UserSync    = Join-Path $RepoRoot "user-sync"
$Manifest    = Join-Path $RepoRoot ".sync-manifest.json"
$CacheDir    = Join-Path $RepoRoot ".aidl-cache"
$VSCodeUser  = Join-Path $env:APPDATA "Code\User"

$RegistryUrl   = if ($env:AIDL_REGISTRY) { $env:AIDL_REGISTRY } else { "https://github.com/github/awesome-copilot" }
$CacheTTLHours = if ($env:AIDL_CACHE_TTL) { [int]$env:AIDL_CACHE_TTL } else { 24 }
$RegistryCache = Join-Path $CacheDir "registry"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
function Write-Info  { param([string]$Msg) Write-Host $Msg -ForegroundColor Green }
function Write-Warn  { param([string]$Msg) Write-Host $Msg -ForegroundColor Yellow }
function Write-Err   { param([string]$Msg) Write-Error $Msg }

function Ensure-Manifest {
    if (-not (Test-Path $Manifest)) {
        '{"synced":[],"agent_notice_shown":false}' | Set-Content -Path $Manifest -Encoding UTF8
    }
}

function Read-Manifest {
    Ensure-Manifest
    Get-Content -Raw $Manifest | ConvertFrom-Json
}

function Write-Manifest {
    param($Data)
    $Data | ConvertTo-Json -Depth 5 | Set-Content -Path $Manifest -Encoding UTF8
}

function Is-InManifest {
    param([string]$Target)
    $data = Read-Manifest
    $data.synced | Where-Object { $_.target -eq $Target } | Measure-Object | Select-Object -ExpandProperty Count | ForEach-Object { $_ -gt 0 }
}

function Add-ToManifest {
    param([string]$Source, [string]$Target, [string]$Strategy)
    $data = Read-Manifest
    $ts = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    # Remove any existing entry for this target
    $data.synced = @($data.synced | Where-Object { $_.target -ne $Target })
    $entry = [PSCustomObject]@{
        source    = $Source
        target    = $Target
        strategy  = $Strategy
        timestamp = $ts
    }
    $data.synced += $entry
    Write-Manifest $data
}

function Remove-FromManifest {
    param([string]$Target)
    $data = Read-Manifest
    $data.synced = @($data.synced | Where-Object { $_.target -ne $Target })
    Write-Manifest $data
}

# ---------------------------------------------------------------------------
# Registry cache
# ---------------------------------------------------------------------------
function Refresh-RegistryCache {
    New-Item -ItemType Directory -Force -Path $CacheDir | Out-Null

    if (Test-Path (Join-Path $RegistryCache ".git")) {
        $fetchHead = Join-Path $RegistryCache ".git\FETCH_HEAD"
        if (Test-Path $fetchHead) {
            $age = (Get-Date) - (Get-Item $fetchHead).LastWriteTime
            if ($age.TotalHours -lt $CacheTTLHours) {
                return
            }
        }
        Write-Info "Refreshing registry cache..."
        try {
            git -C $RegistryCache fetch --depth 1 origin HEAD 2>$null
            git -C $RegistryCache reset --hard FETCH_HEAD 2>$null
        } catch {
            Write-Warn "Could not refresh registry cache — using stale cache."
        }
    } else {
        Write-Info "Fetching registry from $RegistryUrl ..."
        try {
            git clone --depth 1 $RegistryUrl $RegistryCache 2>$null
        } catch {
            Write-Err "Could not reach registry at $RegistryUrl. Check your internet connection."
            exit 1
        }
    }
}

# ---------------------------------------------------------------------------
# push — copy user-sync/ files to VSCode config
# ---------------------------------------------------------------------------
function Invoke-Push {
    param([bool]$YesFlag = $false)
    Ensure-Manifest
    Write-Info "Pushing user-sync/ → VSCode config at: $VSCodeUser"

    $linked = 0
    $skipped = 0

    $files = Get-ChildItem -Path $UserSync -Recurse -File |
             Where-Object { $_.Name -ne ".gitkeep" -and $_.Extension -ne "" -and $_.Name -notlike "*.agent.md" }

    foreach ($file in $files) {
        $rel = $file.FullName.Substring($UserSync.Length + 1)
        $parts = $rel -split [regex]::Escape([IO.Path]::DirectorySeparatorChar)
        $subdir = $parts[0]
        $target = $null

        switch ($subdir) {
            "prompts" {
                $target = Join-Path $VSCodeUser $rel
            }
            "skills" {
                if ($file.Name -eq "SKILL.md") {
                    $skillName = $parts[1]
                    $target = Join-Path $VSCodeUser "skills\$skillName\SKILL.md"
                }
            }
            "instructions" {
                $target = Join-Path $VSCodeUser $rel
            }
            default { continue }
        }

        if ($null -eq $target) { continue }

        New-Item -ItemType Directory -Force -Path (Split-Path -Parent $target) | Out-Null

        if (Test-Path $target) {
            if ((Is-InManifest $target) -eq $true) {
                Remove-Item -Path $target -Force
            } else {
                Write-Warn "SKIP $rel — exists at target but not created by aidl (delete the target file first if you want to overwrite)"
                $skipped++
                continue
            }
        }

        Copy-Item -Path $file.FullName -Destination $target -Force
        Add-ToManifest -Source $file.FullName -Target $target -Strategy "copy"
        Write-Info "  Copied: $rel → $target"
        $linked++
    }

    Write-Host ""
    Write-Info "Push complete: $linked copied, $skipped skipped."

    # Agent discovery notice
    $data = Read-Manifest
    if (-not $data.agent_notice_shown) {
        $agentsPath = Join-Path $UserSync "agents"
        Write-Host ""
        Write-Warn "ACTION REQUIRED: Add to your VSCode settings.json to enable agent discovery:"
        Write-Warn "  `"chat.agentFilesLocations`": [`"$agentsPath`"]"
        $data.agent_notice_shown = $true
        Write-Manifest $data
    }
}

# ---------------------------------------------------------------------------
# pull — copy untracked VSCode files into user-sync/
# ---------------------------------------------------------------------------
function Invoke-Pull {
    param([bool]$YesFlag = $false)
    Ensure-Manifest
    Write-Info "Scanning VSCode config for untracked files..."

    $candidates = @()

    foreach ($subdir in @("prompts","skills","instructions")) {
        $srcDir = Join-Path $VSCodeUser $subdir
        if (-not (Test-Path $srcDir)) { continue }

        Get-ChildItem -Path $srcDir -Recurse -File | Where-Object { $_.Name -ne ".gitkeep" } | ForEach-Object {
            $file = $_.FullName
            $rel  = $file.Substring($VSCodeUser.Length + 1)
            $dest = Join-Path $UserSync $rel

            if (Test-Path $dest) {
                $srcHash = (Get-FileHash -Path $file  -Algorithm MD5).Hash
                $dstHash = (Get-FileHash -Path $dest -Algorithm MD5).Hash
                if ($srcHash -eq $dstHash) {
                    return  # identical, skip silently
                } else {
                    Write-Warn "SKIP $rel — content differs from repo copy (delete user-sync copy first if you want to import the VSCode version)"
                    return
                }
            }
            $script:candidates += $file
        }
    }

    if ($candidates.Count -eq 0) {
        Write-Info "Nothing new to import."
        return
    }

    Write-Host ""
    Write-Info "Found $($candidates.Count) untracked file(s):"
    foreach ($f in $candidates) {
        Write-Host "  $($f.Substring($VSCodeUser.Length + 1))"
    }

    $toImport = @()

    if ($YesFlag) {
        $toImport = $candidates
    } else {
        Write-Host ""
        $i = 1
        foreach ($f in $candidates) {
            Write-Host "  $i. $($f.Substring($VSCodeUser.Length + 1))"
            $i++
        }
        $answer = Read-Host "Import all? [y/N] (or enter numbers e.g. 1 3)"
        if ($answer -match '^[yY]$') {
            $toImport = $candidates
        } elseif ($answer -match '^[\d ]+$') {
            foreach ($n in ($answer -split '\s+')) {
                $idx = [int]$n - 1
                if ($idx -ge 0 -and $idx -lt $candidates.Count) {
                    $toImport += $candidates[$idx]
                }
            }
        } else {
            Write-Info "Nothing imported."
            return
        }
    }

    $imported = 0
    foreach ($file in $toImport) {
        $rel  = $file.Substring($VSCodeUser.Length + 1)
        $dest = Join-Path $UserSync $rel
        New-Item -ItemType Directory -Force -Path (Split-Path -Parent $dest) | Out-Null
        Copy-Item -Path $file -Destination $dest -Force
        Add-ToManifest -Source $dest -Target $file -Strategy "copy"
        Write-Info "  Imported: $rel → user-sync\$rel"
        $imported++
    }

    Write-Host ""
    Write-Info "Pull complete: $imported imported."
}

# ---------------------------------------------------------------------------
# list — list registry assets grouped by type
# ---------------------------------------------------------------------------
function Invoke-List {
    Refresh-RegistryCache

    $registryJson = Join-Path $RegistryCache "registry.json"

    if (Test-Path $registryJson) {
        $assets = Get-Content -Raw $registryJson | ConvertFrom-Json
        $grouped = @{}
        foreach ($a in $assets) {
            $t = $a.type.Substring(0,1).ToUpper() + $a.type.Substring(1) + "s"
            if (-not $grouped.ContainsKey($t)) { $grouped[$t] = @() }
            $grouped[$t] += $a
        }
        foreach ($group in ($grouped.Keys | Sort-Object)) {
            Write-Host ""
            Write-Host $group
            foreach ($item in $grouped[$group]) {
                Write-Host ("  {0,-20} {1}" -f $item.name, $item.description)
            }
        }
    } else {
        Write-Warn "No registry.json found — scanning directory structure..."
        foreach ($typeDir in @("skills","agents","prompts")) {
            $dir = Join-Path $RegistryCache $typeDir
            if (-not (Test-Path $dir)) { continue }
            Write-Host ""
            Write-Host ($typeDir.Substring(0,1).ToUpper() + $typeDir.Substring(1))
            Get-ChildItem -Path $dir -Directory | ForEach-Object {
                Write-Host "  $($_.Name)"
            }
        }
    }

    Write-Host ""
    Write-Info "Run .\scripts\sync.ps1 add <name> to install any asset."
}

# ---------------------------------------------------------------------------
# add — install asset from registry or URL
# ---------------------------------------------------------------------------
function Invoke-Add {
    param([string]$AssetArg, [bool]$YesFlag = $false)

    if ([string]::IsNullOrWhiteSpace($AssetArg)) {
        Write-Err "Usage: .\scripts\sync.ps1 add <name|url>"
        exit 1
    }

    if ($AssetArg -match '^https?://') {
        Add-FromUrl -Url $AssetArg -YesFlag $YesFlag
    } else {
        Add-FromRegistry -Name $AssetArg -YesFlag $YesFlag
    }
}

function Add-FromRegistry {
    param([string]$Name, [bool]$YesFlag)
    Refresh-RegistryCache

    $matchedPath = ""
    $matchedType = ""
    $registryJson = Join-Path $RegistryCache "registry.json"

    if (Test-Path $registryJson) {
        $assets = Get-Content -Raw $registryJson | ConvertFrom-Json
        $match = $assets | Where-Object { $_.name -eq $Name } | Select-Object -First 1
        if ($match) {
            $matchedPath = $match.path
            $matchedType = $match.type
        }
    }

    if ([string]::IsNullOrEmpty($matchedPath)) {
        foreach ($typeDir in @("skills","agents","prompts")) {
            $candidate = Join-Path $RegistryCache "$typeDir\$Name"
            if (Test-Path $candidate) {
                $matchedPath = "$typeDir\$Name"
                $matchedType = $typeDir.TrimEnd('s')
                break
            }
        }
    }

    if ([string]::IsNullOrEmpty($matchedPath)) {
        Write-Warn "Asset '$Name' not found in registry."
        Write-Host ""
        Write-Host "Available assets:"
        Invoke-List
        exit 1
    }

    if (-not $YesFlag) {
        Write-Host ""
        Write-Warn "About to install from registry:"
        Write-Host "  Registry: $RegistryUrl"
        Write-Host "  Asset:    $matchedPath"
        $answer = Read-Host "Proceed? [y/N]"
        if ($answer -notmatch '^[yY]$') { Write-Info "Aborted."; return }
    }

    $targetSubdir = switch ($matchedType) {
        "skill"       { "skills" }
        "agent"       { "agents" }
        "prompt"      { "prompts" }
        "instruction" { "instructions" }
        default       { "skills" }
    }

    $dest = Join-Path $UserSync "$targetSubdir\$Name"
    if (Test-Path $dest) {
        Write-Warn "Asset '$Name' already exists at user-sync\$targetSubdir\$Name — skipping."
        Write-Info "Delete the existing folder if you want to reinstall."
        return
    }

    $src = Join-Path $RegistryCache $matchedPath
    Copy-Item -Path $src -Destination $dest -Recurse -Force
    Write-Info "Added: $Name → user-sync\$targetSubdir\$Name (from $RegistryUrl)"
    Write-Info "Run .\scripts\sync.ps1 push to sync to VSCode."
}

function Add-FromUrl {
    param([string]$Url, [bool]$YesFlag)

    if (-not $YesFlag) {
        Write-Host ""
        Write-Warn "About to clone from:"
        Write-Host "  URL: $Url"
        Write-Host "This will download and install assets from an external source."
        $answer = Read-Host "Proceed? [y/N]"
        if ($answer -notmatch '^[yY]$') { Write-Info "Aborted."; return }
    }

    $tmpDir = Join-Path $CacheDir "tmp\$$"
    New-Item -ItemType Directory -Force -Path $tmpDir | Out-Null

    Write-Info "Cloning $Url ..."
    try {
        git clone --depth 1 $Url "$tmpDir\repo" 2>$null
    } catch {
        Write-Err "Could not clone $Url. Check the URL and your internet connection."
        Remove-Item -Recurse -Force $tmpDir
        exit 1
    }

    # Validate
    $validFile = Get-ChildItem -Path "$tmpDir\repo" -Recurse -Filter "*.md" |
        Where-Object { (Get-Content $_.FullName -Raw) -match "description:" -and (Get-Content $_.FullName -Raw) -match "type:" } |
        Select-Object -First 1

    if ($null -eq $validFile) {
        Write-Err "No valid asset files found in $Url (must have frontmatter with 'description' and 'type')."
        Remove-Item -Recurse -Force $tmpDir
        exit 1
    }

    $content = Get-Content $validFile.FullName -Raw
    $assetType = if ($content -match "(?m)^type:\s*(\S+)") { $matches[1] } else { "skill" }

    $targetSubdir = switch ($assetType) {
        "skill"       { "skills" }
        "agent"       { "agents" }
        "prompt"      { "prompts" }
        "instruction" { "instructions" }
        default       { "skills" }
    }

    $assetName = [IO.Path]::GetFileNameWithoutExtension($Url.TrimEnd('/').Split('/')[-1])
    $dest = Join-Path $UserSync "$targetSubdir\$assetName"

    if (Test-Path $dest) {
        if (-not $YesFlag) {
            $ow = Read-Host "Asset '$assetName' already exists. Overwrite? [y/N]"
            if ($ow -notmatch '^[yY]$') { Write-Info "Aborted."; Remove-Item -Recurse -Force $tmpDir; return }
        }
        Remove-Item -Recurse -Force $dest
    }

    Copy-Item -Path "$tmpDir\repo" -Destination $dest -Recurse -Force
    Remove-Item -Recurse -Force $tmpDir

    Write-Info "Added: $assetName → user-sync\$targetSubdir\$assetName (from $Url)"
    Write-Info "Run .\scripts\sync.ps1 push to sync to VSCode."
}

# ---------------------------------------------------------------------------
# status — show synced, new, and orphaned
# ---------------------------------------------------------------------------
function Invoke-Status {
    Ensure-Manifest
    Write-Host ""
    Write-Info "=== aidl sync status ==="
    Write-Host ""

    $data = Read-Manifest
    $synced = @($data.synced)

    Write-Host "Synced ($($synced.Count)):"
    foreach ($entry in $synced) {
        $srcOk = Test-Path $entry.source
        $tgtOk = Test-Path $entry.target
        $status = if ($srcOk -and $tgtOk) { "OK" } else { "ORPHANED" }
        $rel = $entry.source -replace [regex]::Escape($UserSync + "\"), ""
        Write-Host "  [$status] $rel"
    }

    Write-Host ""

    # New files in user-sync/ not in manifest
    $manifestTargets = @($synced | ForEach-Object { $_.source })
    $newFiles = Get-ChildItem -Path $UserSync -Recurse -File |
        Where-Object { $_.Name -ne ".gitkeep" -and $manifestTargets -notcontains $_.FullName }

    if ($newFiles.Count -gt 0) {
        Write-Host "New (not yet synced to VSCode):"
        foreach ($f in $newFiles) {
            $rel = $f.FullName.Substring($UserSync.Length + 1)
            Write-Host "  [NEW] $rel"
        }
        Write-Host ""
        Write-Info "Run .\scripts\sync.ps1 push to sync new files."
    }
}

# ---------------------------------------------------------------------------
# clean — remove orphaned manifest entries and stale copied files
# ---------------------------------------------------------------------------
function Invoke-Clean {
    Ensure-Manifest
    Write-Info "Cleaning orphaned manifest entries..."
    $data = Read-Manifest
    $removed = 0

    $data.synced = @($data.synced | ForEach-Object {
        $entry = $_
        if (-not (Test-Path $entry.source)) {
            Write-Warn "  Removing orphaned entry: $($entry.target)"
            if (Test-Path $entry.target) { Remove-Item -Path $entry.target -Force }
            $removed++
            return
        }
        $entry
    })

    Write-Manifest $data
    Write-Info "Clean complete: $removed orphaned entries removed."
}

# ---------------------------------------------------------------------------
# Main dispatch
# ---------------------------------------------------------------------------
$yesFlag = $Yes.IsPresent -or ($Arg1 -eq "--yes") -or ($Arg2 -eq "--yes")

switch ($Subcommand.ToLower()) {
    "push"   { Invoke-Push   -YesFlag $yesFlag }
    "pull"   { Invoke-Pull   -YesFlag $yesFlag }
    "add"    {
        $assetArg = if ($Arg1 -ne "--yes") { $Arg1 } else { "" }
        Invoke-Add -AssetArg $assetArg -YesFlag $yesFlag
    }
    "list"   { Invoke-List }
    "status" { Invoke-Status }
    "clean"  { Invoke-Clean }
    default  {
        Write-Host "Usage: .\scripts\sync.ps1 <subcommand> [options]"
        Write-Host ""
        Write-Host "Subcommands:"
        Write-Host "  push [--yes]             Copy user-sync/ files to VSCode user config"
        Write-Host "  pull [--yes]             Copy untracked VSCode files into user-sync/"
        Write-Host "  add <name|url> [--yes]   Install asset from registry or URL"
        Write-Host "  list                     List registry assets grouped by type"
        Write-Host "  status                   Show synced, new, and orphaned files"
        Write-Host "  clean                    Remove orphaned manifest entries"
        Write-Host ""
        Write-Host "Registry: $RegistryUrl"
    }
}
