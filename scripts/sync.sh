#!/usr/bin/env bash
# aidl sync.sh — Bidirectional sync between aidl repo and VSCode user config
# Usage: ./scripts/sync.sh <subcommand> [options]
#   push [--yes]         — sync user-sync/ files to VSCode config
#   pull [--yes]         — copy untracked VSCode files into user-sync/
#   add <name|url> [--yes] — install asset from registry or URL
#   list                 — list registry assets grouped by type
#   status               — show synced, new, and orphaned files
#   clean                — remove orphaned synced files, update manifest

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
USER_SYNC="$REPO_ROOT/user-sync"
MANIFEST="$REPO_ROOT/.sync-manifest.json"
CACHE_DIR="$REPO_ROOT/.aidl-cache"

# Detect VSCode user config path
if $IS_WINDOWS; then
  VSCODE_USER="$(normalize_path "${APPDATA:-$HOME/AppData/Roaming}")/Code/User"
elif [[ "$(uname)" == "Darwin" ]]; then
  VSCODE_USER="$HOME/Library/Application Support/Code/User"
else
  VSCODE_USER="${XDG_CONFIG_HOME:-$HOME/.config}/Code/User"
fi

REGISTRY_URL="${AIDL_REGISTRY:-https://github.com/github/awesome-copilot}"
CACHE_TTL_HOURS="${AIDL_CACHE_TTL:-24}"
REGISTRY_CACHE="$CACHE_DIR/registry"

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
# Registry cache management
# ---------------------------------------------------------------------------
refresh_registry_cache() {
  mkdir -p "$CACHE_DIR"

  if [[ -d "$REGISTRY_CACHE/.git" ]]; then
    if [[ -f "$REGISTRY_CACHE/.git/FETCH_HEAD" ]]; then
      local fetch_time now age_hours
      fetch_time="$(date -r "$REGISTRY_CACHE/.git/FETCH_HEAD" +%s 2>/dev/null || stat -c %Y "$REGISTRY_CACHE/.git/FETCH_HEAD" 2>/dev/null || echo 0)"
      now="$(date +%s)"
      age_hours=$(( (now - fetch_time) / 3600 ))
      if (( age_hours < CACHE_TTL_HOURS )); then
        return 0
      fi
    fi

    info "Refreshing registry cache..."
    if ! git -C "$REGISTRY_CACHE" fetch --depth 1 origin HEAD 2>/dev/null && \
       git -C "$REGISTRY_CACHE" reset --hard FETCH_HEAD 2>/dev/null; then
      warn "Could not refresh registry cache — using stale cache."
    fi
  else
    info "Fetching registry from ${REGISTRY_URL} ..."
    if ! git clone --depth 1 "$REGISTRY_URL" "$REGISTRY_CACHE" 2>/dev/null; then
      error "Could not reach registry at ${REGISTRY_URL}. Check your internet connection."
      exit 1
    fi
  fi
}

# ---------------------------------------------------------------------------
# push — sync user-sync/ files to VSCode config
# ---------------------------------------------------------------------------
cmd_push() {
  local yes=false
  [[ "${1:-}" == "--yes" ]] && yes=true

  ensure_manifest
  info "Pushing user-sync/ → VSCode config at: $VSCODE_USER"

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
      *)              continue ;;
    esac

    mkdir -p "$(dirname "$target")"

    if [[ -e "$target" ]] || [[ -L "$target" ]]; then
      if is_in_manifest "$target"; then
        rm -f "$target"
      else
        warn "SKIP $rel — exists at target but not created by aidl (delete the target file first if you want to overwrite)"
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

  local agents_path="$USER_SYNC/agents"
  local notice_shown
  notice_shown="$(manifest_get agent_notice_shown)"

  if [[ "$notice_shown" != "true" ]]; then
    echo ""
    warn "ACTION REQUIRED: Add to your VSCode settings.json to enable agent discovery:"
    warn "  \"chat.agentFilesLocations\": [\"${agents_path}\"]"

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
# pull — copy untracked VSCode files into user-sync/
# ---------------------------------------------------------------------------
cmd_pull() {
  local yes=false
  [[ "${1:-}" == "--yes" ]] && yes=true

  ensure_manifest
  info "Scanning VSCode config for untracked files..."

  local candidates=()

  for subdir in prompts skills instructions; do
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
        else
          warn "SKIP $rel — content differs from repo copy (delete user-sync copy first if you want to import the VSCode version)"
          continue
        fi
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
    info "  Imported: $rel → user-sync/$rel"
    (( imported++ )) || true
  done

  echo ""
  info "Pull complete: ${imported} imported."
}

# ---------------------------------------------------------------------------
# list — list registry assets grouped by type
# ---------------------------------------------------------------------------
cmd_list() {
  refresh_registry_cache

  local registry_json="$REGISTRY_CACHE/registry.json"

  if [[ -f "$registry_json" ]]; then
    run_python - "$registry_json" <<'PYEOF'
import json, sys

with open(sys.argv[1]) as f:
    assets = json.load(f)

grouped = {}
for a in assets:
    t = a.get('type', 'other').capitalize() + 's'
    grouped.setdefault(t, []).append(a)

for group, items in sorted(grouped.items()):
    print(f"\n{group}")
    for item in items:
        name = item.get('name','?')
        desc = item.get('description','')
        print(f"  {name:<20} {desc}")
PYEOF
  else
    warn "No registry.json found — scanning directory structure..."
    for type_dir in skills agents prompts; do
      local dir="$REGISTRY_CACHE/$type_dir"
      [[ -d "$dir" ]] || continue
      echo ""
      echo "${type_dir^}"
      for item in "$dir"/*/; do
        [[ -d "$item" ]] || continue
        local name
        name="$(basename "$item")"
        echo "  $name"
      done
    done
  fi

  echo ""
  info "Run ./scripts/sync.sh add <name> to install any asset."
}

# ---------------------------------------------------------------------------
# add — install asset from registry or URL
# ---------------------------------------------------------------------------
cmd_add() {
  local arg="${1:-}"
  local yes=false
  [[ "${2:-}" == "--yes" ]] && yes=true

  if [[ -z "$arg" ]]; then
    error "Usage: ./scripts/sync.sh add <name|url>"
    exit 1
  fi

  if [[ "$arg" == https://* ]] || [[ "$arg" == http://* ]]; then
    _add_from_url "$arg" "$yes"
  else
    _add_from_registry "$arg" "$yes"
  fi
}

_add_from_registry() {
  local name="$1" yes="$2"
  refresh_registry_cache

  local matched_path="" matched_type=""
  local registry_json="$REGISTRY_CACHE/registry.json"

  if [[ -f "$registry_json" ]]; then
    local result
    result="$(run_python - "$registry_json" "$name" <<'PYEOF'
import json, sys

with open(sys.argv[1]) as f:
    assets = json.load(f)

target = sys.argv[2].lower()
for a in assets:
    if a.get('name','').lower() == target:
        print(a.get('type','') + ':' + a.get('path',''))
        break
PYEOF
)"
    if [[ -n "$result" ]]; then
      matched_type="${result%%:*}"
      matched_path="${result#*:}"
    fi
  fi

  if [[ -z "$matched_path" ]]; then
    for type_dir in skills agents prompts; do
      if [[ -d "$REGISTRY_CACHE/$type_dir/$name" ]]; then
        matched_path="$type_dir/$name"
        matched_type="${type_dir%s}"
        break
      fi
    done
  fi

  if [[ -z "$matched_path" ]]; then
    error "Asset '${name}' not found in registry."
    echo ""
    echo "Available assets:"
    cmd_list
    exit 1
  fi

  local full_asset_path="$REGISTRY_CACHE/$matched_path"
  if ! $yes; then
    echo ""
    warn "About to install from registry:"
    echo "  Registry: $REGISTRY_URL"
    echo "  Asset:    $matched_path"
    read -r -p "Proceed? [y/N] " answer
    [[ "$answer" =~ ^[yY]$ ]] || { info "Aborted."; exit 0; }
  fi

  local target_subdir
  case "$matched_type" in
    skill)       target_subdir="skills" ;;
    agent)       target_subdir="agents" ;;
    prompt)      target_subdir="prompts" ;;
    instruction) target_subdir="instructions" ;;
    *)
      local main_file
      main_file="$(find "$full_asset_path" -maxdepth 1 -name '*.md' | head -1)"
      if [[ -n "$main_file" ]]; then
        matched_type="$(awk '/^---/{n++; next} n==1' "$main_file" | grep '^type:' | cut -d: -f2 | tr -d ' ')"
      fi
      case "$matched_type" in
        skill) target_subdir="skills" ;;
        agent) target_subdir="agents" ;;
        prompt) target_subdir="prompts" ;;
        instruction) target_subdir="instructions" ;;
        *) target_subdir="skills" ;;
      esac
      ;;
  esac

  local dest="$USER_SYNC/$target_subdir/$name"

  if [[ -e "$dest" ]]; then
    warn "Asset '$name' already exists at user-sync/$target_subdir/$name — skipping."
    info "Delete the existing folder if you want to reinstall."
    exit 0
  fi

  cp -r "$full_asset_path" "$dest"
  info "Added: $name → user-sync/$target_subdir/$name (from $REGISTRY_URL)"
  info "Run ./scripts/sync.sh push to sync to VSCode."
}

_add_from_url() {
  local url="$1" yes="$2"

  if ! $yes; then
    echo ""
    warn "About to clone from:"
    echo "  URL: $url"
    echo "This will download and install assets from an external source."
    read -r -p "Proceed? [y/N] " answer
    [[ "$answer" =~ ^[yY]$ ]] || { info "Aborted."; exit 0; }
  fi

  local tmp_dir="$CACHE_DIR/tmp/$$"
  mkdir -p "$tmp_dir"

  info "Cloning $url ..."
  if ! git clone --depth 1 "$url" "$tmp_dir/repo" 2>/dev/null; then
    error "Could not clone $url. Check the URL and your internet connection."
    rm -rf "$tmp_dir"
    exit 1
  fi

  local valid_file=""
  while IFS= read -r -d '' f; do
    if grep -q '^description:' "$f" 2>/dev/null && grep -q '^type:' "$f" 2>/dev/null; then
      valid_file="$f"
      break
    fi
  done < <(find "$tmp_dir/repo" -name '*.md' -print0 2>/dev/null)

  if [[ -z "$valid_file" ]]; then
    error "No valid asset files found in $url (must have frontmatter with 'description' and 'type')."
    rm -rf "$tmp_dir"
    exit 1
  fi

  local asset_type
  asset_type="$(awk '/^---/{n++; next} n==1' "$valid_file" | grep '^type:' | cut -d: -f2 | tr -d ' ')"

  local target_subdir
  case "$asset_type" in
    skill) target_subdir="skills" ;;
    agent) target_subdir="agents" ;;
    prompt) target_subdir="prompts" ;;
    instruction) target_subdir="instructions" ;;
    *) target_subdir="skills" ;;
  esac

  local asset_name
  asset_name="$(basename "$url" .git)"
  local dest="$USER_SYNC/$target_subdir/$asset_name"

  if [[ -e "$dest" ]]; then
    if ! $yes; then
      read -r -p "Asset '$asset_name' already exists. Overwrite? [y/N] " ow
      [[ "$ow" =~ ^[yY]$ ]] || { info "Aborted."; rm -rf "$tmp_dir"; exit 0; }
    fi
    rm -rf "$dest"
  fi

  cp -r "$tmp_dir/repo" "$dest"
  rm -rf "$tmp_dir"

  info "Added: $asset_name → user-sync/$target_subdir/$asset_name (from $url)"
  info "Run ./scripts/sync.sh push to sync to VSCode."
}

# ---------------------------------------------------------------------------
# status — show synced, new, and orphaned files
# ---------------------------------------------------------------------------
cmd_status() {
  ensure_manifest
  echo ""
  info "=== aidl sync status ==="
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
  add)    cmd_add "$@" ;;
  list)   cmd_list ;;
  status) cmd_status ;;
  clean)  cmd_clean ;;
  *)
    echo "Usage: ./scripts/sync.sh <subcommand> [options]"
    echo ""
    echo "Subcommands:"
    echo "  push [--yes]         Sync user-sync/ files to VSCode user config"
    echo "  pull [--yes]         Copy untracked VSCode files into user-sync/"
    echo "  add <name|url> [--yes]  Install asset from registry or URL"
    echo "  list                 List registry assets grouped by type"
    echo "  status               Show synced, new, and orphaned files"
    echo "  clean                Remove orphaned synced files, update manifest"
    echo ""
    echo "Registry: $REGISTRY_URL"
    ;;
esac
