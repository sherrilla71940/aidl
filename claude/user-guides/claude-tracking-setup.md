# Managing Claude Configurations with Dotfiles (Windows & macOS)

## Purpose
The purpose of this guide is to safely centralize, track, and version-control your Claude configurations (both Claude Code CLI and Claude Desktop MCP) using your terminal.

By moving files into a single `~/dotfiles` repository and creating symbolic links (symlinks), you can back up your preferences to a private cloud repository while strictly isolating sensitive data like API keys, session tokens, and local history.

---

## Step 1: Initialize Your Dotfiles Repo
Open your terminal (Git Bash on Windows or Terminal/iTerm on macOS) and run:

```bash
# Create a tracking folder inside your user home directory
mkdir -p ~/dotfiles/claude

# Move inside the directory and initialize Git
cd ~/dotfiles
git init
```

---

## Step 2: Move and Symlink Your Configuration

### Part A: For Claude Code (CLI) - *Same on Windows & Mac*
Claude Code stores its global settings in `~/.claude` on both platforms.

```bash
# 1. Move the configuration folder into your tracked dotfiles repo
mv ~/.claude ~/dotfiles/claude/

# 2. Link it back so Claude CLI can find its settings
ln -s ~/dotfiles/claude/.claude ~/.claude
```

### Part B: For Claude Desktop App (MCP Configs) - *Platform Specific*

#### 🪟 On Windows (Git Bash)
*Note: If you get a "Permission denied" error on Windows, restart Git Bash as an **Administrator**.*

```bash
# 1. Move the desktop config file into your tracked dotfiles repo
mv "$APPDATA/Claude/claude_desktop_config.json" ~/dotfiles/claude/

# 2. Symlink it back to its original location
ln -s ~/dotfiles/claude/claude_desktop_config.json "$APPDATA/Claude/claude_desktop_config.json"
```

#### 🍏 On macOS (Terminal / Zsh)
```bash
# 1. Move the desktop config file into your tracked dotfiles repo
mv ~/Library/Application\ Support/Claude/claude_desktop_config.json ~/dotfiles/claude/

# 2. Symlink it back to its original location
ln -s ~/dotfiles/claude/claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

---

## Step 3: Secure Your Private Data
You must prevent Git from tracking active sessions or private credentials. Create a `.gitignore` file inside your tracking directory.

```bash
nano ~/dotfiles/claude/.gitignore
```

Paste the following rules into the file, then save and exit:

```text
# Block API keys, active login tokens, and session history
.claude/sessions/
.claude/keys/
.claude/login/
.claude/history/
.claude/*.local.json
```

---

## Step 4: Commit and Normalize Line Endings
Windows uses `CRLF` for line breaks, while Mac uses `LF`. To prevent Git from flagging text format mismatches when syncing between platforms, run this command in your repository:

```bash
# Fix cross-platform line ending conversions
git config core.autocrlf true

# Stage and save your changes
cd ~/dotfiles
git add claude/
git commit -m "chore: track cross-platform claude settings"
```
