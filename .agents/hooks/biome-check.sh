#!/usr/bin/env bash
set -euo pipefail

python3 - <<'PY'
import json
import os
import shutil
import subprocess
import sys

LINT_EXTS = (".html", ".htm", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".css", ".json", ".jsonc")


def emit(obj):
    sys.stdout.write(json.dumps(obj) + "\n")
    sys.exit(0)


try:
    payload = json.load(sys.stdin)
except Exception:
    emit({})

# Only gate normal turn completions, and avoid looping if a Stop hook already forced continuation.
if payload.get("terminationReason") != "NO_TOOL_CALL" or payload.get("continuationActive"):
    emit({})

cwd = payload.get("cwd") or os.getcwd()
try:
    repo_root = subprocess.check_output(
        ["git", "-C", cwd, "rev-parse", "--show-toplevel"],
        stderr=subprocess.DEVNULL,
        text=True,
    ).strip()
except Exception:
    emit({})

# Collect modified / untracked files that Biome can lint.
try:
    status_out = subprocess.check_output(
        ["git", "-C", repo_root, "status", "--porcelain", "-z"],
        stderr=subprocess.DEVNULL,
    )
except Exception:
    emit({})

files = []
entries = status_out.decode("utf-8", errors="replace").split("\0")
i = 0
while i < len(entries):
    entry = entries[i]
    i += 1
    if len(entry) < 4:
        continue
    status = entry[:2]
    path = entry[3:]
    # Renames/copies have an extra NUL-separated source path entry.
    if status[0] in ("R", "C") or status[1] in ("R", "C"):
        i += 1
    if "D" in status:
        continue
    if path.lower().endswith(LINT_EXTS):
        full = os.path.join(repo_root, path)
        if os.path.isfile(full):
            files.append(path)

if not files:
    emit({})


def find_biome(root):
    if shutil.which("biome"):
        return [shutil.which("biome")]
    local_bin = os.path.join(root, "node_modules", ".bin", "biome")
    if os.path.isfile(local_bin) and os.access(local_bin, os.X_OK):
        return [local_bin]
    home = os.path.expanduser("~")
    zed_candidates = [
        os.path.join(home, "Library", "Application Support", "Zed", "extensions", "work", "biome", "node_modules", "@biomejs", "cli-darwin-arm64", "biome"),
        os.path.join(home, "Library", "Application Support", "Zed", "extensions", "work", "biome", "node_modules", "@biomejs", "cli-darwin-x64", "biome"),
        os.path.join(home, ".local", "share", "zed", "extensions", "work", "biome", "node_modules", "@biomejs", "cli-linux-x64", "biome"),
    ]
    for cand in zed_candidates:
        if os.path.isfile(cand) and os.access(cand, os.X_OK):
            return [cand]
    return None


biome_cmd = find_biome(repo_root)
if not biome_cmd:
    emit({})

proc = subprocess.run(
    biome_cmd + ["lint", "--error-on-warnings", "--max-diagnostics=50"] + files,
    cwd=repo_root,
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
)

if proc.returncode == 0:
    emit({})

output = proc.stdout.strip()
if len(output) > 4000:
    output = output[:4000] + "\n... (truncated)"

emit(
    {
        "decision": "continue",
        "reason": (
            "Biome found lint errors or warnings in modified files "
            f"({', '.join(files)}). Fix them before finishing:\n\n{output}"
        ),
    }
)
PY
