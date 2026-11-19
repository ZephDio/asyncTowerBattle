#!/usr/bin/env python3
"""Draw the two-cell Forge at Knock: cut pixel planes, back to front. Stdlib only."""
from math import ceil
from pathlib import Path

from voxel_sprite import SHADOW, write_png

OUTPUT = Path(__file__).resolve().parents[1] / 'public/resources/towers/blacksmith.png'
W, H = 218, 142
pixels = [[(0, 0, 0, 0)] * W for _ in range(H)]
# Plane colors: smoked oak, fired clay, clinker, wrought & polished metal,
# linen, ochre hide, red madder, skin in reflected firelight.
colors = dict(i='161c2e', w='523b40', o='885743', g='b88050', h='deb079',
              r='844848', t='b46048', c='d48155', d='e6a46c', s='625460',
              b='897775', m='ae9b8d', l='d0c0a5', j='38404b', k='626771',
              n='94999a', p='d0d2c1', u='c8ad82', v='f3ddb2', a='85432e',
              e='b96739', f='ef853c', y='ffbf57', z='fff1ac',
              q='ad534b', red='d57257', flesh='cf9067', light='f4bb83')
palette = {k: tuple(bytes.fromhex(v)) + (255,) for k, v in colors.items()}
palette['shadow'] = SHADOW


def poly(color, coords):
    """Scan-convert a closed pixel-edge path at pixel centers (no AA)."""
    it = iter(map(int, coords.split()))
    pts = list(zip(it, it))
    edges = list(zip(pts, pts[1:] + pts[:1]))
    for y in range(min(y for _, y in pts), max(y for _, y in pts)):
        cuts = sorted(ceil(x + (y+.5-v)*(xx-x)/(vv-v)-.5)
                      for (x,v),(xx,vv) in edges if min(v,vv) <= y+.5 < max(v,vv))
        for x, end in zip(cuts[::2], cuts[1::2]):
            pixels[y][x:end] = [palette[color]] * (end-x)


def planes(spec):
    for line in spec.strip().splitlines():
        color, coords = line.strip().split(' ', 1)
        poly(color, coords)


def smithy():
    # Two visible wall planes. The short gable shelters a recessed, left-facing
    # doorway; the long near wall wraps a clinker arch around the firebox.
    planes('''
    shadow 120 97 174 88 212 86 216 100 212 107 151 121 138 119 118 110
    w 124 50 139 30 153 59 152 116 124 102
    o 124 54 139 37 151 61 150 112 124 100
    i 126 64 131 57 140 60 146 70 146 110 126 100
    w 127 67 131 61 138 64 141 69 134 68 130 70 130 99 127 98
    w 138 73 143 76 143 105 138 103
    o 139 78 142 80 142 97 139 96
    j 137 83 143 86 143 88 137 85
    h 123 59 126 61 126 100 123 99
    g 124 58 131 53 142 58 149 70 146 71 139 62 132 59 126 64
    s 123 100 145 110 147 114 143 116 120 105
    m 123 100 145 110 142 112 120 103
    b 150 61 207 49 207 103 150 116
    m 151 73 205 61 205 99 151 111
    w 151 70 205 58 205 65 152 77
    o 150 63 157 62 157 113 150 115
    g 150 72 153 71 153 113 150 114
    o 201 54 206 53 206 103 201 104
    w 157 106 201 96 201 103 157 113
    s 161 106 161 87 165 78 174 71 182 70 189 75 192 80 192 99
    b 163 101 163 86 168 78 175 73 182 72 189 78 190 96
    i 166 101 166 88 170 81 176 78 181 78 186 82 187 97
    r 168 98 168 90 172 84 179 81 184 84 184 96
    t 169 98 169 91 174 88 173 92 180 82 182 90 184 88 184 96
    f 171 97 172 91 175 92 179 86 180 93 182 90 183 95
    z 174 97 175 93 177 93 179 90 180 95
    l 170 77 174 73 178 72 177 77 173 79
    s 164 83 169 84 168 86 163 85
    s 181 72 183 73 181 78 179 78
    b 158 76 163 75 163 77 158 78
    b 195 65 200 64 200 66 196 67
    j 158 101 189 94 195 98 195 103 162 111 158 108
    n 158 101 188 94 194 97 163 105
    ''')
    # Overlapping barrel tiles follow the slope from ridge to drip edge.
    planes('''
    w 117 53 134 20 186 10 213 48 213 55 150 70 144 65 134 38 123 58
    g 117 51 133 18 188 9 211 48 149 64 134 31 121 55
    r 134 21 187 9 211 48 150 63
    ''')
    for row in range(3):
        # Each successive course overhangs the previous one.
        a, b = row/3, (row+1)/3
        breaks = [0] + [t/60 for t in range(6 if row%2 else 12,60,12)] + [1]
        def tile(u, v):
            return round(134+53*u+(16+8*u)*v), round(21-12*u+(40-2*u)*v)
        for col,(u,v) in enumerate(zip(breaks,breaks[1:])):
            x,y = tile(u,a); xx,yy = tile(v,a)
            X,Y = tile(u,b); XX,YY = tile(v,b)
            poly(('t','c','t','r')[(col+row)%4], f'{x} {y} {xx-1} {yy} {XX-1} {YY-1} {X+2} {Y+1}')
            poly('d' if col%3==0 else 'c',f'{x} {y} {x+3} {y} {X+5} {Y-1} {X+2} {Y}')
    planes('''
    h 131 20 185 8 190 10 135 23
    o 135 23 190 10 191 13 136 26
    s 174 10 190 6 196 9 196 28 182 32 175 27
    b 181 14 195 11 195 26 182 30
    m 175 12 181 15 182 30 175 26
    s 174 18 181 21 195 18 195 20 181 23 174 20
    w 172 6 189 2 198 6 198 12 181 16 172 12
    m 172 6 188 2 198 6 181 11
    i 177 6 188 4 193 6 182 9
    ''')
    # Iron peel and two-pronged coal rake on pegs beside the fire.
    planes('''
    w 192 70 203 67 203 70 192 73
    j 194 71 196 70 196 85 198 86 198 91 193 93 191 91 192 86 194 85
    k 192 87 196 86 196 90 192 91
    j 200 68 202 68 202 83 204 82 204 86 199 88 198 85 200 84
    ''')


def worker():
    # Far leg takes the weight; the near boot lunges left. Bent knee and
    # diagonal belt lead into a pitched rib cage, not a standing oval torso.
    planes('''
    shadow 65 111 83 104 103 97 120 99 123 105 115 111 88 115 78 122 63 121
    j 91 81 103 78 107 86 107 96 114 101 110 107 102 105 96 97
    k 99 83 104 82 105 93 101 92
    w 104 95 110 94 116 101 117 106 109 109 97 109 96 106 103 102
    o 104 98 111 97 114 101 108 103 101 105
    k 85 79 98 84 93 94 84 99 80 112 69 112 73 94 80 87
    j 77 97 88 93 84 100 80 111 74 111
    o 69 104 82 106 80 117 73 121 60 119 61 115 69 112
    g 69 104 82 105 81 109 68 108
    w 61 116 70 116 78 114 80 117 73 120 60 119
    u 79 49 87 45 96 49 100 57 103 68 106 77 98 84 84 83 76 71 70 62
    v 72 55 79 49 88 48 83 56 74 63 70 61
    a 80 54 84 51 89 55 87 64 95 71 102 69 105 78 97 84 91 88 82 99 71 95 74 83 76 71
    e 79 66 84 63 87 68 92 73 85 81 78 81
    w 76 80 86 77 100 70 103 72 99 77 78 85
    h 86 77 90 75 91 79 87 81
    flesh 72 47 78 43 84 45 86 51 80 58 73 55
    flesh 66 32 79 32 84 39 82 47 75 53 68 50 66 47 61 46 64 42 62 39
    light 64 38 73 36 72 41 67 42 65 45 61 45
    w 64 39 69 38 68 41 64 42
    i 65 40 68 39 67 42 65 42
    r 66 48 72 48 76 45 75 50 71 53 68 52
    q 61 36 62 30 69 24 78 24 83 28 86 38 82 45 75 43 72 37 65 39
    red 62 32 68 26 76 25 81 28 73 30 67 36 62 36
    r 73 36 84 32 86 38 82 42 77 42
    q 82 36 87 33 92 35 88 40 94 44 91 48 84 42
    ''')


def anvil():
    # Splayed feet, double-waisted web and an end-on conical bick. The bright
    # long face is trapezoidal; the horn dips forward beyond the stump.
    planes('''
    shadow 18 116 30 107 53 105 62 112 66 121 61 129 46 134 37 140 31 136 19 132 15 126
    w 19 105 29 98 51 99 59 106 58 123 53 130 29 133 20 128
    o 21 106 31 111 52 109 50 128 30 131 22 127
    g 24 109 29 112 31 128 26 126
    w 22 117 33 121 55 117 57 116 56 121 33 126 22 123
    k 22 117 33 120 52 117 52 119 33 123 22 120
    j 17 101 27 94 45 93 59 98 59 105 49 112 27 115 17 111
    n 17 101 29 95 48 94 57 98 47 104 27 109
    k 23 103 30 95 31 86 50 81 47 94 52 101 45 107 31 110
    j 34 94 48 87 46 96 49 101 42 105 35 105
    i 22 72 44 64 56 68 54 82 46 94 22 102 16 98 18 86
    k 22 74 54 69 52 82 44 92 24 100 18 96
    n 22 72 44 65 55 68 47 86 43 91 20 96 17 93
    p 21 90 44 84 43 88 19 95 17 93
    i 48 68 52 68 51 71 47 71
    k 18 90 43 85 41 96 34 105 26 116 24 116 18 104 15 96
    n 17 91 39 86 36 94 29 102 25 113 22 109 17 99
    p 17 91 34 87 30 92 19 96
    ''')


def strike():
    # Rear hand draws tongs in towards the belly. The foreground striking
    # arm folds at its elbow, with the knuckles wrapped around the haft.
    planes('''
    j 39 77 57 73 72 65 74 68 57 76 74 72 75 74 57 78 40 80
    flesh 66 69 70 64 77 62 82 68 75 73 69 75 65 73
    f 31 77 48 72 52 74 49 78 34 83 29 81
    y 31 77 48 73 48 75 32 81
    z 32 78 39 76 38 79 32 81
    w 34 69 65 55 69 57 68 60 36 74
    h 36 68 64 55 64 57 36 70
    j 25 64 34 59 39 62 39 66 45 72 43 76 35 79 31 72
    k 25 64 33 61 38 63 36 66 42 73 35 76 31 70
    n 25 64 32 61 35 62 29 66
    p 33 74 40 71 43 73 35 76
    flesh 83 53 91 55 91 62 84 69 80 71 72 69 65 63 60 62 57 58 60 54 65 53 71 59 79 61
    light 58 55 64 54 68 58 66 61 62 59 59 60
    light 71 60 79 62 84 57 86 59 81 66 76 65
    w 67 61 73 65 80 68 83 67 81 70 76 70 68 65
    u 83 50 88 49 94 53 95 59 91 64 82 60 80 57
    v 83 51 89 50 93 54 91 56 82 55
    ''')
    # Short, directional slivers: never a cloud of dots obscuring the face.
    planes('''
    y 3 60 9 62 16 68 9 65
    z 18 69 24 71 29 76 22 73
    f 4 76 14 76 21 78 11 78
    y 13 85 23 81 21 84 15 86
    ''')


if __name__ == '__main__':
    smithy()
    worker()
    anvil()
    strike()
    # One shared cut edge. Keep the exterior transparent between the three
    # individual shadows, instead of outlining a rectangular diorama base.
    solid = {(x,y) for y,row in enumerate(pixels) for x,c in enumerate(row) if c[3] == 255}
    for x,y in solid:
        for dx,dy in ((0,1),(0,-1),(1,0),(-1,0)):
            if (x+dx,y+dy) not in solid:
                pixels[y+dy][x+dx] = palette['i']
    write_png(OUTPUT, pixels)
