#!/usr/bin/env python3
import os, zlib, struct

W, H = 1280, 800
ORANGE = (0xE4, 0x64, 0x3D, 255)
WHITE  = (255, 255, 255, 255)
GREY   = (235, 238, 240, 255)
DKGREY = (120, 130, 140, 255)

def png_chunk(tag, data):
    return struct.pack('!I', len(data)) + tag + data + struct.pack('!I', zlib.crc32(tag + data) & 0xffffffff)

def write_png(path, pixels):
    # pixels: list of rows, each row list of (r,g,b,a)
    raw = bytearray()
    for y in range(H):
        raw.append(0)  # filter type 0
        for r,g,b,a in pixels[y]:
            raw.extend((r,g,b,a))
    comp = zlib.compress(bytes(raw), 9)
    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('!IIBBBBB', W, H, 8, 6, 0, 0, 0)
    with open(path, 'wb') as f:
        f.write(sig)
        f.write(png_chunk(b'IHDR', ihdr))
        f.write(png_chunk(b'IDAT', comp))
        f.write(png_chunk(b'IEND', b''))

def blank(bg):
    return [[bg for _ in range(W)] for __ in range(H)]

def rect(pix, x, y, w, h, color):
    x2 = min(W, x+w)
    y2 = min(H, y+h)
    for yy in range(max(0,y), y2):
        row = pix[yy]
        for xx in range(max(0,x), x2):
            row[xx] = color

def ring(pix, cx, cy, r_outer, r_inner, color):
    r2o = r_outer*r_outer
    r2i = r_inner*r_inner
    y0 = max(0, int(cy - r_outer) )
    y1 = min(H, int(cy + r_outer) )
    for yy in range(y0, y1):
        dy2 = (yy - cy)*(yy - cy)
        row = pix[yy]
        x0 = max(0, int(cx - r_outer))
        x1 = min(W, int(cx + r_outer))
        for xx in range(x0, x1):
            d2 = (xx - cx)*(xx - cx) + dy2
            if r2i <= d2 <= r2o:
                row[xx] = color

def make_popup(path):
    p = blank(ORANGE)
    # central white popup panel
    rect(p, 300, 180, 680, 440, WHITE)
    # search input bar (grey)
    rect(p, 330, 260, 540, 54, GREY)
    # button
    rect(p, 880, 260, 70, 54, DKGREY)
    # O ring emblem top-left
    ring(p, 340, 210, 26, 16, WHITE)
    write_png(path, p)

def make_context(path):
    p = blank(ORANGE)
    # page strip
    rect(p, 0, 120, W, 360, GREY)
    # context menu panel
    rect(p, 820, 220, 280, 240, WHITE)
    # menu items
    rect(p, 830, 240, 260, 36, GREY)
    rect(p, 830, 280, 260, 36, GREY)
    # highlighted action
    rect(p, 830, 320, 260, 36, DKGREY)
    rect(p, 830, 360, 260, 36, GREY)
    ring(p, 60, 60, 34, 22, WHITE)
    write_png(path, p)

def make_omnibox(path):
    p = blank(ORANGE)
    # omnibox bar
    rect(p, 80, 60, W-160, 56, WHITE)
    # oe label
    rect(p, 100, 72, 44, 32, DKGREY)
    # query placeholder
    rect(p, 160, 72, 620, 32, GREY)
    ring(p, W-80, 60, 24, 14, WHITE)
    write_png(path, p)

def main():
    outdir = os.path.join(os.path.dirname(__file__), '..', 'screenshots')
    os.makedirs(outdir, exist_ok=True)
    make_popup(os.path.join(outdir, 'screenshot-popup.png'))
    make_context(os.path.join(outdir, 'screenshot-context-menu.png'))
    make_omnibox(os.path.join(outdir, 'screenshot-omnibox.png'))
    print('[gen_screens] Wrote screenshots to', outdir)

if __name__ == '__main__':
    main()

