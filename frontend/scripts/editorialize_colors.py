#!/usr/bin/env python3
"""Remap leftover bespoke Tailwind color classes to readable editorial tokens.

The earlier blind sweep converted surfaces but left light-accent *text*
(text-cyan-100 etc.) that is invisible on the warm paper canvas. This maps
every `<prefix>-<color>-<shade>[/op]` class to a readable editorial value,
keyed on the utility prefix so text stays dark-on-light and surfaces stay
faint tints. Single accent = purple; warning = orange; success = emerald;
danger = rose. Everything else collapses to those buckets.
"""

import re
import sys

ACCENT = {"cyan", "sky", "violet", "fuchsia", "indigo", "purple", "blue"}
WARN = {"amber", "yellow", "orange"}
OK = {"emerald", "green", "teal", "lime"}
BAD = {"rose", "red", "pink"}

# text color (readable dark-on-light) per bucket
TEXT = {
    "accent": "accent-purple",
    "warn": "accent-orange",
    "ok": "emerald-700",
    "bad": "rose-700",
}
# solid surface / gradient base per bucket
BASE = {
    "accent": "accent-purple",
    "warn": "accent-orange",
    "ok": "emerald-500",
    "bad": "rose-500",
}
# border color per bucket
BORDER = {
    "accent": "accent-purple/25",
    "warn": "accent-orange/30",
    "ok": "emerald-600/25",
    "bad": "rose-300/40",
}

COLORS = {}
for c in ACCENT:
    COLORS[c] = "accent"
for c in WARN:
    COLORS[c] = "warn"
for c in OK:
    COLORS[c] = "ok"
for c in BAD:
    COLORS[c] = "bad"

TOKEN = re.compile(
    r"\b(text|bg|border|from|to|via|ring|fill|stroke|decoration|shadow|outline)-"
    r"(cyan|sky|violet|fuchsia|indigo|purple|blue|amber|yellow|orange|"
    r"emerald|green|teal|lime|rose|red|pink|slate)-"
    r"(\d{2,3})(/(?:\[[^\]]+\]|\d+))?"
)


def repl(m):
    prefix, color, shade, op = m.group(1), m.group(2), m.group(3), m.group(4) or ""

    # slate is neutral chrome -> ink family (only appears as near-black button text)
    if color == "slate":
        if prefix == "text":
            return "text-white" if int(shade) >= 700 else "text-ink"
        if prefix == "bg":
            return "bg-paper-raised"
        if prefix == "border":
            return "border-line"
        return f"{prefix}-ink"

    bucket = COLORS[color]

    if prefix == "text":
        return f"text-{TEXT[bucket]}"
    if prefix in ("bg",):
        return f"bg-{BASE[bucket]}/[0.06]"
    if prefix in ("border", "ring", "outline"):
        b = BORDER[bucket]
        return f"{prefix}-{b}"
    if prefix in ("from", "to", "via"):
        return f"{prefix}-{BASE[bucket]}"
    if prefix in ("fill", "stroke", "decoration"):
        return f"{prefix}-{TEXT[bucket]}"
    if prefix == "shadow":
        return ""  # drop colored glows
    return m.group(0)


def main(paths):
    for path in paths:
        with open(path, "r", encoding="utf-8") as f:
            src = f.read()
        out = TOKEN.sub(repl, src)
        # collapse doubled spaces left by dropped shadow utilities inside class strings
        out = re.sub(r'className="([^"]*?)  +', lambda mm: 'className="' + mm.group(1) + ' ', out)
        if out != src:
            with open(path, "w", encoding="utf-8") as f:
                f.write(out)
            print(f"updated {path}")
        else:
            print(f"unchanged {path}")


if __name__ == "__main__":
    main(sys.argv[1:])
