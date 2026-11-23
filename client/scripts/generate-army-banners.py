"""Draw the two 60x155 Army HUD banners in public/resources/hud (5 px per HUD unit)."""
from pathlib import Path

from voxel_sprite import write_png

OUT = Path(__file__).resolve().parents[1] / "public/resources/hud"
W, H = 60, 155
INK = (22, 28, 46)
BRASS = [(90, 70, 70), (180, 131, 85), (218, 181, 112), (245, 239, 169)]
# Selvage shadow, cloth face, folded edge, embroidery.
CLOTH = {
    "elf": [(32, 54, 62), (40, 78, 71), (60, 103, 81), (150, 176, 111)],
    "dwarf": [(64, 42, 54), (105, 54, 57), (141, 69, 61), (214, 152, 88)],
}


def hem(d, elf):
    if elf:
        # The outer edge curls into a lanceolate tip; the inner edge sweeps back up.
        return (138, 142, 145, 148, 151, 153, 154, 154, 153, 152, 150,
                148, 146, 144, 143, 141, 140, 139, 138, 137, 136, 136, 135)[min(d-4, 22)]
    return 154 - 4 * min(5, (d-4) // 5)


def banner(faction):
    elf = faction == "elf"
    shade, face, fold, thread = CLOTH[faction]
    image = [[(0, 0, 0, 0)] * W for _ in range(H)]

    def put(x, y, rgb):
        image[y][x] = (*rgb, 255)

    for x in range(4, W-4):
        d = min(x, W-1-x)
        bottom = hem(d, elf)
        for y in range(6, bottom+1):
            color = face
            if d < 6 or bottom-y < 2:
                color = INK
            elif d == 6 or y < 10:
                color = shade
            elif d == 7:
                color = fold
            if elf and y >= 136 and color != INK:
                vein = 10 + (153-y)**2 // 23
                if d in (vein, vein+1):
                    color = thread
                elif vein-5 <= d < vein:
                    color = fold
            if not elf and y >= 135 and color != INK:
                if bottom-y in (3, 4):
                    color = thread
                elif bottom-y in (5, 6):
                    color = shade
            put(x, y, color)

    # Brass spear finials and ferrules, with a pair of cloth sleeves over the rod.
    for x in range(W):
        d = min(x, W-1-x)
        radius = min(d, 3) if d < 5 else 4 if d in (5, 6, 7) else 2
        for dy in range(-radius, radius+1):
            color = INK if abs(dy) == radius else BRASS[2 if dy < 0 else 1 if dy == 0 else 0]
            put(x, 4+dy, color)
        if d in range(9, 17):
            for y in range(1, 10):
                color = INK if d in (9, 16) or y in (1, 9) else fold if y <= 4 else shade
                put(x, y, color)
    return image


if __name__ == "__main__":
    for faction in CLOTH:
        write_png(OUT / f"army-{faction}.png", banner(faction))
