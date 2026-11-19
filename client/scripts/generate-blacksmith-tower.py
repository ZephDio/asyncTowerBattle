#!/usr/bin/env python3
"""Build the two-cell open-air forge. x runs along the eaves, -y down the horn."""
from math import ceil, dist, floor, hypot, sqrt
from pathlib import Path

from voxel_sprite import VoxelGrid, outline, render, write_png

OUT = Path(__file__).resolve().parents[1] / 'public/resources/towers/blacksmith-tower.png'
# The width still maps to two cells. With the smaller final draw scale, leave
# just enough transparent canvas below to keep the prior bottom clearance.
WIDTH, HEIGHT, ORIGIN_Y = 232, 172, 115
YARD_X, SHOP_X = -22, 16
PORCH_EXTENSION = 26
INK = (22, 28, 46, 255)
OAK, STEEL, STONE, TILE, LINEN, HIDE, RED, SKIN, SOOT, EMBER, GOLD, PANTS = range(1, 13)


def ramp(colors):
    return [tuple(bytes.fromhex(c)) + (255,) for c in colors.split()]


RAMPS = {OAK: ramp('513c41 805344 ad754e dbac71'),
         STEEL: ramp('353843 575966 87898d c6c9bc'),
         STONE: ramp('564958 806c6b ab9383 d3bda0'),
         TILE: ramp('70404a 994f48 c27150 e4a068'),
         LINEN: ramp('786762 a89179 d8c39f f5e4bd'),
         HIDE: ramp('653c39 915033 b56d41 db9756'),
         RED: ramp('783645 a54648 cf6253 ef9270'),
         SKIN: ramp('8e574d bb775a e2a27a f6c498'),
         PANTS: ramp('373842 514e58 716a70 938985')}


def egg(g, center, radii, mat):
    x,y,z = center
    a,b,c = radii
    for k in range(max(0,floor(z-c)), ceil(z+c)):
        for j in range(floor(y-b), ceil(y+b)):
            span = 1-((k+.5-z)/c)**2-((j+.5-y)/b)**2
            if span > 0:
                d = a*sqrt(span)
                for i in range(ceil(x-d-.5), ceil(x+d-.5)):
                    g.set(i,j,k,mat)


def limb(g, a, b, ra, rb, mat):
    steps = max(1,ceil(dist(a,b)))
    for n in range(steps+1):
        t = n/steps
        center = tuple(u+(v-u)*t for u,v in zip(a,b))
        r = ra+(rb-ra)*t
        egg(g,center,(r,r,r),mat)


# Travel on the ground plane only. Use the same transform for the tooling,
# impact point, material highlights and contact shadow as for the stump.
ANVIL_Y = 21


def station(x,y,z):
    return x,y+ANVIL_Y,z


def station_box(g,x0,x1,y0,y1,z0,z1,mat):
    g.box(x0,x1,y0+ANVIL_Y,y1+ANVIL_Y,z0,z1,mat)


def hearth(g):
    # The only open end is the x-minus end. From the camera a solid cheek
    # masks the firebox: only coals at the projecting lip show past its edge.
    box = g.box
    box(51,89,-15,25,0,16,STONE)
    box(51,89,-15,-10,16,77,STONE)
    box(51,89,18,25,16,77,STONE)
    box(76,89,-10,18,16,77,STONE)
    box(49,89,-15,25,40,77,STONE)
    box(43,52,-13,18,9,14,STONE)
    box(40,76,-14,18,14,17,STEEL)
    for x,y,h in [(46,5,8),(49,10,12),(50,-2,8)]:
        limb(g,(x,y,17),(x+1,y,17+h),3,1,EMBER)
        egg(g,(x-1,y-1,19),(2,2,3),GOLD)


def bellows(g):
    # Side-on double-board bellows. Boards hinge together at the iron nose;
    # three projecting folds follow the expanding space between the leaves.
    for x in range(61,87):
        spread = (x-61)/25
        half = 2+round(10*spread)
        for z in range(-half-2,half+3):
            board = abs(z)>=half
            phase = (z/half*1.5+.5)%1
            fold = round(4*(1-abs(2*phase-1)))
            front = -28 if board else -24-fold
            g.box(x,x+1,front,-17,39+z,40+z,OAK if board else HIDE)
    for h in (27,51):
        g.box(86,93,-25,-21,h-1,h+2,OAK)
    g.box(61,65,-29,-27,37,41,STEEL)  # pivot pin
    # The iron blast pipe turns through the cheek, into the coal bed. A
    # collar at the elbow keeps the nozzle readable against the masonry.
    g.box(52,57,-26,-14,35,43,STEEL)
    limb(g,(55,-23,39),(62,-23,39),2,3,STEEL)


class Bay:
    """Place a group of unscaled models together, including their textures."""
    def __init__(self, grid, x):
        self.grid, self.x = grid, x

    def set(self,x,y,z,m):
        self.grid.set(x+self.x,y,z,m)

    def box(self,x0,x1,y0,y1,z0,z1,m):
        self.grid.box(x0+self.x,x1+self.x,y0,y1,z0,z1,m)


def forge(g):
    box = g.box
    # The front wall stops short on the left: a recessed porch with an
    # unobstructed entrance from the smith's side, not a front-painted door.
    box(31-PORCH_EXTENSION,89,26,33,0,84,OAK)
    box(83,89,-5,28,0,84,STONE)
    post = 32-PORCH_EXTENSION
    box(post,post+5,-5,0,0,84,OAK)
    box(29-PORCH_EXTENSION,92,-6,34,75,83,OAK)
    limb(g,(post+3,-2,60),(post+14,-2,77),2.6,3,OAK)
    # A low timber bench under the extended eave; leave the entry floor open.
    box(12,34,8,24,18,23,OAK)
    for leg in (14,29):
        box(leg,leg+3,10,14,0,18,OAK)
    # Two steel billets support a third across their seam. Step in the upper
    # edges to catch the light and separate the cap from the darker feet.
    for x,y,z in ((12,12,23),(24,12,23),(18,14,29)):
        box(x,x+10,y,y+9,z,z+3,STEEL)
        box(x+1,x+9,y+1,y+8,z+3,z+6,STEEL)
    hearth(g)
    bellows(g)
    # Rack in the entry recess: a peel and a fork, backed by oak.
    box(36,49,16,20,41,45,STEEL)
    for x in (39,46):
        box(x,x+2,14,17,24,48,STEEL)
    box(37,43,13,17,17,26,STEEL)
    for x in (44,48):
        box(x,x+2,13,17,17,24,STEEL)
    box(44,50,13,17,23,26,STEEL)
    # Slope each tile row away from the level drip edge. Curved shoulders
    # and a projecting lip cast small contact shadows between courses.
    for y in range(-12,42):
        run = 27-abs(y-15)
        for x in range(26-PORCH_EXTENSION,94):
            course = max(0,run)//9
            u = (x+6*(course%2))%12
            top = 83+round(run*.85)+(1 if u in (1,10) else 2 if 2<=u<=9 else 0)
            top += 2 if run%9<2 else 0
            box(x,x+1,y,y+1,top-5,top,TILE)
    box(25-PORCH_EXTENSION,94,13,18,106,111,TILE)
    box(68,84,18,31,96,123,STONE)
    box(66,86,16,33,119,124,STONE)
    box(70,82,20,29,124,125,SOOT)


def anvil_axes(x,y):
    # Length runs from the round near bick to the square far heel. Cant just
    # the iron on its stump so the throat shows beside (not behind) the horn.
    dx,dy = x+55,y+7
    return .6*dx+.8*dy, .8*dx-.6*dy


def anvil(g):
    # End grain and binding ring below the iron casting.
    for z in range(21):
        r = 17 + (2 if z<3 or 13<=z<17 else 0)
        for y in range(-31,10):
            for x in range(-76,-34):
                if hypot(x+55,(y+11)*1.05)<r:
                    g.set(*station(x,y,z),STEEL if 13<=z<17 else OAK)
    for x in range(-87,-29):
        for y in range(-52,24):
            along,across = anvil_axes(x+.5,y+.5)
            for z in range(21,50):
                if z>=43 and -12<=along<23 and abs(across)<11:
                    # Tool slot in the heel, clear of the glowing stock.
                    m = SOOT if z>=48 and 15<along<20 and -6<across<-1 else STEEL
                elif -36<along<-12:
                    radius = 8*(along+36)/24
                    if hypot(across,z-45)>radius or z>48:
                        continue
                    m = STEEL
                else:
                    # Undercuts either end of the table; the base spreads
                    # again into toes with a notch between each pair.
                    if z>=43:
                        continue
                    flare = max(0,(32-z)/11,(z-35)/9)
                    if abs(along)>7+9*flare or abs(across)>5+9*flare:
                        continue
                    if z<28 and (abs(along)>8 and abs(across)<5 or abs(across)>8 and abs(along)<4):
                        continue
                    m = STEEL
                g.set(*station(x,y,z),m)


def spare_tools(yard,shop):
    # Cross-peen sledge laid by the stump, clear of both boots.
    limb(yard,(-72,-15,3),(-57,-25,2),2,2,OAK)
    yard.box(-77,-69,-20,-10,0,6,STEEL)
    # Coal shovel leans against the closed cheek, blade on the ground.
    limb(shop,(83,-25,7),(77,-21,40),1.8,2,OAK)
    for z in range(1,12):
        r = min(5,z+2)
        shop.box(82-r,82+r,-26+z//4,-23+z//4,z,z+1,STEEL)


def worker(g):
    def bone(a,b,ra,rb,m):
        limb(g,a,b,ra,rb,m)
    # Trailing leg extends right/back; leading knee bends forward over the
    # planted boot. Pelvis moves back while the sternum drives into the blow.
    for hip,knee,ankle in [((8,7,32),(16,9,18),(21,10,7)),
                          ((3,0,31),(-8,-4,20),(-12,-6,7))]:
        bone(hip,knee,7,5.5,PANTS)
        bone(knee,ankle,5.5,4,PANTS)
        x,y,_ = ankle
        egg(g,(x-3,y-1,5),(9,5.5,4.5),OAK)
        g.box(x-5,x+4,y-4,y+4,6,12,HIDE)
    egg(g,(6,4,33),(11,9,9),HIDE)
    bone((5,4,36),(-3,3,54),9,11,LINEN)
    egg(g,(-4,1,54),(12,11,9),LINEN)
    # Wrap apron around the forward hip; cut the skirt diagonally to reveal
    # the leading thigh. The cinch sits below the bib, not across the arms.
    for z in range(20,55):
        t = (z-20)/34
        cx = round(1-9*t)
        rx = round(10-4*t)
        for x in range(cx-rx,cx+rx+1):
            if z >= 20+(x-cx+rx)//4:
                g.box(x,x+1,-7,-2,z,z+1,OAK if 34<=z<38 else HIDE)
    g.box(-6,-2,-8,-6,34,38,STEEL)
    egg(g,(-10,1,62),(6,6,8),SKIN)
    egg(g,(-14,1,71),(8,8,10),SKIN)
    egg(g,(-21,-2,69),(4,4,3),SKIN)
    g.box(-21,-18,-6,-4,71,74,SOOT)
    egg(g,(-13,2,78),(10,9,7),RED)
    egg(g,(-7,2,73),(5,9,6),RED)
    egg(g,(-2,3,75),(4,4,4),RED)
    bone((-2,3,74),(4,4,68),2.8,1.8,RED)
    # Far hand closes the reins of the tongs behind the strike plane.
    bone((-9,8,53),(-17,7,37),5,4,SKIN)
    bone((-17,7,37),(-27,-2,40),4,3.5,SKIN)
    for y in (-4,2):
        bone((-26,y,40),station(-43,-9,51),1.7,1.8,STEEL)
    station_box(g,-63,-42,-11,1,50,53,EMBER)
    station_box(g,-63,-51,-11,-6,52,54,GOLD)
    # Near sleeve, elbow and fist form a zigzag and break the torso outline.
    egg(g,(-6,-6,56),(7,6,7),LINEN)
    bone((-9,-7,54),(-15,-11,48),5.3,4.6,SKIN)
    bone((-15,-11,48),(-30,-9,60),4.6,3.6,SKIN)
    bone((-26,-9,62),station(-56,-4,57),2.1,2.2,OAK)
    egg(g,(-30,-9,60),(4,4,4.6),SKIN)
    station_box(g,-61,-51,-8,1,53,63,STEEL)
    for a,b in [((-65,-6,56),(-74,-6,62)),((-79,-5,64),(-87,-5,68)),
                ((-71,-8,55),(-82,-8,56)),((-68,-11,53),(-76,-14,52))]:
        bone(station(*a),station(*b),1.6,1,GOLD)


def shade(hit):
    m,x,y,z = hit.label,hit.mx,hit.my,hit.z
    x -= SHOP_X if x>=SHOP_X+25-PORCH_EXTENSION else YARD_X
    if m == SOOT:
        return INK
    if m in (EMBER,GOLD):
        return (249,132,57,255) if m==EMBER else (255,222,132,255)
    n = hit.normal()
    light = hit.light(n)
    step = sum(light>t for t in (.15,.50,.79))
    # Cold plane of the face and rounded bick catch different bands of light.
    if m==STEEL and x < -29 and 21<=z<50:
        along,across = anvil_axes(x+.5,y+.5-ANVIL_Y)
        if along<-12 and z>=37:
            radius = max(1,8*(along+36)/24)
            step = 3 if -.65*radius<across<0 else 2 if across<.45*radius else 1
        elif z==49:
            step = 3 if abs(across)>8 or along>20 else 2
        elif 29<=z<=42:
            step = min(step,1)
        elif z<=28:
            step = 2 if n[2]>.55 else 1
    if m==STONE:
        if z%8==0 or (x+5*(z//8%2))%13==0:
            step -= 1
    if m==TILE and y not in range(13,18):
        run = 27-abs(y-15)
        if (x+6*(run//9%2))%12==0 or run%9==8:
            step -= 1
    if m==OAK and (x+3*(z//13))%9==0 and 2<z%13<10:
        step -= 1
    return RAMPS[m][max(0,step)]


def shadow(x,y):
    def rim(x0,x1,y0,y1):
        return (max(0,x0-x,x-x1)+max(0,y0-y,y-y1))/4
    x -= SHOP_X
    shop = min(rim(31-PORCH_EXTENSION,88,-7,33),rim(51,88,-17,20),rim(79,85,-26,-23))
    x += SHOP_X-YARD_X
    return min(shop,rim(-76,-70,-19,-11),hypot((x+55)/21,(y+13-ANVIL_Y)/20),
               hypot((x+15)/11,(y+9)/7),hypot((x-18)/11,(y-8)/7))


if __name__ == '__main__':
    grid = VoxelGrid(128)
    yard,shop = Bay(grid,YARD_X),Bay(grid,SHOP_X)
    forge(shop)
    anvil(yard)
    spare_tools(yard,shop)
    worker(yard)
    sprite = render(grid,0,WIDTH,HEIGHT,ORIGIN_Y,shade,(1,1),shadow_shape=shadow,shadow_jitter=.2)
    def seam(a,b):
        if a==b or {a,b}=={EMBER,GOLD}:
            return None
        return INK
    outline(sprite,seam,depth_gap=8,depth_width=1)
    write_png(OUT,sprite.pixels)
