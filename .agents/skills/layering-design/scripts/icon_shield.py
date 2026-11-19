# Single-layer 16x16 shield using the full canvas. Usage: python3 shield.py OUT_DIR
import sys
from PIL import Image
O=sys.argv[1]
spans={**{y:(0,15) for y in range(0,10)},10:(0,15),11:(1,14),12:(2,13),13:(3,12),14:(5,10),15:(7,8)}
mask={(x,y) for y,(a,b) in spans.items() for x in range(a,b+1)}
rim={p for p in mask if any((p[0]+dx,p[1]+dy) not in mask for dx,dy in((1,0),(-1,0),(0,1),(0,-1)))}
VX,HY=7,6
LIGHT=(244,202,78,255);DARK=(233,162,52,255);LINE=(203,165,52,255);RIM=(196,132,28,255)
im=Image.new("RGBA",(16,16))
for (x,y) in mask:
    if (x,y) in rim: c=RIM
    elif x==VX or y==HY: c=LINE
    else: c=LIGHT if ((x<VX)==(y<HY)) else DARK
    im.putpixel((x,y),c)
im.save(f"{O}/shield.png")
bg=Image.new("RGBA",(224,224),(40,40,48,255))
bg.alpha_composite(im.resize((192,192),Image.NEAREST),(16,16)); bg.save(f"{O}/preview.png")
