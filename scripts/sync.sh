#!/usr/bin/env bash
# copilot-asset-manager sync.sh — Bidirectional sync between copilot-asset-manager repo and VSCode user config
# Usage: ./scripts/sync.sh <subcommand> [options]
#   push [--yes]   — sync sync/ files to VSCode user config
#   pull [--yes]   — copy untracked VSCode files into sync/
#   status         — show synced, new, and orphaned files
#   clean          — remove orphaned synced files, update manifest

set -euo pipefail

IS_WINDOWS=false
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*) IS_WINDOWS=true ;;
esac

normalize_path() {
  local path="$1"

  if ! $IS_WINDOWS; then
    printf '%s\n' "$path"
    return
  fi

  if command -v cygpath >/dev/null 2>&1; then
    cygpath -m "$path"
    return
  fi

  path="${path//\\//}"
  if [[ "$path" =~ ^/([a-zA-Z])/(.*)$ ]]; then
    printf '%s:/%s\n' "${BASH_REMATCH[1]^}" "${BASH_REMATCH[2]}"
  else
    printf '%s\n' "$path"
  fi
}

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$(normalize_path "$( cd "$SCRIPT_DIR/.." && pwd )")"
USER_SYNC="$REPO_ROOT/sync"
MANIFEST="$REPO_ROOT/.sync-manifest.json"

# Detect VSCode user config path
if $IS_WINDOWS; then
  VSCODE_USER="$(normalize_path "${APPDATA:-$HOME/AppData/Roaming}")/Code/User"
elif [[ "$(uname)" == "Darwin" ]]; then
  VSCODE_USER="$HOME/Library/Application Support/Code/User"
else
  VSCODE_USER="${XDG_CONFIG_HOME:-$HOME/.config}/Code/User"
fi

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()    { echo -e "${GREEN}$*${NC}"; }
warn()    { echo -e "${YELLOW}$*${NC}"; }
error()   { echo -e "${RED}ERROR: $*${NC}" >&2; }

PYTHON_CMD=()

resolve_python() {
  if $IS_WINDOWS && command -v py >/dev/null 2>&1 && py -3 -c "import sys" >/dev/null 2>&1; then
    PYTHON_CMD=(py -3)
    return
  fi

  if command -v python3 >/dev/null 2>&1 && python3 -c "import sys" >/dev/null 2>&1; then
    PYTHON_CMD=(python3)
    return
  fi

  if command -v python >/dev/null 2>&1 && python -c "import sys" >/dev/null 2>&1; then
    PYTHON_CMD=(python)
    return
  fi

  error "Python 3 is required to run ./scripts/sync.sh. Install Python or use ./scripts/sync.ps1 on Windows."
  exit 1
}

run_python() {
  "${PYTHON_CMD[@]}" "$@"
}

resolve_python

ensure_manifest() {
  if [[ ! -f "$MANIFEST" ]]; then
    echo '{"synced":[],"agent_notice_shown":false}' > "$MANIFEST"
  fi
}

manifest_get() {
  local field="$1"
  grep -o "\"${field}\":[^,}]*" "$MANIFEST" 2>/dev/null | head -1 | cut -d: -f2 | tr -d ' "' || echo ""
}

manifest_has_path() {
  local field="$1" path="$2"

  run_python - "$MANIFEST" "$field" "$path" "$IS_WINDOWS" <<'PYEOF' >/dev/null 2>&1
import json, sys

manifest_file, field, query, is_windows = sys.argv[1:5]

def normalize(path):
    path = path.replace('\\', '/')
    return path.lower() if is_windows.lower() == 'true' else path

with open(manifest_file, encoding='utf-8-sig') as f:
    data = json.load(f)

query = normalize(query)
for entry in data.get('synced', []):
    if normalize(entry.get(field, '')) == query:
        sys.exit(0)

sys.exit(1)
PYEOF
}

is_in_manifest() {
  local target="$1"
  manifest_has_path "target" "$target"
}

is_source_in_manifest() {
  local source="$1"
  manifest_has_path "source" "$source"
}

remove_from_manifest() {
  local target="$1"
  local tmp
  tmp="$(mktemp)"
  grep -v "\"target\":\"${target}\"" "$MANIFEST" > "$tmp" && mv "$tmp" "$MANIFEST"
}

add_to_manifest() {
  local source="$1" target="$2" strategy="$3"
  local ts
  ts="$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date +%Y-%m-%dT%H:%M:%SZ)"
  local entry="    { \"source\": \"${source}\", \"target\": \"${target}\", \"strategy\": \"${strategy}\", \"timestamp\": \"${ts}\" }"
  local tmp
  tmp="$(mktemp)"
  run_python - "$MANIFEST" "$entry" > "$tmp" <<'PYEOF' && mv "$tmp" "$MANIFEST"
import json, sys

manifest_file = sys.argv[1]
entry_str = sys.argv[2]

with open(manifest_file, encoding='utf-8-sig') as f:
    data = json.load(f)

import json as _json
entry = _json.loads(entry_str)
data['synced'] = [s for s in data['synced'] if s.get('target') != entry['target']]
data['synced'].append(entry)
print(_json.dumps(data, indent=2))
PYEOF
}

# ---------------------------------------------------------------------------
# push — sync sync/ files to VSCode user config
# ---------------------------------------------------------------------------
cmd_push() {
  local yes=false
  [[ "${1:-}" == "--yes" ]] && yes=true

  ensure_manifest
  info "Pushing sync/ → VSCode config at: $VSCODE_USER"

  local linked=0 skipped=0
  local strategy="symlink" action="Linked" summary="linked"

  if $IS_WINDOWS; then
    strategy="copy"
    action="Copied"
    summary="copied"
  fi

  while IFS= read -r -d '' file; do
    local rel="${file#$USER_SYNC/}"
    local target=""

    case "$rel" in
      prompts/*)      target="$VSCODE_USER/prompts/${rel#prompts/}" ;;
      skills/*/SKILL.md)
        local skill_name
        skill_name="$(echo "$rel" | cut -d/ -f2)"
        target="$VSCODE_USER/skills/${skill_name}/SKILL.md"
        ;;
      instructions/*) target="$VSCODE_USER/instructions/${rel#instructions/}" ;;
      hooks/*)        target="$VSCODE_USER/hooks/${rel#hooks/}" ;;
      *)              continue ;;
    esac

    mkdir -p "$(dirname "$target")"

    if [[ -e "$target" ]] || [[ -L "$target" ]]; then
      if is_in_manifest "$target"; then
        rm -f "$target"
      else
        warn "SKIP $rel — exists at target but not created by copilot-asset-manager (delete the target file first if you want to overwrite)"
        (( skipped++ )) || true
        continue
      fi
    fi

    if $IS_WINDOWS; then
      cp "$file" "$target"
    else
      ln -s "$file" "$target"
    fi

    add_to_manifest "$file" "$target" "$strategy"
    info "  ${action}: $rel → $target"
    (( linked++ )) || true
  done < <(find "$USER_SYNC" -type f ! -name '.gitkeep' ! -name '*.agent.md' -print0 2>/dev/null)

  echo ""
  info "Push complete: ${linked} ${summary}, ${skipped} skipped."

  local notice_shown
  notice_shown="$(manifest_get agent_notice_shown)"

  if [[ "$notice_shown" != "true" ]]; then
    echo ""
    warn "ACTION REQUIRED: Add to your VSCode settings.json to enable agent discovery:"
    warn "  \"chat.agentFilesLocations\": [\"${USER_SYNC}/agents\"]"

    local tmp
    tmp="$(mktemp)"
    run_python - "$MANIFEST" > "$tmp" <<'PYEOF' && mv "$tmp" "$MANIFEST"
import json, sys

with open(sys.argv[1], encoding='utf-8-sig') as f:
    data = json.load(f)

data['agent_notice_shown'] = True
print(json.dumps(data, indent=2))
PYEOF
  fi
}

# ---------------------------------------------------------------------------
# pull — copy untracked VSCode files into sync/
# ---------------------------------------------------------------------------
cmd_pull() {
  local yes=false
  [[ "${1:-}" == "--yes" ]] && yes=true

  ensure_manifest
  info "Scanning VSCode config for untracked files..."

  local candidates=()

  for subdir in prompts skills instructions hooks; do
    local src_dir="$VSCODE_USER/$subdir"
    [[ -d "$src_dir" ]] || continue

    while IFS= read -r -d '' file; do
      if [[ -L "$file" ]]; then
        local link_target
        link_target="$(readlink "$file")"
        [[ "$link_target" == "$USER_SYNC"* ]] && continue
      fi

      local rel="${file#$VSCODE_USER/}"
      local dest="$USER_SYNC/$rel"

      if [[ -f "$dest" ]]; then
        if diff -q "$file" "$dest" >/dev/null 2>&1; then
          continue
        fi

        if $yes; then
          warn "SKIP $rel — content differs (repo copy kept; use pull without --yes to resolve interactively)"
          continue
        fi

        echo ""
        warn "CONFLICT: $rel"
        diff --unified=2 --label "sync/ (repo)" --label "VS Code" "$dest" "$file" || true
        echo ""
        read -r -p "  Keep repo version (k), use VS Code version (v), skip (s)? [k/v/s] " choice
        case "${choice,,}" in
          v)
            cp "$file" "$dest"
            info "  Updated: $rel (VS Code version accepted)"
            ;;
          k)
            info "  Kept: $rel (repo version kept)"
            ;;
          *)
            info "  Skipped: $rel"
            ;;
        esac
        continue
      fi

      candidates+=("$file")
    done < <(find "$src_dir" -type f ! -name '.gitkeep' -print0 2>/dev/null)
  done

  if [[ ${#candidates[@]} -eq 0 ]]; then
    info "Nothing new to import."
    return 0
  fi

  echo ""
  info "Found ${#candidates[@]} untracked file(s):"
  for f in "${candidates[@]}"; do
    echo "  ${f#$VSCODE_USER/}"
  done

  local to_import=()

  if $yes; then
    to_import=("${candidates[@]}")
  else
    echo ""
    echo "Import all? [y/N] (or enter numbers e.g. 1 3 to select specific files)"
    for i in "${!candidates[@]}"; do
      echo "  $((i+1)). ${candidates[$i]#$VSCODE_USER/}"
    done
    read -r -p "> " answer
    if [[ "$answer" =~ ^[yY]$ ]]; then
      to_import=("${candidates[@]}")
    elif [[ "$answer" =~ ^[0-9\ ]+$ ]]; then
      for n in $answer; do
        local idx=$(( n - 1 ))
        [[ $idx -ge 0 && $idx -lt ${#candidates[@]} ]] && to_import+=("${candidates[$idx]}")
      done
    else
      info "Nothing imported."
      return 0
    fi
  fi

  local imported=0
  for file in "${to_import[@]}"; do
    local rel="${file#$VSCODE_USER/}"
    local dest="$USER_SYNC/$rel"
    mkdir -p "$(dirname "$dest")"
    cp "$file" "$dest"
    add_to_manifest "$dest" "$file" "copy"
    info "  Imported: $rel → sync/$rel"
    (( imported++ )) || true
  done

  echo ""
  info "Pull complete: ${imported} imported."
}

# ---------------------------------------------------------------------------
# status — show synced, new, and orphaned files
# ---------------------------------------------------------------------------
cmd_status() {
  ensure_manifest
  echo ""
  info "=== copilot-asset-manager sync status ==="
  echo ""

  if [[ -f "$MANIFEST" ]]; then
    run_python - "$MANIFEST" "$USER_SYNC" "$VSCODE_USER" "$IS_WINDOWS" <<'PYEOF'
import json, os, sys

manifest_file, user_sync, vscode_user, is_windows = sys.argv[1:5]

def normalize(path):
    path = path.replace('\\', '/')
    return path.lower() if is_windows.lower() == 'true' else path

with open(manifest_file, encoding='utf-8-sig') as f:
    data = json.load(f)

synced = data.get('synced', [])
print(f"Synced ({len(synced)}):")
for entry in synced:
    src = entry.get('source','')
    tgt = entry.get('target','')
    src_exists = os.path.exists(src)
    tgt_exists = os.path.lexists(tgt)
    status = "OK" if src_exists and tgt_exists else "ORPHANED"
    display_src = src.replace('\\', '/')
    display_user_sync = user_sync.replace('\\', '/').rstrip('/')
    normalized_src = normalize(src)
    normalized_user_sync = normalize(user_sync).rstrip('/')
    if normalized_src.startswith(normalized_user_sync + '/'):
        rel = display_src[len(display_user_sync) + 1:]
    else:
        rel = src
    print(f"  [{status}] {rel}")
PYEOF
  fi

  echo ""
  local new_files=()
  while IFS= read -r -d '' f; do
    if ! is_source_in_manifest "$f"; then
      new_files+=("${f#$USER_SYNC/}")
    fi
  done < <(find "$USER_SYNC" -type f ! -name '.gitkeep' -print0 2>/dev/null)

  if [[ ${#new_files[@]} -gt 0 ]]; then
    echo "New (not yet synced to VSCode):"
    for f in "${new_files[@]}"; do
      echo "  [NEW] $f"
    done
    echo ""
    info "Run ./scripts/sync.sh push to sync new files."
  fi
}

# ---------------------------------------------------------------------------
# clean — remove orphaned synced files, update manifest
# ---------------------------------------------------------------------------
cmd_clean() {
  ensure_manifest
  local removed=0

  if $IS_WINDOWS; then
    info "Cleaning orphaned manifest entries..."

    local report
    report="$(mktemp)"
    run_python - "$MANIFEST" <<'PYEOF' > "$report"
import json, os, sys

manifest_file = sys.argv[1]

with open(manifest_file, encoding='utf-8-sig') as f:
    data = json.load(f)

kept = []
removed = 0
for entry in data.get('synced', []):
    source = entry.get('source', '')
    target = entry.get('target', '')
    if os.path.exists(source):
        kept.append(entry)
        continue
    print(f"REMOVE::{target}")
    removed += 1

data['synced'] = kept
with open(manifest_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print(f"COUNT::{removed}")
PYEOF

    while IFS= read -r line; do
      case "$line" in
        REMOVE::*)
          local target="${line#REMOVE::}"
          warn "  Removing orphaned entry: $target"
          if [[ -e "$target" ]] || [[ -L "$target" ]]; then
            rm -f "$target"
          fi
          ;;
        COUNT::*)
          removed="${line#COUNT::}"
          ;;
      esac
    done < "$report"

    rm -f "$report"
    info "Clean complete: ${removed} orphaned entr$( [[ "$removed" == "1" ]] && echo y || echo ies ) removed."
    return
  fi

  info "Cleaning dead symlinks..."
  while IFS= read -r -d '' link; do
    if [[ ! -e "$link" ]]; then
      warn "  Removing dead symlink: $link"
      rm -f "$link"
      remove_from_manifest "$link"
      (( removed++ )) || true
    fi
  done < <(find "$VSCODE_USER" -type l -print0 2>/dev/null)

  info "Clean complete: ${removed} dead symlink(s) removed."
}

# ---------------------------------------------------------------------------
# Main dispatch
# ---------------------------------------------------------------------------
subcmd="${1:-}"
shift || true

case "$subcmd" in
  push)   cmd_push "$@" ;;
  pull)   cmd_pull "$@" ;;
  status) cmd_status ;;
  clean)  cmd_clean ;;
  *)
    echo "Usage: ./scripts/sync.sh <subcommand> [options]"
    echo ""
    echo "Subcommands:"
    echo "  push [--yes]   Sync sync/ files to VSCode user config"
    echo "  pull [--yes]   Copy untracked VSCode files into sync/"
    echo "  status         Show synced, new, and orphaned files"
    echo "  clean          Remove orphaned synced files, update manifest"
    ;;
esac
