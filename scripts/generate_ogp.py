#!/usr/bin/env python3
"""Generate ogp.png (1200x630) using only Python standard library."""
import struct
import zlib

W, H = 1200, 630

# Colors
BG   = (13, 13, 13)       # #0d0d0d
TEAL = (0, 212, 184)      # #00d4b8
GRAY = (144, 144, 176)    # #9090b0
WHITE= (240, 240, 240)    # #f0f0f0
CARD = (26, 26, 46)       # #1a1a2e

def rgba(r, g, b, a=255):
    return bytes([r, g, b, a])

def make_row(pixels):
    return b'\x00' + b''.join(pixels)

def png_chunk(name, data):
    c = zlib.crc32(name + data) & 0xffffffff
    return struct.pack('>I', len(data)) + name + data + struct.pack('>I', c)

def encode_png(width, height, rows):
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    raw = b''.join(rows)
    compressed = zlib.compress(raw, 9)
    return (
        b'\x89PNG\r\n\x1a\n'
        + png_chunk(b'IHDR', ihdr)
        + png_chunk(b'IDAT', compressed)
        + png_chunk(b'IEND', b'')
    )

# Build pixel grid
pixels = [[None]*W for _ in range(H)]

def fill_rect(x0, y0, x1, y1, color):
    r, g, b = color
    px = bytes([r, g, b])
    for y in range(max(0,y0), min(H,y1)):
        for x in range(max(0,x0), min(W,x1)):
            pixels[y][x] = px

# Background
fill_rect(0, 0, W, H, BG)

# Subtle teal gradient area top-left
for y in range(H):
    for x in range(W):
        alpha = max(0, 1.0 - (x/W + y/H))  # stronger top-left
        strength = int(alpha * 30)
        r = min(255, BG[0] + strength)
        g = min(255, BG[1] + strength)
        b = min(255, BG[2] + min(strength, 20))
        pixels[y][x] = bytes([r, g, b])

# Card background rectangle (centered)
card_x0, card_y0 = 80, 80
card_x1, card_y1 = W - 80, H - 80
fill_rect(card_x0, card_y0, card_x1, card_y1, CARD)

# Teal accent line at left edge of card
fill_rect(card_x0, card_y0, card_x0 + 6, card_y1, TEAL)

# ---- Text rendering using bitmap font trick ----
# We'll draw simple block characters as pixel patterns

def draw_rect(x0, y0, w, h, color):
    fill_rect(x0, y0, x0+w, y0+h, color)

# "W" logo circle / badge
badge_cx, badge_cy = 160, 200
badge_r = 50
for dy in range(-badge_r, badge_r+1):
    for dx in range(-badge_r, badge_r+1):
        if dx*dx + dy*dy <= badge_r*badge_r:
            y = badge_cy + dy
            x = badge_cx + dx
            if 0 <= y < H and 0 <= x < W:
                pixels[y][x] = bytes(TEAL)

# "W" inside badge (simple pixel art 'W')
def draw_pixel_char_W(ox, oy, scale, color):
    pattern = [
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,1,0,1],
        [1,1,0,1,1],
        [1,0,0,0,1],
    ]
    for row_i, row in enumerate(pattern):
        for col_i, px in enumerate(row):
            if px:
                fill_rect(
                    ox + col_i*scale,
                    oy + row_i*scale,
                    ox + col_i*scale + scale,
                    oy + row_i*scale + scale,
                    color
                )

draw_pixel_char_W(badge_cx - 25, badge_cy - 20, 10, BG)

# Teal accent bar (horizontal line below header area)
fill_rect(card_x0 + 6, card_y0 + 120, card_x1, card_y0 + 124, (0, 80, 70))

# Title area — draw thick block to represent title text (placeholder bars)
# "Whoami Quiz" — large heading area
fill_rect(220, 155, 820, 195, WHITE)   # title bar 1
fill_rect(220, 205, 680, 235, WHITE)   # title bar 2

# Subtext area
fill_rect(220, 270, 750, 290, GRAY)
fill_rect(220, 300, 620, 318, GRAY)

# Score icons / decoration
for i in range(5):
    cx = 220 + i * 120
    cy = 380
    fill_rect(cx, cy, cx+90, cy+40, (30, 30, 55))
    fill_rect(cx, cy, cx+90, cy+5, TEAL)

# Bottom bar
fill_rect(card_x0 + 6, card_y1 - 80, card_x1, card_y1 - 76, (0, 80, 70))
fill_rect(card_x0 + 6, card_y1 - 70, 400, card_y1 - 52, GRAY)

# Finalize rows
rows = []
for y in range(H):
    row_bytes = b'\x00'
    for x in range(W):
        p = pixels[y][x]
        if p is None:
            row_bytes += bytes(BG)
        else:
            row_bytes += p
    rows.append(row_bytes)

png_data = encode_png(W, H, rows)

with open('/Users/matsuzakiyuusuke/Git/whoami/ogp.png', 'wb') as f:
    f.write(png_data)

print(f"ogp.png written: {len(png_data)} bytes")
