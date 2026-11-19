#!/usr/bin/env python3
"""Print 16x16 icons on the single-layer shield (assets/icon-shield.png) and write 64x64 nearest-neighbour PNGs.

Each icon in the spec picks a mode:
  glyph      hand-drawn character grid ("palette" maps characters to #rrggbb, "." is transparent), placed at "origin".
  downscale  an existing icon (64x64 or 16x16, cropped to its opaque box) resampled to "size"
             with "resample" nearest|box|bilinear|lanczos (alpha snapped to 0/255), placed at "origin".
  full       an existing icon at its own 16x16 size, cropped to its opaque box and centred on the shield.
Optional per icon: "scale" (default 4, output = 16*scale), "shield" (override the shield PNG).
Source/shield paths are relative to the repository root.

  python3 build_shield_icons.py --spec assets/icon-shield-spec.json --out DIR [--only NAME ...] [--preview]
  python3 build_shield_icons.py --spec ... --out DIR --try NAME   # all resample modes + full side by side, for choosing
"""
import argparse, json, os
from PIL import Image

RESAMPLE = {"nearest": Image.NEAREST, "box": Image.BOX, "bilinear": Image.BILINEAR, "lanczos": Image.LANCZOS}
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
SKILL = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def path(p):
    if os.path.isabs(p): return p
    for base in (ROOT, SKILL):
        if os.path.exists(os.path.join(base, p)): return os.path.join(base, p)
    raise SystemExit(f"not found: {p}")

def hexrgb(h):
    h = h.lstrip("#"); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (255,)

def load16(src):
    im = Image.open(path(src)).convert("RGBA")
    if im.size != (16, 16): im = im.resize((16, 16), Image.NEAREST)
    box = im.getchannel("A").getbbox()
    return im.crop(box)

def snap(im):
    im.putalpha(im.getchannel("A").point(lambda v: 255 if v >= 128 else 0)); return im

def layer(spec, how=None):
    mode = how or spec["mode"]
    ic = Image.new("RGBA", (16, 16))
    if mode == "glyph":
        pal = {k: hexrgb(v) for k, v in spec["palette"].items()}
        ox, oy = spec["origin"]
        for y, row in enumerate(spec["grid"]):
            for x, c in enumerate(row):
                if c in pal: ic.putpixel((ox + x, oy + y), pal[c])
    elif mode == "downscale":
        g = snap(load16(spec["source"]).resize(tuple(spec["size"]), RESAMPLE[spec.get("resample", "box")]))
        ic.alpha_composite(g, tuple(spec["origin"]))
    elif mode == "full":
        g = load16(spec["source"]); ic.alpha_composite(g, ((16 - g.width) // 2, (16 - g.height) // 2))
    else:
        raise SystemExit(f"unknown mode {mode}")
    return ic

def compose(shield, ic):
    out = shield.copy(); out.alpha_composite(ic); return out

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--spec", required=True); ap.add_argument("--out", required=True)
    ap.add_argument("--only", nargs="*"); ap.add_argument("--preview", action="store_true")
    ap.add_argument("--try", dest="try_", metavar="NAME", help="write a comparison sheet of every mode for one spec entry")
    a = ap.parse_args()
    spec = json.load(open(a.spec)); os.makedirs(a.out, exist_ok=True)
    shield = Image.open(path(spec["shield"])).convert("RGBA")
    BG = (40, 40, 48, 255)
    if a.try_:
        s = spec["icons"][a.try_]; variants = {"full": layer(s, "full")}
        for n in RESAMPLE:
            variants[n] = layer({**s, "mode": "downscale", "resample": n, "size": s.get("size", [11, 10]), "origin": s.get("origin", [2, 3])})
        sheet = Image.new("RGBA", (16 + len(variants) * 208, 224), BG)
        for i, (n, ic) in enumerate(variants.items()):
            o = compose(shield, ic); o.save(f"{a.out}/{a.try_}-{n}.png")
            sheet.alpha_composite(o.resize((192, 192), Image.NEAREST), (16 + i * 208, 16))
        sheet.save(f"{a.out}/{a.try_}-compare.png"); return
    names = a.only or list(spec["icons"]); made = []
    for n in names:
        s = spec["icons"][n]; sh = Image.open(path(s["shield"])).convert("RGBA") if "shield" in s else shield
        o = compose(sh, layer(s)); k = s.get("scale", 4)
        o.resize((16 * k, 16 * k), Image.NEAREST).save(f"{a.out}/{n}.png"); made.append(o)
    if a.preview:
        sheet = Image.new("RGBA", (16 + len(made) * 208, 224), BG)
        for i, o in enumerate(made): sheet.alpha_composite(o.resize((192, 192), Image.NEAREST), (16 + i * 208, 16))
        sheet.save(f"{a.out}/preview.png")

if __name__ == "__main__":
    main()
