#!/usr/bin/env python3
"""Build rev/data/log.json from this repo's git history, for the Rev. design's /rev/log.html.

Run from the repo root after pushing new work:  python3 tools/build-log.py
- Uses the full history of main (run `git fetch --unshallow` once if the clone is shallow).
- Leaves out every commit that touches workout.html (private page) and merge commits.
- Times are recorded in Los Angeles local time.
"""
import json, subprocess, sys
from collections import Counter
from datetime import datetime
from zoneinfo import ZoneInfo

PRIVATE = {"workout.html"}
LA = ZoneInfo("America/Los_Angeles")
ref = sys.argv[1] if len(sys.argv) > 1 else "origin/main"

out = subprocess.run(
    ["git", "log", ref, "--no-merges", "--reverse", "--name-only", "--format=@@%h|%aI|%an|%ae|%(trailers:key=Co-Authored-By,valueonly,separator=;)|%s"],
    capture_output=True, text=True, check=True).stdout

commits, cur = [], None
for line in out.splitlines():
    if line.startswith("@@"):
        h, iso, name, email, coauth, subject = line[2:].split("|", 5)
        cur = {"h": h, "iso": iso, "name": name, "email": email, "co": coauth, "s": subject, "files": []}
        commits.append(cur)
    elif line.strip() and cur:
        cur["files"].append(line.strip())

rows = []
for c in commits:
    if PRIVATE & set(c["files"]):
        continue
    t = datetime.fromisoformat(c["iso"]).astimezone(LA)
    # commits written with Claude carry a "Co-Authored-By: Claude" trailer
    by = "claude" if "claude" in (c["name"] + c["email"] + c["co"]).lower() else "aaron"
    rows.append({"h": c["h"], "t": t.strftime("%Y-%m-%dT%H:%M"), "s": c["s"], "by": by, "n": len(c["files"])})

hours = Counter(int(r["t"][11:13]) for r in rows if r["by"] == "aaron")
mine = [r for r in rows if r["by"] == "aaron"]
late = sum(1 for r in mine if int(r["t"][11:13]) < 4)
stats = {
    "total": len(rows),
    "aaron": len(mine),
    "first": rows[0] if rows else None,
    "late_share": round(late / len(mine), 3) if mine else 0,
    "hours": [hours.get(h, 0) for h in range(24)],
    "private_excluded": sum(1 for c in commits if PRIVATE & set(c["files"])),
    "built": datetime.now(LA).strftime("%Y-%m-%dT%H:%M"),
}
with open("rev/data/log.json", "w") as f:
    json.dump({"stats": stats, "commits": rows}, f, indent=0, ensure_ascii=False)
print(f"wrote rev/data/log.json: {len(rows)} commits ({stats['private_excluded']} private excluded)")
