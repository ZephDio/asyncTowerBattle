"""Draw faction banners for the shop (60x155) and the larger battle HUD (320x608)."""
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


def battle_hem(d, elf):
    if not elf:
        step, inset = divmod(d - 20, 20)
        return 607 - 12 * step - max(0, inset - 15)
    if d < 47:
        return round(533 + 74 * ((d - 20) / 27) ** 0.65)
    return round(524 + 83 * ((159 - d) / 112) ** 1.6)


def battle_banner(faction):
    width, height = 320, 608
    image = [[(0, 0, 0, 0)] * width for _ in range(height)]
    elf = faction == "elf"
    shade, face, fold, thread = CLOTH[faction]
    for x in range(width):
        d = min(x, width - 1 - x)
        if d >= 20:
            bottom = battle_hem(d, elf)
            # Inset the embroidery from both the hem and the risers of each step.
            inner = min(battle_hem(min(159, max(20, d + dx)), elf) for dx in range(-3, 4))
            for y in range(16, bottom + 1):
                gap = inner - y
                color = face
                if d < 23 or gap < 2:
                    color = INK
                elif d < 27 or y < 24:
                    color = shade
                elif d < 32:
                    color = fold if d < 30 or y % 16 < 8 else shade
                elif elf and y > 523:
                    vein = 47 + (607-y)**1.52 / 10
                    if abs(d - vein) <= 1.6:
                        color = thread
                    elif vein-7 < d < vein or gap < 6:
                        color = fold
                elif not elf and gap < 12:
                    color = thread if 5 <= gap <= 7 else shade
                image[y][x] = (*color, 255)

        # Faceted lance finials, brass collars and stitched cloth loops over the shaft.
        radius = min(11, d * 0.48) if d < 27 else 12 if d < 32 else 6
        for dy in range(-int(radius), int(radius) + 1):
            color = INK if abs(dy) >= radius - 1.5 else BRASS[2 if dy < -1 else 1 if dy <= 2 else 0]
            if dy < -radius + 4 and abs(dy) < radius - 1.5:
                color = BRASS[3]
            image[14 + dy][x] = (*color, 255)
        if 44 <= d < 80:
            for y in range(2, 30):
                edge = min(d-44, 79-d)
                color = INK if edge < 2 or y in (2, 3, 28, 29) else shade if edge < 5 or y > 24 else fold if y < 10 else face
                if y == 23 and edge > 5 and d % 7 < 4:
                    color = fold
                image[y][x] = (*color, 255)
    return image


if __name__ == "__main__":
    for faction in CLOTH:
        write_png(OUT / f"army-{faction}.png", banner(faction))
        write_png(OUT / f"battle-{faction}.png", battle_banner(faction))
