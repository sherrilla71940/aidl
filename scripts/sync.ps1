# copilot-asset-manager sync.ps1 — Bidirectional sync between copilot-asset-manager repo and VSCode user config (Windows)
# Usage: .\scripts\sync.ps1 <subcommand> [options]
#   push [--yes]   Copy sync/ files to VSCode config
#   pull [--yes]   Copy untracked VSCode files into sync/
#   status         Show synced, new, and orphaned files
#   clean          Remove orphaned manifest entries

[CmdletBinding()]
param(
    [Parameter(Position=0)][string]$Subcommand = "",
    [Parameter(Position=1)][string]$Arg1 = "",
    [switch]$Yes
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot    = Split-Path -Parent $ScriptDir
$UserSync    = Join-Path $RepoRoot "sync"
$Manifest    = Join-Path $RepoRoot ".sync-manifest.json"
$VSCodeUser  = Join-Path $env:APPDATA "Code\User"

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
# push — copy sync/ files to VSCode config
# ---------------------------------------------------------------------------
function Invoke-Push {
    param([bool]$YesFlag = $false)
    Ensure-Manifest
    Write-Info "Pushing sync/ → VSCode config at: $VSCodeUser"

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
            "hooks" {
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
                Write-Warn "SKIP $rel — exists at target but not created by copilot-asset-manager (delete the target file first if you want to overwrite)"
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
        Write-Host ""
        Write-Warn "ACTION REQUIRED: Add to your VSCode settings.json to enable agent discovery:"
        Write-Warn "  `"chat.agentFilesLocations`": [`"$(Join-Path $UserSync 'agents')`"]"
        $data.agent_notice_shown = $true
        Write-Manifest $data
    }
}

# ---------------------------------------------------------------------------
# pull — copy untracked VS Code files into sync/
# ---------------------------------------------------------------------------
function Invoke-Pull {
    param([bool]$YesFlag = $false)
    Ensure-Manifest
    Write-Info "Scanning VSCode config for untracked files..."

    $candidates = @()

    foreach ($subdir in @("prompts","skills","instructions","hooks")) {
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
                }

                if ($YesFlag) {
                    Write-Warn "SKIP $rel — content differs (repo copy kept; use pull without --yes to resolve interactively)"
                    return
                }

                Write-Host ""
                Write-Warn "CONFLICT: $rel"
                $repoLines = Get-Content $dest
                $vsLines   = Get-Content $file
                $diff = Compare-Object $repoLines $vsLines -PassThru | ForEach-Object {
                    $side = if ($_.SideIndicator -eq '<=') { '- ' } else { '+ ' }
                    "$side$_"
                }
                $diff | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
                if ($diff.Count -gt 20) { Write-Host "  ... ($($diff.Count - 20) more lines)" }
                Write-Host ""
                $choice = Read-Host "  Keep repo version (k), use VS Code version (v), skip (s)? [k/v/s]"
                switch ($choice.ToLower()) {
                    'v' {
                        Copy-Item -Path $file -Destination $dest -Force
                        Write-Info "  Updated: $rel (VS Code version accepted)"
                    }
                    'k' {
                        Write-Info "  Kept: $rel (repo version kept)"
                    }
                    default {
                        Write-Info "  Skipped: $rel"
                    }
                }
                return
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
        Write-Info "  Imported: $rel → sync\$rel"
        $imported++
    }

    Write-Host ""
    Write-Info "Pull complete: $imported imported."
}

# ---------------------------------------------------------------------------
# status — show synced, new, and orphaned
# ---------------------------------------------------------------------------
function Invoke-Status {
    Ensure-Manifest
    Write-Host ""
    Write-Info "=== copilot-asset-manager sync status ==="
    Write-Host ""

    $data = Read-Manifest
    $synced = @($data.synced)

    Write-Host "Synced ($($synced.Count)):"
    foreach ($entry in $synced) {
        $srcOk = Test-Path $entry.source
        $tgtOk = Test-Path $entry.target
        $status = if ($srcOk -and $tgtOk) { "OK" } else { "ORPHANED" }
        if ($entry.source.StartsWith($UserSync, [System.StringComparison]::OrdinalIgnoreCase)) {
            $rel = $entry.source.Substring($UserSync.Length + 1)
        } else {
            $rel = $entry.source
        }
        Write-Host "  [$status] $rel"
    }

    Write-Host ""

    # New files in sync/ not in manifest
    $manifestTargets = @($synced | ForEach-Object { $_.source })
    $newFiles = @(Get-ChildItem -Path $UserSync -Recurse -File |
        Where-Object { $_.Name -ne ".gitkeep" -and $manifestTargets -notcontains $_.FullName })

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
$yesFlag = $Yes.IsPresent -or ($Arg1 -eq "--yes")

switch ($Subcommand.ToLower()) {
    "push"   { Invoke-Push   -YesFlag $yesFlag }
    "pull"   { Invoke-Pull   -YesFlag $yesFlag }
    "status" { Invoke-Status }
    "clean"  { Invoke-Clean }
    default  {
        Write-Host "Usage: .\scripts\sync.ps1 <subcommand> [options]"
        Write-Host ""
        Write-Host "Subcommands:"
        Write-Host "  push [--yes]   Copy sync/ files to VSCode user config"
        Write-Host "  pull [--yes]   Copy untracked VSCode files into sync/"
        Write-Host "  status         Show synced, new, and orphaned files"
        Write-Host "  clean          Remove orphaned manifest entries"
    }
}
